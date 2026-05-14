const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM parts ORDER BY created_at DESC');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM parts WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', verifyToken, async (req, res) => {
  const { name, part_number, description, material, category, unit_cost, weight_grams, lead_time_days, status, in_stock, reorder_threshold } = req.body;
  try {
    const r = await db.query(
      'INSERT INTO parts (name,part_number,description,material,category,unit_cost,weight_grams,lead_time_days,status,in_stock,reorder_threshold) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',
      [name, part_number, description, material, category, unit_cost, weight_grams, lead_time_days, status, in_stock || 0, reorder_threshold || 10]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { name, part_number, description, material, category, unit_cost, weight_grams, lead_time_days, status, in_stock, reorder_threshold } = req.body;
  try {
    const r = await db.query(
      'UPDATE parts SET name=$1,part_number=$2,description=$3,material=$4,category=$5,unit_cost=$6,weight_grams=$7,lead_time_days=$8,status=$9,in_stock=$10,reorder_threshold=$11 WHERE id=$12 RETURNING *',
      [name, part_number, description, material, category, unit_cost, weight_grams, lead_time_days, status, in_stock, reorder_threshold, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM parts WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
