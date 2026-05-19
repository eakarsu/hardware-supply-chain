// Custom Views — supply chain analytics & ops tooling.
//
// Provides 4 endpoints powering the "Supply Views" experience:
//   GET    /api/custom-views/lead-time-chart        VIZ data: component lead-time trend (per category)
//   GET    /api/custom-views/supplier-heatmap       VIZ data: supplier reliability heatmap (country x category)
//   GET    /api/custom-views/bom-pdf?bomId=         NON-VIZ: synthesized BOM "PDF" payload
//   GET    /api/custom-views/supplier-rules         NON-VIZ CRUD list
//   POST   /api/custom-views/supplier-rules         NON-VIZ CRUD create
//   PUT    /api/custom-views/supplier-rules/:id     NON-VIZ CRUD update
//   DELETE /api/custom-views/supplier-rules/:id     NON-VIZ CRUD delete
//
// Storage: supplier_rules is held in-process (no schema changes required).

const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const db = require('../db');

router.use(verifyToken);

// ---------- In-memory supplier rules store ----------
let _rulesId = 1;
const supplierRules = [
  { id: _rulesId++, name: 'Asia lead-time cap', country: 'China', max_lead_days: 30, min_reliability: 8.5, action: 'flag', active: true },
  { id: _rulesId++, name: 'Aerospace cert required', country: 'USA', max_lead_days: 21, min_reliability: 9.0, action: 'require_cert', active: true },
  { id: _rulesId++, name: 'EU premium tier', country: 'Germany', max_lead_days: 35, min_reliability: 9.2, action: 'prefer', active: true },
];

