const router = require('express').Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const r = await db.query(`
      SELECT qc.*, p.name as part_name, p.part_number, o.tracking_number
      FROM quality_checks qc
      LEFT JOIN parts p ON qc.part_id = p.id
      LEFT JOIN orders o ON qc.order_id = o.id
      ORDER BY qc.check_date DESC
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const r = await db.query(`
      SELECT qc.*, p.name as part_name, p.part_number
      FROM quality_checks qc
      LEFT JOIN parts p ON qc.part_id = p.id
      WHERE qc.id=$1`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', verifyToken, async (req, res) => {
  const { part_id, order_id, inspector, pass, defect_rate, sample_size, notes, check_date, failure_modes, corrective_action } = req.body;
  try {
    const r = await db.query(
      'INSERT INTO quality_checks (part_id,order_id,inspector,pass,defect_rate,sample_size,notes,check_date,failure_modes,corrective_action) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [part_id, order_id || null, inspector, pass, defect_rate, sample_size, notes, check_date, failure_modes, corrective_action]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { part_id, order_id, inspector, pass, defect_rate, sample_size, notes, check_date, failure_modes, corrective_action } = req.body;
  try {
    const r = await db.query(
      'UPDATE quality_checks SET part_id=$1,order_id=$2,inspector=$3,pass=$4,defect_rate=$5,sample_size=$6,notes=$7,check_date=$8,failure_modes=$9,corrective_action=$10 WHERE id=$11 RETURNING *',
      [part_id, order_id || null, inspector, pass, defect_rate, sample_size, notes, check_date, failure_modes, corrective_action, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM quality_checks WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
