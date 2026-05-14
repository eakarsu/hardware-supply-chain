const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  try {
    const r = await db.query(`
      SELECT o.*, p.name as part_name, p.part_number, s.name as supplier_name
      FROM orders o
      LEFT JOIN parts p ON o.part_id = p.id
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      ORDER BY o.ordered_at DESC
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const r = await db.query(`
      SELECT o.*, p.name as part_name, p.part_number, s.name as supplier_name
      FROM orders o
      LEFT JOIN parts p ON o.part_id = p.id
      LEFT JOIN suppliers s ON o.supplier_id = s.id
      WHERE o.id=$1`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', verifyToken, async (req, res) => {
  const { part_id, supplier_id, quantity, unit_price, total_cost, status, expected_by, tracking_number, notes } = req.body;
  try {
    const r = await db.query(
      'INSERT INTO orders (part_id,supplier_id,quantity,unit_price,total_cost,status,expected_by,tracking_number,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [part_id, supplier_id, quantity, unit_price, total_cost || (quantity * unit_price), status || 'pending', expected_by, tracking_number, notes]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', verifyToken, async (req, res) => {
  const { part_id, supplier_id, quantity, unit_price, total_cost, status, expected_by, received_at, tracking_number, notes } = req.body;
  try {
    const r = await db.query(
      'UPDATE orders SET part_id=$1,supplier_id=$2,quantity=$3,unit_price=$4,total_cost=$5,status=$6,expected_by=$7,received_at=$8,tracking_number=$9,notes=$10 WHERE id=$11 RETURNING *',
      [part_id, supplier_id, quantity, unit_price, total_cost, status, expected_by, received_at, tracking_number, notes, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM orders WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