// ---------- VIZ 1: lead-time chart ----------
// Returns array of { category, avg_lead_days, p90_lead_days, sample } and overall trend buckets.
router.get('/lead-time-chart', async (_req, res) => {
  try {
    const byCat = await db.query(`
      SELECT COALESCE(category, 'uncategorized') AS category,
             ROUND(AVG(lead_time_days)::numeric, 1) AS avg_lead_days,
             ROUND(PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY lead_time_days)::numeric, 1) AS p90_lead_days,
             COUNT(*) AS sample
      FROM parts
      WHERE lead_time_days IS NOT NULL
      GROUP BY category
      ORDER BY avg_lead_days DESC
    `);
    const trend = await db.query(`
      SELECT TO_CHAR(date_trunc('week', ordered_at), 'YYYY-MM-DD') AS week,
             ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(received_at, NOW()) - ordered_at)) / 86400.0)::numeric, 1) AS avg_actual_days,
             COUNT(*) AS n_orders
      FROM orders
      WHERE ordered_at IS NOT NULL
      GROUP BY 1
      ORDER BY 1 DESC
      LIMIT 12
    `);
    res.json({
      generated_at: new Date().toISOString(),
      categories: byCat.rows,
      weekly_trend: trend.rows.reverse(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- VIZ 2: supplier reliability heatmap ----------
// Returns matrix: rows = countries, cols = part categories sourced, cell = reliability_score (avg)
router.get('/supplier-heatmap', async (_req, res) => {
  try {
    const supplierRows = await db.query(`
      SELECT s.country,
             COALESCE(p.category, 'general') AS category,
             ROUND(AVG(s.reliability_score)::numeric, 2) AS reliability,
             ROUND(AVG(s.lead_time_days)::numeric, 1) AS avg_lead_days,
             COUNT(DISTINCT s.id) AS supplier_count
      FROM suppliers s
      LEFT JOIN orders o ON o.supplier_id = s.id
      LEFT JOIN parts p ON p.id = o.part_id
      WHERE s.active = TRUE
      GROUP BY s.country, COALESCE(p.category, 'general')
      ORDER BY s.country, category
    `);
    const countries = Array.from(new Set(supplierRows.rows.map(r => r.country))).sort();
    const categories = Array.from(new Set(supplierRows.rows.map(r => r.category))).sort();
    const matrix = countries.map(country => ({
      country,
      cells: categories.map(category => {
        const m = supplierRows.rows.find(r => r.country === country && r.category === category);
        return {
          category,
          reliability: m ? Number(m.reliability) : null,
          avg_lead_days: m ? Number(m.avg_lead_days) : null,
          supplier_count: m ? Number(m.supplier_count) : 0,
        };
      }),
    }));
    res.json({
      generated_at: new Date().toISOString(),
      countries,
      categories,
      matrix,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- NON-VIZ 1: BOM PDF (synthesized, served as application/pdf) ----------
function buildPdf(text) {
  // Minimal single-page PDF generator (no external deps).
  const escape = s => String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const lines = text.split('\n');
  let content = 'BT /F1 10 Tf 14 TL 40 770 Td\n';
  lines.forEach((ln, i) => {
    content += (i === 0 ? '' : 'T*\n') + `(${escape(ln)}) Tj\n`;
  });
  content += 'ET';
  const stream = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    stream,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let body = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(body.length);
    body += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xrefStart = body.length;
  body += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach(off => {
    body += `${String(off).padStart(10, '0')} 00000 n \n`;
  });
  body += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(body, 'binary');
}

router.get('/bom-pdf', async (req, res) => {
  try {
    const bomId = req.query.bomId ? parseInt(req.query.bomId, 10) : null;
    let header = null;
    let lines = [];
    if (bomId) {
      const h = await db.query('SELECT * FROM bom_headers WHERE id=$1', [bomId]);
      header = h.rows[0] || null;
      if (header) {
        const l = await db.query(`
          SELECT bl.*, c.mpn, c.manufacturer, c.description, c.unit_price
          FROM bom_lines bl
          LEFT JOIN components c ON c.id = bl.component_id
          WHERE bl.bom_id = $1
          ORDER BY bl.id
        `, [bomId]);
        lines = l.rows;
      }
    }
    if (!header) {
      // synthesize a header from parts when no real BOM available
      const p = await db.query('SELECT * FROM parts ORDER BY id LIMIT 8');
      header = { id: 0, product_name: 'HARDWARE-DEMO', revision: 'A0', status: 'release' };
      lines = p.rows.map((row, i) => ({
        id: i + 1,
        ref_designator: `P${i + 1}`,
        qty: 1 + (i % 4),
        mpn: row.part_number,
        manufacturer: row.material,
        description: row.name,
        unit_price: row.unit_cost,
      }));
    }
    const generated = new Date().toISOString();
    const title = `BOM ${header.product_name} rev ${header.revision}`;
    const text = [
      title,
      `Status: ${header.status}   Generated: ${generated}`,
      '',
      'Ref      Qty  MPN                  Manufacturer         Unit$    Ext$',
      '-------  ---  -------------------  -------------------  -------  -------',
      ...lines.map(l => {
        const ext = (Number(l.unit_price) || 0) * (Number(l.qty) || 0);
        return [
          String(l.ref_designator || '').padEnd(7).slice(0, 7),
          String(l.qty || '').padStart(3),
          String(l.mpn || '').padEnd(19).slice(0, 19),
          String(l.manufacturer || '').padEnd(19).slice(0, 19),
          String((Number(l.unit_price) || 0).toFixed(2)).padStart(7),
          String(ext.toFixed(2)).padStart(7),
        ].join('  ');
      }),
      '',
      `Total lines: ${lines.length}`,
      `Extended total: $${lines.reduce((s, l) => s + (Number(l.unit_price) || 0) * (Number(l.qty) || 0), 0).toFixed(2)}`,
    ].join('\n');
    const pdf = buildPdf(text);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="bom-${header.product_name || 'demo'}.pdf"`);
    res.setHeader('X-BOM-Lines', String(lines.length));
    res.setHeader('X-BOM-Source', bomId ? 'database' : 'synthesized');
    res.send(pdf);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- NON-VIZ 2: supplier rules editor (CRUD) ----------
router.get('/supplier-rules', (_req, res) => {
  res.json({ count: supplierRules.length, rules: supplierRules });
});

router.post('/supplier-rules', (req, res) => {
  const { name, country, max_lead_days, min_reliability, action, active } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const rule = {
    id: _rulesId++,
    name,
    country: country || 'ANY',
    max_lead_days: Number(max_lead_days) || 30,
    min_reliability: Number(min_reliability) || 8.0,
    action: action || 'flag',
    active: active !== false,
  };
  supplierRules.push(rule);
  res.status(201).json(rule);
});

router.put('/supplier-rules/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const rule = supplierRules.find(r => r.id === id);
  if (!rule) return res.status(404).json({ error: 'rule not found' });
  const { name, country, max_lead_days, min_reliability, action, active } = req.body || {};
  if (name !== undefined) rule.name = name;
  if (country !== undefined) rule.country = country;
  if (max_lead_days !== undefined) rule.max_lead_days = Number(max_lead_days);
  if (min_reliability !== undefined) rule.min_reliability = Number(min_reliability);
  if (action !== undefined) rule.action = action;
  if (active !== undefined) rule.active = !!active;
  res.json(rule);
});

router.delete('/supplier-rules/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = supplierRules.findIndex(r => r.id === id);
  if (idx < 0) return res.status(404).json({ error: 'rule not found' });
  const [removed] = supplierRules.splice(idx, 1);
  res.json({ deleted: removed });
});

module.exports = router;
