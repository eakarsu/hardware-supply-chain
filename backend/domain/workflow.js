const crypto = require('crypto');

const LOT_TRANSITIONS = {
  expected: ['received'],
  received: ['quarantined'],
  quarantined: ['released', 'rejected'],
  released: ['consumed', 'quarantined'],
  rejected: [],
  consumed: [],
};

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function payloadHash(value) {
  return crypto.createHash('sha256').update(canonical(value)).digest('hex');
}

function requireUnit(actual, expected) {
  if (actual !== expected) {
    const error = new Error(`unit mismatch: expected ${expected}, received ${actual}`);
    error.code = 'UNIT_MISMATCH';
    throw error;
  }
}

function transitionLot(current, next) {
  if (!(LOT_TRANSITIONS[current] || []).includes(next)) {
    const error = new Error(`invalid lot transition ${current} -> ${next}`);
    error.code = 'INVALID_TRANSITION';
    throw error;
  }
  return next;
}

function inspectionDecision({ sampleSize, defectsFound, acceptAt, rejectAt }) {
  for (const value of [sampleSize, defectsFound, acceptAt, rejectAt]) {
    if (!Number.isInteger(value) || value < 0) throw new Error('inspection values must be non-negative integers');
  }
  if (sampleSize === 0 || defectsFound > sampleSize || acceptAt >= rejectAt) throw new Error('invalid inspection plan or result');
  if (defectsFound <= acceptAt) return 'accepted';
  if (defectsFound >= rejectAt) return 'rejected';
  return 'retest';
}

function planSupply({ requirements, offers, disruptions = [], now = new Date(), maxTelemetryAgeMinutes = 120 }) {
  const disrupted = new Set(disruptions.filter(x => x.active).map(x => x.supplierId));
  const allocations = [];
  const shortages = [];
  const uncertainty = [];
  for (const requirement of requirements) {
    if (!Number.isFinite(requirement.quantity) || requirement.quantity <= 0) throw new Error('requirement quantity must be positive');
    const candidates = offers.filter(offer => {
      if (offer.partId !== requirement.partId) return false;
      requireUnit(offer.unit, requirement.unit);
      const observed = new Date(offer.observedAt);
      const ageMinutes = (now - observed) / 60000;
      if (!Number.isFinite(ageMinutes) || ageMinutes < 0) throw new Error('invalid telemetry timestamp');
      if (ageMinutes > maxTelemetryAgeMinutes) uncertainty.push({ partId: requirement.partId, supplierId: offer.supplierId, reason: 'late_telemetry', ageMinutes });
      return offer.authoritative === true && !disrupted.has(offer.supplierId) && ageMinutes <= maxTelemetryAgeMinutes;
    }).sort((a, b) => a.unitCostCents - b.unitCostCents || a.leadTimeDays - b.leadTimeDays || String(a.supplierId).localeCompare(String(b.supplierId)));
    let remaining = requirement.quantity;
    for (const offer of candidates) {
      const usable = Math.max(0, Math.floor(offer.availableQuantity));
      if (!usable || remaining === 0) continue;
      const quantity = Math.min(remaining, usable);
      allocations.push({ partId: requirement.partId, supplierId: offer.supplierId, quantity, unit: requirement.unit, unitCostCents: offer.unitCostCents, leadTimeDays: offer.leadTimeDays });
      remaining -= quantity;
    }
    if (remaining) shortages.push({ partId: requirement.partId, quantity: remaining, unit: requirement.unit });
  }
  const totalCostCents = allocations.reduce((sum, item) => sum + item.quantity * item.unitCostCents, 0);
  return {
    status: shortages.length ? 'BLOCKED' : 'PROPOSED', allocations, shortages, totalCostCents,
    uncertainty, confidence: uncertainty.length ? 'LOW' : 'HIGH',
    safetyRules: ['authoritative_sources_only', 'exact_units_only', 'fresh_telemetry_only', 'disrupted_suppliers_excluded'],
  };
}

function approveOverride(plan, { proposedBy, approvedBy, reason, allocations }) {
  if (!reason || reason.trim().length < 8) throw new Error('override reason must contain at least 8 characters');
  if (String(proposedBy) === String(approvedBy)) throw new Error('override requires independent approval');
  return { ...plan, status: 'APPROVED', allocations, override: { proposedBy, approvedBy, reason: reason.trim() } };
}

function rollbackPlan(plan, reason) {
  if (plan.status !== 'APPLIED') throw new Error('only applied plans can be rolled back');
  if (!reason || reason.trim().length < 8) throw new Error('rollback reason is required');
  return { ...plan, status: 'ROLLED_BACK', rollbackReason: reason.trim(), compensatingReleases: plan.allocations.map(x => ({ ...x, quantity: -x.quantity })) };
}

function replanSupply(parentPlanId, reason, input) {
  if (!parentPlanId || !reason || reason.trim().length < 8) throw new Error('replanning requires a parent plan and reason');
  return { ...planSupply(input), parentPlanId, replanReason: reason.trim() };
}

module.exports = { payloadHash, requireUnit, transitionLot, inspectionDecision, planSupply, approveOverride, rollbackPlan, replanSupply };
