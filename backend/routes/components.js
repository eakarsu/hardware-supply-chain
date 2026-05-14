// Component catalog with multi-distributor offerings — deep feature.
//
// Endpoints:
//   GET    /api/components                         List with primary distributor + stock summary.
//   GET    /api/components/lifecycle/:status       Filter by Active / NRND / EOL / Obsolete / Preview.
//   GET    /api/components/eol-watch?days=180      Components whose last_buy_date is within N days.
//   GET    /api/components/:id                     Full component + all distributor offerings.
//   POST   /api/components                         Create.
//   PUT    /api/components/:id                     Update (lifecycle transitions allowed).
//   DELETE /api/components/:id                     Delete.
//   POST   /api/components/:id/offerings           Add a distributor offering.
//   PUT    /api/components/offerings/:offId        Update an offering (stock/price refresh).
//   DELETE /api/components/offerings/:offId        Delete an offering.
//   GET    /api/components/:id/cheapest?qty=1000   Pick cheapest distributor for a target qty.
//   GET    /api/components/search?q=stm32          Search MPN/manufacturer/description.

const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const db = require('../db');

router.use(verifyToken);

const LIFECYCLES = ['Active', 'NRND', 'EOL', 'Obsolete', 'Preview'];

router.get('/', async (_req, res) => {
  try {
    const r = await db.query(`
      SELECT c.*,
             COALESCE(SUM(d.stock), 0) AS total_stock_all_dists,
             COUNT(d.id) AS distributor_count
      FROM components c
      LEFT JOIN distributor_offerings d ON d.component_id = c.id
      GROUP BY c.id
      ORDER BY c.manufacturer, c.mpn
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/lifecycle/:status', async (req, res) => {
  if (!LIFECYCLES.includes(req.params.status)) return res.status(400).json({ error: 'unknown lifecycle' });
  try {
    const r = await db.query(
      'SELECT * FROM components WHERE lifecycle=$1 ORDER BY last_buy_date NULLS LAST, manufacturer, mpn',
      [req.params.status]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/eol-watch', async (req, res) => {
  try {
    const days = parseInt(req.query.days || '180', 10);
    const r = await db.query(`
      SELECT id, mpn, manufacturer, lifecycle, last_buy_date,
             (last_buy_date - CURRENT_DATE) AS days_remaining
      FROM components
      WHERE lifecycle IN ('NRND','EOL','Obsolete')
        AND (last_buy_date IS NULL OR last_buy_date <= CURRENT_DATE + ($1::int * INTERVAL '1 day'))
      ORDER BY last_buy_date NULLS FIRST
    `, [days]);
    res.json({ horizon_days: days, count: r.rows.length, items: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').toString();
    if (!q) return res.json([]);
    const like = `%${q}%`;
    const r = await db.query(
      `SELECT * FROM components WHERE mpn ILIKE $1 OR manufacturer ILIKE $1 OR description ILIKE $1 ORDER BY mpn LIMIT 40`,
      [like]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const c = await db.query('SELECT * FROM components WHERE id=$1', [req.params.id]);
    if (!c.rows[0]) return res.status(404).json({ error: 'Not found' });
    const offers = await db.query(
      'SELECT * FROM distributor_offerings WHERE component_id=$1 ORDER BY distributor, distributor_sku',
      [req.params.id]
    );
    res.json({ ...c.rows[0], offerings: offers.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/cheapest', async (req, res) => {
  try {
    const qty = parseInt(req.query.qty || '1', 10);
    const r = await db.query('SELECT * FROM distributor_offerings WHERE component_id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'No distributor offerings' });
    const ranked = r.rows.map(o => {
      let unit;
      if (qty >= 1000) unit = parseFloat(o.cost_break_1000 || o.cost_break_100 || o.cost_break_1 || Infinity);
      else if (qty >= 100) unit = parseFloat(o.cost_break_100 || o.cost_break_1 || Infinity);
      else unit = parseFloat(o.cost_break_1 || o.cost_break_100 || Infinity);
      return { ...o, applied_unit_cost: unit, extended_cost: unit * qty };
    }).sort((a, b) => a.applied_unit_cost - b.applied_unit_cost);
    res.json({ qty, ranked });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const f = req.body;
    if (!f.mpn || !f.manufacturer) return res.status(400).json({ error: 'mpn and manufacturer required' });
    if (f.lifecycle && !LIFECYCLES.includes(f.lifecycle)) return res.status(400).json({ error: 'invalid lifecycle' });
    const r = await db.query(`
      INSERT INTO components (mpn, manufacturer, description, package, category, rohs, lifecycle, last_buy_date,
        datasheet_url, pin_count, pitch_mm, operating_temp_min, operating_temp_max, unit_price_break_qty, unit_price, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [f.mpn, f.manufacturer, f.description, f.package, f.category, f.rohs !== false, f.lifecycle || 'Active',
       f.last_buy_date || null, f.datasheet_url, f.pin_count, f.pitch_mm, f.operating_temp_min, f.operating_temp_max,
       f.unit_price_break_qty, f.unit_price, f.notes]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'mpn + manufacturer already exists' });
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const f = req.body;
    if (f.lifecycle && !LIFECYCLES.includes(f.lifecycle)) return res.status(400).json({ error: 'invalid lifecycle' });
    const r = await db.query(`
      UPDATE components SET mpn=$1, manufacturer=$2, description=$3, package=$4, category=$5, rohs=$6,
        lifecycle=$7, last_buy_date=$8, datasheet_url=$9, pin_count=$10, pitch_mm=$11,
        operating_temp_min=$12, operating_temp_max=$13, unit_price_break_qty=$14, unit_price=$15, notes=$16
      WHERE id=$17 RETURNING *`,
      [f.mpn, f.manufacturer, f.description, f.package, f.category, f.rohs, f.lifecycle, f.last_buy_date,
       f.datasheet_url, f.pin_count, f.pitch_mm, f.operating_temp_min, f.operating_temp_max,
       f.unit_price_break_qty, f.unit_price, f.notes, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM components WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/offerings', async (req, res) => {
  try {
    const f = req.body;
    if (!f.distributor || !f.distributor_sku) return res.status(400).json({ error: 'distributor and distributor_sku required' });
    const r = await db.query(`
      INSERT INTO distributor_offerings (component_id, distributor, distributor_sku, stock, factory_stock, moq, spq,
        price_break_1, cost_break_1, price_break_100, cost_break_100, price_break_1000, cost_break_1000, lead_time_days, url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [req.params.id, f.distributor, f.distributor_sku, f.stock || 0, f.factory_stock || 0, f.moq || 1, f.spq || 1,
       f.price_break_1 || 1, f.cost_break_1, f.price_break_100 || 100, f.cost_break_100, f.price_break_1000 || 1000, f.cost_break_1000,
       f.lead_time_days, f.url]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'distributor + sku already exists' });
    res.status(500).json({ error: e.message });
  }
});

router.put('/offerings/:offId', async (req, res) => {
  try {
    const f = req.body;
    const r = await db.query(`
      UPDATE distributor_offerings SET stock=$1, factory_stock=$2, moq=$3, spq=$4,
        cost_break_1=$5, cost_break_100=$6, cost_break_1000=$7, lead_time_days=$8, url=$9, last_checked=NOW()
      WHERE id=$10 RETURNING *`,
      [f.stock, f.factory_stock, f.moq, f.spq, f.cost_break_1, f.cost_break_100, f.cost_break_1000,
       f.lead_time_days, f.url, req.params.offId]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/offerings/:offId', async (req, res) => {
  try {
    await db.query('DELETE FROM distributor_offerings WHERE id=$1', [req.params.offId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
