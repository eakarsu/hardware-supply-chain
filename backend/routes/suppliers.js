const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM suppliers ORDER BY name');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM suppliers WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', verifyToken, async (req, res) => {
  const { name, country, city, contact_email, contact_phone, lead_time_days, reliability_score, min_order_qty, payment_terms, certifications, active, joined_date } = req.body;
  try {
    const r = await db.query(
      'INSERT INTO suppliers (name,country,city,contact_email,contact_phone,lead_time_days,reliability_score,min_order_qty,payment_terms,certifications,active,joined_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *',
      [name, country, city, contact_email, contact_phone, lead_time_days, reliability_score, min_order_qty, payment_terms, certifications, active !== false, joined_date]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { name, country, city, contact_email, contact_phone, lead_time_days, reliability_score, min_order_qty, payment_terms, certifications, active, joined_date } = req.body;
  try {
    const r = await db.query(
      'UPDATE suppliers SET name=$1,country=$2,city=$3,contact_email=$4,contact_phone=$5,lead_time_days=$6,reliability_score=$7,min_order_qty=$8,payment_terms=$9,certifications=$10,active=$11,joined_date=$12 WHERE id=$13 RETURNING *',
      [name, country, city, contact_email, contact_phone, lead_time_days, reliability_score, min_order_qty, payment_terms, certifications, active, joined_date, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM suppliers WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
