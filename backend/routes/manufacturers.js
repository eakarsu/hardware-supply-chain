const router = require('express').Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM manufacturers ORDER BY rating DESC');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM manufacturers WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', verifyToken, async (req, res) => {
  const { name, location, country, capacity_per_day, specialization, rating, certifications, min_run, turnaround_days, contact } = req.body;
  try {
    const r = await db.query(
      'INSERT INTO manufacturers (name,location,country,capacity_per_day,specialization,rating,certifications,min_run,turnaround_days,contact) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [name, location, country, capacity_per_day, specialization, rating, certifications, min_run, turnaround_days, contact]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { name, location, country, capacity_per_day, specialization, rating, certifications, min_run, turnaround_days, contact } = req.body;
  try {
    const r = await db.query(
      'UPDATE manufacturers SET name=$1,location=$2,country=$3,capacity_per_day=$4,specialization=$5,rating=$6,certifications=$7,min_run=$8,turnaround_days=$9,contact=$10 WHERE id=$11 RETURNING *',
      [name, location, country, capacity_per_day, specialization, rating, certifications, min_run, turnaround_days, contact, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM manufacturers WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
