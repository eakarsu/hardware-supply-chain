const router = require('express').Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const r = await db.query(`
      SELECT i.*, p.name as part_name, p.part_number
      FROM iterations i
      LEFT JOIN parts p ON i.part_id = p.id
      ORDER BY i.started_at DESC
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const r = await db.query(`
      SELECT i.*, p.name as part_name, p.part_number
      FROM iterations i
      LEFT JOIN parts p ON i.part_id = p.id
      WHERE i.id=$1`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', verifyToken, async (req, res) => {
  const { part_id, version, changes, engineer, started_at, completed_at, success, iteration_hours, cad_file_url, notes } = req.body;
  try {
    const r = await db.query(
      'INSERT INTO iterations (part_id,version,changes,engineer,started_at,completed_at,success,iteration_hours,cad_file_url,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [part_id, version, changes, engineer, started_at, completed_at, success, iteration_hours, cad_file_url, notes]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { part_id, version, changes, engineer, started_at, completed_at, success, iteration_hours, cad_file_url, notes } = req.body;
  try {
    const r = await db.query(
      'UPDATE iterations SET part_id=$1,version=$2,changes=$3,engineer=$4,started_at=$5,completed_at=$6,success=$7,iteration_hours=$8,cad_file_url=$9,notes=$10 WHERE id=$11 RETURNING *',
      [part_id, version, changes, engineer, started_at, completed_at, success, iteration_hours, cad_file_url, notes, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM iterations WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
