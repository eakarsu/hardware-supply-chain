const test = require('node:test');
const assert = require('node:assert/strict');
const {
  payloadHash, requireUnit, transitionLot, inspectionDecision,
  planSupply, approveOverride, rollbackPlan, replanSupply,
} = require('../domain/workflow');

const now = new Date('2026-07-20T12:00:00Z');
const requirement = [{ partId: 1, quantity: 10, unit: 'EA' }];
const offer = (overrides = {}) => ({
  partId: 1, supplierId: 's1', unit: 'EA', availableQuantity: 10,
  unitCostCents: 100, leadTimeDays: 5, observedAt: '2026-07-20T11:30:00Z',
  authoritative: true, sourceEventId: 1, ...overrides,
});

test('duplicate event bodies have stable hashes and substitutions do not', () => {
  assert.equal(payloadHash({ b: 2, a: 1 }), payloadHash({ a: 1, b: 2 }));
  assert.notEqual(payloadHash({ a: 1 }), payloadHash({ a: 2 }));
});

test('units are exact and lot transitions are constrained', () => {
  assert.throws(() => requireUnit('KG', 'EA'), { code: 'UNIT_MISMATCH' });
  assert.equal(transitionLot('quarantined', 'released'), 'released');
  assert.throws(() => transitionLot('received', 'consumed'), { code: 'INVALID_TRANSITION' });
});

test('AQL decisions are deterministic', () => {
  assert.equal(inspectionDecision({ sampleSize: 80, defectsFound: 1, acceptAt: 1, rejectAt: 3 }), 'accepted');
  assert.equal(inspectionDecision({ sampleSize: 80, defectsFound: 2, acceptAt: 1, rejectAt: 3 }), 'retest');
  assert.equal(inspectionDecision({ sampleSize: 80, defectsFound: 3, acceptAt: 1, rejectAt: 3 }), 'rejected');
});

test('disrupted supply is excluded and reported as a shortage', () => {
  const plan = planSupply({ requirements: requirement, offers: [offer()], disruptions: [{ supplierId: 's1', active: true }], now });
  assert.equal(plan.status, 'BLOCKED');
  assert.deepEqual(plan.shortages, [{ partId: 1, quantity: 10, unit: 'EA' }]);
});

test('late telemetry lowers confidence and cannot allocate inventory', () => {
  const plan = planSupply({ requirements: requirement, offers: [offer({ observedAt: '2026-07-20T08:00:00Z' })], now });
  assert.equal(plan.status, 'BLOCKED');
  assert.equal(plan.confidence, 'LOW');
  assert.equal(plan.uncertainty[0].reason, 'late_telemetry');
});

test('planner is deterministic and human override needs independent approval', () => {
  const plan = planSupply({ requirements: requirement, offers: [offer({ supplierId: 'b', unitCostCents: 90 }), offer({ supplierId: 'a', unitCostCents: 90 })], now });
  assert.equal(plan.allocations[0].supplierId, 'a');
  assert.throws(() => approveOverride(plan, { proposedBy: 'p', approvedBy: 'p', reason: 'valid reason', allocations: [] }), /independent/);
  assert.equal(approveOverride(plan, { proposedBy: 'p', approvedBy: 'a', reason: 'manual source approval', allocations: [] }).status, 'APPROVED');
});

test('applied plans can be rolled back and replanned with lineage', () => {
  const applied = { ...planSupply({ requirements: requirement, offers: [offer()], now }), status: 'APPLIED' };
  const rolledBack = rollbackPlan(applied, 'supplier disruption');
  assert.equal(rolledBack.compensatingReleases[0].quantity, -10);
  const replacement = replanSupply(42, 'supplier disruption', {
    requirements: requirement, offers: [offer({ supplierId: 's2' })], now,
  });
  assert.equal(replacement.parentPlanId, 42);
  assert.equal(replacement.allocations[0].supplierId, 's2');
});
