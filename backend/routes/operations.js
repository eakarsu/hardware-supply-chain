const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');
const {
  payloadHash, requireUnit, transitionLot, inspectionDecision,
  planSupply, approveOverride, rollbackPlan,
} = require('../domain/workflow');

router.use(verifyToken);

const EVENT_KINDS = {
  'bom.snapshot': 'bom', 'supplier.snapshot': 'supplier',
  'inventory.received': 'inventory', 'inventory.telemetry': 'inventory',
  'quality.inspected': 'quality', 'schedule.updated': 'schedule',
  'telemetry.updated': 'telemetry', 'work_order.updated': 'work_order',
};

function actor(req) { return req.user.email || String(req.user.id); }
function fail(res, error) {
  const known = ['UNIT_MISMATCH', 'INVALID_TRANSITION'];
  return res.status(known.includes(error.code) ? 409 : 422).json({ error: error.message, code: error.code || 'INVALID_REQUEST' });
}

router.post('/sources', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'admin role required' });
  const { name, kind, authoritative = false } = req.body || {};
  try {
    const result = await db.query(
      'INSERT INTO source_systems(name,kind,authoritative) VALUES($1,$2,$3) RETURNING *',
      [name, kind, authoritative]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { fail(res, error); }
});

router.post('/events', async (req, res) => {
  const { sourceId, eventId, eventType, occurredAt, payload } = req.body || {};
  if (!sourceId || !eventId || !eventType || !occurredAt || !payload) return res.status(400).json({ error: 'sourceId, eventId, eventType, occurredAt, and payload are required' });
  const hash = payloadHash(payload);
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const prior = await client.query('SELECT * FROM ingest_events WHERE source_id=$1 AND event_id=$2 FOR UPDATE', [sourceId, eventId]);
    if (prior.rows[0]) {
      if (prior.rows[0].payload_hash.trim() !== hash) {
        await client.query('ROLLBACK');
        return res.status(409).json({ error: 'event ID reused with different payload', code: 'REPLAY_MISMATCH' });
      }
      await client.query('COMMIT');
      return res.json(prior.rows[0].result);
    }
    const source = await client.query('SELECT * FROM source_systems WHERE id=$1 AND active=TRUE', [sourceId]);
    if (!source.rows[0]) throw new Error('active source not found');
    if (!EVENT_KINDS[eventType] || source.rows[0].kind !== EVENT_KINDS[eventType]) throw new Error('event type does not match source kind');
    const occurred = new Date(occurredAt);
    if (Number.isNaN(occurred.getTime()) || occurred > new Date()) throw new Error('occurredAt must be a valid past timestamp');
    let result = { accepted: true, eventId };
    if (eventType === 'inventory.received') {
      if (source.rows[0].kind !== 'inventory' || !source.rows[0].authoritative) throw new Error('inventory event requires an authoritative inventory source');
      requireUnit(payload.unit, 'EA');
      if (!Number.isInteger(payload.quantity) || payload.quantity <= 0) throw new Error('quantity must be a positive integer');
      const lot = await client.query(
        `INSERT INTO inventory_lots(part_id,supplier_id,lot_code,quantity,unit,status)
         VALUES($1,$2,$3,$4,$5,'received') RETURNING *`,
        [payload.partId, payload.supplierId || null, payload.lotCode, payload.quantity, payload.unit]
      );
      await client.query(
        `INSERT INTO lot_events(lot_id,sequence,from_status,to_status,actor,reason,idempotency_key)
         VALUES($1,1,'expected','received',$2,'authoritative inventory receipt',$3)`,
        [lot.rows[0].id, actor(req), `ingest:${sourceId}:${eventId}`]
      );
      result = { accepted: true, eventId, lot: lot.rows[0] };
    }
    await client.query(
      `INSERT INTO ingest_events(source_id,event_id,event_type,occurred_at,payload,payload_hash,status,result)
       VALUES($1,$2,$3,$4,$5,$6,'accepted',$7)`,
      [sourceId, eventId, eventType, occurred, payload, hash, result]
    );
    await client.query('COMMIT');
    res.status(202).json(result);
  } catch (error) {
    await client.query('ROLLBACK');
    fail(res, error);
  } finally { client.release(); }
});

