// Engineering Change Notice (ECN) workflow + PPAP doc set tracking — deep feature.
//
// PPAP (Production Part Approval Process) levels per AIAG PPAP 4th Edition:
//   Level 1 - Warranty + selected docs
//   Level 2 - Level 1 + product samples + limited supporting data
//   Level 3 - Level 2 + product samples + complete supporting data (DEFAULT for new launches)
//   Level 4 - Level 3 + as required by customer
//   Level 5 - Level 4 + product samples + complete supporting data, on-site review
//
// ECN states: draft -> in_review -> approved | rejected -> implemented
//
// Endpoints:
//   GET    /api/ecn                              List ECNs (with BOM names joined).
//   GET    /api/ecn/:id                          Detail.
//   POST   /api/ecn                              Create.
//   PUT    /api/ecn/:id                          Update editable fields.
//   POST   /api/ecn/:id/submit                   Move draft -> in_review.
//   POST   /api/ecn/:id/approve                  Approve. Sets approved_by/approved_at.
//   POST   /api/ecn/:id/reject                   Reject with reason.
//   POST   /api/ecn/:id/implement                Mark implemented after target_effective_date.
//   GET    /api/ecn/ppap-matrix                  PPAP level vs required docs matrix.
//   GET    /api/ecn/:id/ppap-doc-status          Compute which PPAP docs are present/missing.
//   DELETE /api/ecn/:id                          Hard delete (draft only).

const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const db = require('../db');

router.use(verifyToken);

const PPAP_REQUIRED_DOCS = {
  1: ['WARRANTY'],
  2: ['WARRANTY', 'DIM_REPORT', 'MATERIAL_CERT'],
  3: ['WARRANTY', 'DIM_REPORT', 'MATERIAL_CERT', 'DFMEA', 'PFMEA', 'CONTROL_PLAN', 'PROCESS_FLOW', 'APPEARANCE'],
  4: ['WARRANTY', 'DIM_REPORT', 'MATERIAL_CERT', 'DFMEA', 'PFMEA', 'CONTROL_PLAN', 'PROCESS_FLOW', 'APPEARANCE', 'IMDS'],
  5: ['WARRANTY', 'DIM_REPORT', 'MATERIAL_CERT', 'DFMEA', 'PFMEA', 'CONTROL_PLAN', 'PROCESS_FLOW', 'APPEARANCE', 'IMDS', 'CUSTOMER_AUDIT', 'CAPABILITY_STUDY'],
};

const ECN_STATES = ['draft', 'in_review', 'approved', 'rejected', 'implemented'];

function canTransition(from, to) {
  const allowed = {
    draft: ['in_review'],
    in_review: ['approved', 'rejected', 'draft'],
    approved: ['implemented', 'rejected'],
    rejected: ['draft'],
    implemented: [],
  };
  return (allowed[from] || []).includes(to);
}

router.get('/ppap-matrix', (_req, res) => res.json(PPAP_REQUIRED_DOCS));

router.get('/', async (_req, res) => {
  try {
    const r = await db.query(`
      SELECT e.*, b.product_name, b.revision
      FROM ecns e LEFT JOIN bom_headers b ON b.id = e.bom_id
      ORDER BY e.created_at DESC
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await db.query(`
      SELECT e.*, b.product_name, b.revision
      FROM ecns e LEFT JOIN bom_headers b ON b.id = e.bom_id WHERE e.id=$1`, [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/ppap-doc-status', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM ecns WHERE id=$1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    const ecn = r.rows[0];
    const required = PPAP_REQUIRED_DOCS[ecn.ppap_level] || [];
    const present = (ecn.ppap_required_docs || '').split(',').map(s => s.trim()).filter(Boolean);
    const missing = required.filter(x => !present.includes(x));
    const extras = present.filter(x => !required.includes(x));
    res.json({
      ecn_number: ecn.ecn_number,
      ppap_level: ecn.ppap_level,
      required, present, missing, extras,
      is_complete: missing.length === 0,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const f = req.body || {};
    if (!f.ecn_number || !f.description) return res.status(400).json({ error: 'ecn_number and description required' });
    if (f.ppap_level && ![1, 2, 3, 4, 5].includes(parseInt(f.ppap_level, 10))) {
      return res.status(400).json({ error: 'ppap_level must be 1..5' });
    }
    const r = await db.query(`
      INSERT INTO ecns (ecn_number, bom_id, change_type, description, reason, status, ppap_level,
        ppap_required_docs, initiated_by, target_effective_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [f.ecn_number, f.bom_id, f.change_type, f.description, f.reason, f.status || 'draft',
       f.ppap_level || 3, f.ppap_required_docs || null, f.initiated_by, f.target_effective_date]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'ecn_number already exists' });
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const f = req.body || {};
    const r = await db.query(`
      UPDATE ecns SET bom_id=$1, change_type=$2, description=$3, reason=$4,
        ppap_level=$5, ppap_required_docs=$6, target_effective_date=$7
      WHERE id=$8 RETURNING *`,
      [f.bom_id, f.change_type, f.description, f.reason, f.ppap_level, f.ppap_required_docs, f.target_effective_date, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

async function transition(req, res, toState, extraSets = {}) {
  try {
    const cur = await db.query('SELECT * FROM ecns WHERE id=$1', [req.params.id]);
    if (!cur.rows[0]) return res.status(404).json({ error: 'Not found' });
    if (!canTransition(cur.rows[0].status, toState)) {
      return res.status(409).json({ error: `cannot transition ${cur.rows[0].status} -> ${toState}` });
    }
    const sets = ['status=$1'];
    const vals = [toState];
    let i = 2;
    for (const [k, v] of Object.entries(extraSets)) { sets.push(`${k}=$${i++}`); vals.push(v); }
    vals.push(req.params.id);
    const r = await db.query(`UPDATE ecns SET ${sets.join(', ')} WHERE id=$${i} RETURNING *`, vals);
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

router.post('/:id/submit',    (req, res) => transition(req, res, 'in_review'));
router.post('/:id/approve',   (req, res) => transition(req, res, 'approved', {
  approved_by: req.user?.email || req.body?.approver || 'unknown',
  approved_at: new Date(),
}));
router.post('/:id/reject',    (req, res) => transition(req, res, 'rejected'));
router.post('/:id/implement', async (req, res) => {
  try {
    const cur = await db.query('SELECT * FROM ecns WHERE id=$1', [req.params.id]);
    if (!cur.rows[0]) return res.status(404).json({ error: 'Not found' });
    if (cur.rows[0].status !== 'approved') return res.status(409).json({ error: 'Only approved ECNs can be implemented' });
    // Check PPAP completeness
    const required = PPAP_REQUIRED_DOCS[cur.rows[0].ppap_level] || [];
    const present = (cur.rows[0].ppap_required_docs || '').split(',').map(s => s.trim()).filter(Boolean);
    const missing = required.filter(x => !present.includes(x));
    if (missing.length && !req.body?.force) {
      return res.status(409).json({ error: 'PPAP incomplete', missing_docs: missing });
    }
    const r = await db.query("UPDATE ecns SET status='implemented' WHERE id=$1 RETURNING *", [req.params.id]);
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const cur = await db.query('SELECT status FROM ecns WHERE id=$1', [req.params.id]);
    if (!cur.rows[0]) return res.status(404).json({ error: 'Not found' });
    if (cur.rows[0].status !== 'draft') return res.status(409).json({ error: 'Only drafts can be deleted' });
    await db.query('DELETE FROM ecns WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
