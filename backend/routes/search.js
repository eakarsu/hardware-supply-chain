const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

// Advanced cross-entity search + filter.
// Query params:
//   q          - free-text term
//   entity     - parts|suppliers|orders|manufacturers|iterations|quality|all (default all)
//   country    - filter suppliers/manufacturers by country
//   status     - filter parts/orders by status
//   category   - filter parts by category
//   min_cost / max_cost - filter parts by unit_cost
//   limit      - default 25
router.get('/', verifyToken, async (req, res) => {
  const { q = '', entity = 'all', country, status, category, min_cost, max_cost, limit } = req.query;
  const lim = Math.min(parseInt(limit) || 25, 200);
  const term = `%${q.toLowerCase()}%`;
  const out = {};

  try {
    if (entity === 'all' || entity === 'parts') {
      const conds = ['(LOWER(name) LIKE $1 OR LOWER(part_number) LIKE $1 OR LOWER(COALESCE(description,\'\')) LIKE $1 OR LOWER(COALESCE(material,\'\')) LIKE $1)'];
      const params = [term];
      if (status) { params.push(status); conds.push(`status = $${params.length}`); }
      if (category) { params.push(category); conds.push(`category = $${params.length}`); }
      if (min_cost) { params.push(parseFloat(min_cost)); conds.push(`unit_cost >= $${params.length}`); }
      if (max_cost) { params.push(parseFloat(max_cost)); conds.push(`unit_cost <= $${params.length}`); }
      params.push(lim);
      const r = await db.query(`SELECT * FROM parts WHERE ${conds.join(' AND ')} ORDER BY name LIMIT $${params.length}`, params);
      out.parts = r.rows;
    }
    if (entity === 'all' || entity === 'suppliers') {
      const conds = ['(LOWER(name) LIKE $1 OR LOWER(COALESCE(country,\'\')) LIKE $1 OR LOWER(COALESCE(city,\'\')) LIKE $1 OR LOWER(COALESCE(certifications,\'\')) LIKE $1)'];
      const params = [term];
      if (country) { params.push(country); conds.push(`country = $${params.length}`); }
      params.push(lim);
      const r = await db.query(`SELECT * FROM suppliers WHERE ${conds.join(' AND ')} ORDER BY name LIMIT $${params.length}`, params);
      out.suppliers = r.rows;
    }
    if (entity === 'all' || entity === 'orders') {
      const conds = [`(LOWER(COALESCE(o.tracking_number,'')) LIKE $1 OR LOWER(COALESCE(o.notes,'')) LIKE $1 OR LOWER(COALESCE(p.name,'')) LIKE $1 OR LOWER(COALESCE(s.name,'')) LIKE $1)`];
      const params = [term];
      if (status) { params.push(status); conds.push(`o.status = $${params.length}`); }
      params.push(lim);
      const r = await db.query(`SELECT o.*, p.name as part_name, s.name as supplier_name
        FROM orders o LEFT JOIN parts p ON o.part_id = p.id LEFT JOIN suppliers s ON o.supplier_id = s.id
        WHERE ${conds.join(' AND ')} ORDER BY o.ordered_at DESC LIMIT $${params.length}`, params);
      out.orders = r.rows;
    }
    if (entity === 'all' || entity === 'manufacturers') {
      const conds = ['(LOWER(name) LIKE $1 OR LOWER(COALESCE(location,\'\')) LIKE $1 OR LOWER(COALESCE(specialization,\'\')) LIKE $1 OR LOWER(COALESCE(certifications,\'\')) LIKE $1)'];
      const params = [term];
      if (country) { params.push(country); conds.push(`country = $${params.length}`); }
      params.push(lim);
      const r = await db.query(`SELECT * FROM manufacturers WHERE ${conds.join(' AND ')} ORDER BY name LIMIT $${params.length}`, params);
      out.manufacturers = r.rows;
    }
    if (entity === 'all' || entity === 'iterations') {
      const r = await db.query(`SELECT i.*, p.name as part_name FROM iterations i
        LEFT JOIN parts p ON i.part_id = p.id
        WHERE LOWER(COALESCE(i.changes,'')) LIKE $1 OR LOWER(COALESCE(i.engineer,'')) LIKE $1 OR LOWER(COALESCE(p.name,'')) LIKE $1
        ORDER BY i.started_at DESC NULLS LAST LIMIT $2`, [term, lim]);
      out.iterations = r.rows;
    }
    if (entity === 'all' || entity === 'quality') {
      const r = await db.query(`SELECT q.*, p.name as part_name FROM quality_checks q
        LEFT JOIN parts p ON q.part_id = p.id
        WHERE LOWER(COALESCE(q.inspector,'')) LIKE $1 OR LOWER(COALESCE(q.notes,'')) LIKE $1 OR LOWER(COALESCE(q.failure_modes,'')) LIKE $1 OR LOWER(COALESCE(p.name,'')) LIKE $1
        ORDER BY q.check_date DESC NULLS LAST LIMIT $2`, [term, lim]);
      out.quality = r.rows;
    }

    out.totals = Object.fromEntries(Object.entries(out).filter(([k]) => k !== 'totals').map(([k, v]) => [k, Array.isArray(v) ? v.length : 0]));
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
