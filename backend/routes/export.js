const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

const ENTITIES = {
  parts: 'SELECT * FROM parts ORDER BY created_at DESC',
  suppliers: 'SELECT * FROM suppliers ORDER BY name',
  orders: `SELECT o.*, p.name as part_name, p.part_number, s.name as supplier_name
           FROM orders o
           LEFT JOIN parts p ON o.part_id = p.id
           LEFT JOIN suppliers s ON o.supplier_id = s.id
           ORDER BY o.ordered_at DESC`,
  iterations: `SELECT i.*, p.name as part_name, p.part_number FROM iterations i
               LEFT JOIN parts p ON i.part_id = p.id
               ORDER BY i.started_at DESC NULLS LAST`,
  quality: `SELECT q.*, p.name as part_name, p.part_number FROM quality_checks q
            LEFT JOIN parts p ON q.part_id = p.id
            ORDER BY q.check_date DESC NULLS LAST`,
  manufacturers: 'SELECT * FROM manufacturers ORDER BY name',
};

function toCSV(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = (v instanceof Date) ? v.toISOString() : String(v);
    if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const header = cols.join(',');
  const body = rows.map(r => cols.map(c => escape(r[c])).join(',')).join('\n');
  return header + '\n' + body;
}

router.get('/:entity', verifyToken, async (req, res) => {
  const sql = ENTITIES[req.params.entity];
  if (!sql) return res.status(404).json({ error: 'Unknown entity' });
  try {
    const r = await db.query(sql);
    const csv = toCSV(r.rows);
    try {
      await db.query(
        'INSERT INTO audit_log (user_id, user_email, action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4,$5,$6)',
        [req.user?.id || null, req.user?.email || null, 'csv_export', req.params.entity, null, `rows=${r.rows.length}`]
      );
    } catch (_) { /* ignore */ }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${req.params.entity}-${Date.now()}.csv"`);
    res.send(csv);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