router.post('/lots/:id/inspect', async (req, res) => {
  const { expectedVersion, sampleSize, defectsFound, acceptAt, rejectAt, idempotencyKey } = req.body || {};
  const client = await db.connect();
  try {
    const decision = inspectionDecision({ sampleSize, defectsFound, acceptAt, rejectAt });
    await client.query('BEGIN');
    const lotResult = await client.query('SELECT * FROM inventory_lots WHERE id=$1 FOR UPDATE', [req.params.id]);
    const lot = lotResult.rows[0];
    if (!lot) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'lot not found' }); }
    if (lot.version !== expectedVersion) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'version conflict', currentVersion: lot.version }); }
    if (lot.status === 'received') transitionLot('received', 'quarantined');
    else if (lot.status !== 'quarantined') transitionLot(lot.status, 'quarantined');
    const finalStatus = decision === 'accepted' ? 'released' : decision === 'rejected' ? 'rejected' : 'quarantined';
    const sequenceResult = await client.query('SELECT COALESCE(MAX(sequence),0) + 1 AS sequence FROM lot_events WHERE lot_id=$1', [lot.id]);
    const sequence = Number(sequenceResult.rows[0].sequence);
    await client.query(
      `INSERT INTO inspection_records(lot_id,sample_size,defects_found,accept_at,reject_at,decision,inspector)
       VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [lot.id, sampleSize, defectsFound, acceptAt, rejectAt, decision, actor(req)]
    );
    await client.query(
      `INSERT INTO lot_events(lot_id,sequence,from_status,to_status,actor,reason,idempotency_key)
       VALUES($1,$2,$3,$4,$5,$6,$7)`,
      [lot.id, sequence, lot.status, finalStatus, actor(req), `AQL result: ${decision}`, idempotencyKey]
    );
    const updated = await client.query(
      'UPDATE inventory_lots SET status=$1,version=version+1,updated_at=NOW() WHERE id=$2 RETURNING *',
      [finalStatus, lot.id]
    );
    await client.query('COMMIT');
    res.json({ lot: updated.rows[0], decision });
  } catch (error) { await client.query('ROLLBACK'); fail(res, error); }
  finally { client.release(); }
});

router.post('/plans', async (req, res) => {
  const { idempotencyKey, requirements, offers, disruptions = [], maxTelemetryAgeMinutes = 120 } = req.body || {};
  try {
    const prior = await db.query('SELECT * FROM supply_plans WHERE idempotency_key=$1', [idempotencyKey]);
    if (prior.rows[0]) return res.json(prior.rows[0]);
    const eventIds = [...new Set((offers || []).map(x => x.sourceEventId))];
    if (!idempotencyKey || !Array.isArray(requirements) || !Array.isArray(offers) || !offers.length || eventIds.some(id => !Number.isInteger(id))) {
      return res.status(400).json({ error: 'idempotencyKey, requirements, and offers with integer sourceEventId values are required' });
    }
    const evidence = await db.query(
      `SELECT e.id,e.payload_hash FROM ingest_events e JOIN source_systems s ON s.id=e.source_id
       WHERE e.id = ANY($1::bigint[]) AND e.status='accepted' AND s.authoritative=TRUE`,
      [eventIds]
    );
    if (evidence.rowCount !== eventIds.length) return res.status(409).json({ error: 'every offer must cite an accepted authoritative source event' });
    const evidenceHashes = new Map(evidence.rows.map(row => [Number(row.id), row.payload_hash.trim()]));
    const verifiedOffers = offers.map(offer => {
      const payload = { ...offer };
      delete payload.sourceEventId;
      delete payload.authoritative;
      if (evidenceHashes.get(offer.sourceEventId) !== payloadHash(payload)) throw new Error('offer does not match its authoritative source event payload');
      return { ...payload, sourceEventId: offer.sourceEventId, authoritative: true };
    });
    const output = planSupply({ requirements, offers: verifiedOffers, disruptions, maxTelemetryAgeMinutes });
    const inserted = await db.query(
      `INSERT INTO supply_plans(idempotency_key,status,inputs,output,uncertainty,proposed_by)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [idempotencyKey, output.status, { requirements, offers: verifiedOffers, disruptions, eventIds }, output, output.uncertainty, actor(req)]
    );
    res.status(201).json(inserted.rows[0]);
  } catch (error) { fail(res, error); }
});

router.post('/plans/:id/override', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT * FROM supply_plans WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!current.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'plan not found' }); }
    const approved = approveOverride(current.rows[0].output, {
      proposedBy: current.rows[0].proposed_by, approvedBy: actor(req), reason: req.body.reason,
      allocations: req.body.allocations,
    });
    const updated = await client.query(
      `UPDATE supply_plans SET status='APPROVED',output=$1,approved_by=$2,override_reason=$3,version=version+1
       WHERE id=$4 RETURNING *`, [approved, actor(req), req.body.reason, req.params.id]
    );
    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (error) { await client.query('ROLLBACK'); fail(res, error); }
  finally { client.release(); }
});

router.post('/plans/:id/apply', async (req, res) => {
  const result = await db.query(
    `UPDATE supply_plans SET status='APPLIED',version=version+1 WHERE id=$1 AND status IN ('PROPOSED','APPROVED') RETURNING *`,
    [req.params.id]
  );
  if (!result.rows[0]) return res.status(409).json({ error: 'only proposed or approved plans can be applied' });
  res.json(result.rows[0]);
});

router.post('/plans/:id/rollback', async (req, res) => {
  const current = await db.query('SELECT * FROM supply_plans WHERE id=$1', [req.params.id]);
  if (!current.rows[0]) return res.status(404).json({ error: 'plan not found' });
  try {
    const output = rollbackPlan({ ...current.rows[0].output, status: current.rows[0].status }, req.body.reason);
    const result = await db.query(
      `UPDATE supply_plans SET status='ROLLED_BACK',output=$1,override_reason=$2,version=version+1 WHERE id=$3 AND status='APPLIED' RETURNING *`,
      [output, req.body.reason, req.params.id]
    );
    if (!result.rows[0]) return res.status(409).json({ error: 'concurrent plan state change' });
    res.json(result.rows[0]);
  } catch (error) { fail(res, error); }
});

router.get('/lots/:id/trace', async (req, res) => {
  const lot = await db.query('SELECT * FROM inventory_lots WHERE id=$1', [req.params.id]);
  if (!lot.rows[0]) return res.status(404).json({ error: 'lot not found' });
  const events = await db.query('SELECT * FROM lot_events WHERE lot_id=$1 ORDER BY sequence', [req.params.id]);
  const inspections = await db.query('SELECT * FROM inspection_records WHERE lot_id=$1 ORDER BY created_at', [req.params.id]);
  res.json({ lot: lot.rows[0], events: events.rows, inspections: inspections.rows });
});

module.exports = router;
