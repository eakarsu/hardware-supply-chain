// AQL (Acceptable Quality Limit) inspection plans — deep feature.
//
// Implements ISO 2859-1 single-sampling plan lookup:
//   - General Inspection Level II (default), Levels I/III, Special S-1..S-4 (subset).
//   - Code letter from lot-size range.
//   - Sample size + Accept/Reject from (code letter, AQL %).
//
// Endpoints:
//   GET    /api/aql/plans                                       Full plan table.
//   GET    /api/aql/lookup?lot=2000&aql=1.0&level=II            Pick the matching plan row.
//   GET    /api/aql/lookup?lot=2000&aql=1.0&level=II&type=tightened  Switch plan_type.
//   POST   /api/aql/inspection                                  Record a new inspection observation.
//   PUT    /api/aql/inspection/:id                              Update.
//   GET    /api/aql/inspection                                  List recent inspections.
//   GET    /api/aql/inspection/:id                              Detail.
//   GET    /api/aql/inspection/order/:orderId                   Inspections for an order.
//   DELETE /api/aql/inspection/:id                              Delete.
//   POST   /api/aql/run                                         Compute decision: returns accept/reject given lot, AQL, defects.

const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../db');

router.use(verifyToken);

router.get('/plans', async (_req, res) => {
  try {
    const r = await db.query(
      'SELECT * FROM aql_plans ORDER BY plan_type, lot_size_min, aql_pct'
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/lookup', async (req, res) => {
  try {
    const lot = parseInt(req.query.lot, 10);
    const aql = parseFloat(req.query.aql);
    const level = req.query.level || 'II';
    const type = req.query.type || 'normal';
    if (!Number.isFinite(lot) || !Number.isFinite(aql)) {
      return res.status(400).json({ error: 'lot (int) and aql (float) query params required' });
    }
    const r = await db.query(`
      SELECT * FROM aql_plans
      WHERE plan_type=$1 AND inspection_level=$2
        AND $3 BETWEEN lot_size_min AND lot_size_max
        AND aql_pct=$4
      LIMIT 1`,
      [type, level, lot, aql]
    );
    if (!r.rows[0]) {
      // Fallback: find any plan matching lot+level then closest aql_pct.
      const range = await db.query(`
        SELECT * FROM aql_plans
        WHERE plan_type=$1 AND inspection_level=$2
          AND $3 BETWEEN lot_size_min AND lot_size_max
        ORDER BY ABS(aql_pct - $4) ASC
        LIMIT 1`,
        [type, level, lot, aql]
      );
      if (!range.rows[0]) return res.status(404).json({ error: 'No matching plan' });
      return res.json({ matched: range.rows[0], fallback: 'closest_aql' });
    }
    res.json({ matched: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/run', async (req, res) => {
  try {
    const lot = parseInt(req.body?.lot, 10);
    const aql = parseFloat(req.body?.aql);
    const level = req.body?.level || 'II';
    const type = req.body?.type || 'normal';
    const defects = parseInt(req.body?.defects, 10);
    if (!Number.isFinite(lot) || !Number.isFinite(aql) || !Number.isFinite(defects)) {
      return res.status(400).json({ error: 'lot, aql, defects required' });
    }
    const r = await db.query(`
      SELECT * FROM aql_plans
      WHERE plan_type=$1 AND inspection_level=$2 AND $3 BETWEEN lot_size_min AND lot_size_max AND aql_pct=$4
      LIMIT 1`,
      [type, level, lot, aql]
    );
    let plan = r.rows[0];
    let fallback = null;
    if (!plan) {
      const fb = await db.query(`
        SELECT * FROM aql_plans
        WHERE plan_type=$1 AND inspection_level=$2 AND $3 BETWEEN lot_size_min AND lot_size_max
        ORDER BY ABS(aql_pct - $4) ASC LIMIT 1`,
        [type, level, lot, aql]);
      if (!fb.rows[0]) return res.status(404).json({ error: 'No plan' });
      plan = fb.rows[0];
      fallback = 'closest_aql';
    }
    const decision = defects <= plan.accept ? 'accept' : 'reject';
    res.json({
      plan,
      fallback,
      defects,
      decision,
      reason: decision === 'accept'
        ? `${defects} defects <= accept threshold ${plan.accept} (sample size ${plan.sample_size})`
        : `${defects} defects >= reject threshold ${plan.reject} (sample size ${plan.sample_size})`,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/inspection', async (_req, res) => {
  try {
    const r = await db.query(`
      SELECT i.*, p.lot_size_min, p.lot_size_max, p.aql_pct, p.inspection_level, p.code_letter,
             p.accept AS plan_accept, p.reject AS plan_reject, p.plan_type
      FROM aql_inspections i LEFT JOIN aql_plans p ON p.id = i.plan_id
      ORDER BY i.inspected_at DESC`);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/inspection/order/:orderId', async (req, res) => {
  try {
    const r = await db.query(
      'SELECT * FROM aql_inspections WHERE order_id=$1 ORDER BY inspected_at DESC',
      [req.params.orderId]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/inspection/:id', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM aql_inspections WHERE id=$1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/inspection', async (req, res) => {
  try {
    const f = req.body || {};
    if (!f.lot_size || !f.defects_found === undefined) {
      return res.status(400).json({ error: 'lot_size and defects_found required' });
    }
    // If no plan_id provided, look one up from lot + aql.
    let planId = f.plan_id;
    let sampleSize = f.sample_size;
    let decision = f.decision;
    if (!planId && f.aql) {
      const plan = await db.query(`
        SELECT * FROM aql_plans
        WHERE plan_type=$1 AND inspection_level=$2 AND $3 BETWEEN lot_size_min AND lot_size_max AND aql_pct=$4
        LIMIT 1`,
        [f.plan_type || 'normal', f.level || 'II', f.lot_size, f.aql]);
      if (plan.rows[0]) {
        planId = plan.rows[0].id;
        sampleSize = sampleSize || plan.rows[0].sample_size;
        decision = decision || (f.defects_found <= plan.rows[0].accept ? 'accept' : 'reject');
      }
    }
    const r = await db.query(`
      INSERT INTO aql_inspections (order_id, plan_id, lot_size, sample_size, defects_found, decision, inspector, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [f.order_id, planId, f.lot_size, sampleSize, f.defects_found, decision || 'accept', f.inspector, f.notes]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/inspection/:id', async (req, res) => {
  try {
    const f = req.body;
    const r = await db.query(`
      UPDATE aql_inspections SET order_id=$1, plan_id=$2, lot_size=$3, sample_size=$4, defects_found=$5,
        decision=$6, inspector=$7, notes=$8 WHERE id=$9 RETURNING *`,
      [f.order_id, f.plan_id, f.lot_size, f.sample_size, f.defects_found, f.decision, f.inspector, f.notes, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/inspection/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM aql_inspections WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
