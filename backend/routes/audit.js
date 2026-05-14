const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
  const { action, entity_type, limit } = req.query;
  const lim = Math.min(parseInt(limit) || 100, 500);
  const conds = [];
  const params = [];
  if (action) { params.push(action); conds.push(`action = $${params.length}`); }
  if (entity_type) { params.push(entity_type); conds.push(`entity_type = $${params.length}`); }
  params.push(lim);
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  try {
    const r = await db.query(
      `SELECT * FROM audit_log ${where} ORDER BY created_at DESC LIMIT $${params.length}`,
      params
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { action, entity_type, entity_id, details } = req.body;
  if (!action) return res.status(400).json({ error: 'action required' });
  try {
    const r = await db.query(
      'INSERT INTO audit_log (user_id, user_email, action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.user?.id || null, req.user?.email || null, action, entity_type || null, entity_id || null, details || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
