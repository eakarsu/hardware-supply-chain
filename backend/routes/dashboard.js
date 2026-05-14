const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

router.get('/stats', verifyToken, async (req, res) => {
  try {
    const queries = await Promise.all([
      db.query('SELECT COUNT(*)::int AS c FROM parts'),
      db.query('SELECT COUNT(*)::int AS c FROM suppliers'),
      db.query('SELECT COUNT(*)::int AS c FROM manufacturers'),
      db.query("SELECT COUNT(*)::int AS c FROM orders WHERE status IN ('pending','ordered','shipped','in_transit')"),
      db.query('SELECT COUNT(*)::int AS c FROM quality_checks WHERE pass = false'),
      db.query("SELECT COUNT(*)::int AS c FROM iterations WHERE started_at > NOW() - INTERVAL '30 days'"),
      db.query('SELECT COUNT(*)::int AS c FROM parts WHERE in_stock <= reorder_threshold'),
      db.query('SELECT COUNT(*)::int AS c FROM orders'),
      db.query('SELECT COUNT(*)::int AS c FROM iterations'),
      db.query('SELECT COUNT(*)::int AS c FROM quality_checks'),
      db.query('SELECT id, user_email, action, entity_type, entity_id, details, created_at FROM audit_log ORDER BY created_at DESC LIMIT 10'),
    ]);

    res.json({
      kpis: {
        parts: queries[0].rows[0].c,
        suppliers: queries[1].rows[0].c,
        manufacturers: queries[2].rows[0].c,
        open_orders: queries[3].rows[0].c,
        quality_issues: queries[4].rows[0].c,
        recent_iterations: queries[5].rows[0].c,
        low_stock_parts: queries[6].rows[0].c,
        total_orders: queries[7].rows[0].c,
        total_iterations: queries[8].rows[0].c,
        total_quality_checks: queries[9].rows[0].c,
      },
      recent_activity: queries[10].rows,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
