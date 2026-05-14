// BOM (Bill of Materials) management — deep feature.
//
// Endpoints:
//   GET    /api/bom                                  List BOM headers (with line count + extended-cost preview).
//   GET    /api/bom/:id                              Header + lines joined with components + cheapest distributor.
//   POST   /api/bom                                  Create header.
//   PUT    /api/bom/:id                              Update header.
//   DELETE /api/bom/:id                              Delete header + lines.
//   POST   /api/bom/:id/lines                        Append a line (component_id + qty + ref designator).
//   PUT    /api/bom/lines/:lineId                    Update a line.
//   DELETE /api/bom/lines/:lineId                    Delete a line.
//   GET    /api/bom/:id/cost-rollup                  Roll-up extended cost using cheapest distributor at qty 1k.
//   GET    /api/bom/:id/lifecycle-report             Flag NRND/EOL/Obsolete lines for the BOM.
//   POST   /api/bom/:id/clone?revision=B0            Clone all lines into a new header revision.

const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../db');

router.use(verifyToken);

// ---------- HEADER CRUD ----------

router.get('/', async (_req, res) => {
  try {
    const r = await db.query(`
      SELECT h.*, COALESCE(l.line_count, 0) AS line_count,
             COALESCE(l.distinct_components, 0) AS distinct_components
      FROM bom_headers h
      LEFT JOIN (
        SELECT bom_id, COUNT(*) AS line_count, COUNT(DISTINCT component_id) AS distinct_components
        FROM bom_lines GROUP BY bom_id
      ) l ON l.bom_id = h.id
      ORDER BY h.product_name, h.revision
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const h = await db.query('SELECT * FROM bom_headers WHERE id=$1', [req.params.id]);
    if (!h.rows[0]) return res.status(404).json({ error: 'BOM not found' });
    const lines = await db.query(`
      SELECT l.*,
             c.mpn, c.manufacturer, c.description AS component_description,
             c.package, c.lifecycle, c.last_buy_date, c.unit_price AS reference_unit_price,
             (
               SELECT json_build_object(
                 'distributor', d.distributor,
                 'distributor_sku', d.distributor_sku,
                 'stock', d.stock,
                 'price_break_1000', d.cost_break_1000,
                 'price_break_100',  d.cost_break_100,
                 'lead_time_days',   d.lead_time_days
               )
               FROM distributor_offerings d
               WHERE d.component_id = l.component_id
               ORDER BY COALESCE(d.cost_break_1000, d.cost_break_100, 999999) ASC
               LIMIT 1
             ) AS cheapest_offering
      FROM bom_lines l
      LEFT JOIN components c ON c.id = l.component_id
      WHERE l.bom_id = $1
      ORDER BY l.id
    `, [req.params.id]);
    res.json({ ...h.rows[0], lines: lines.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { product_name, revision, status, target_qty, owner, notes } = req.body;
    if (!product_name || !revision) return res.status(400).json({ error: 'product_name and revision required' });
    const r = await db.query(
      'INSERT INTO bom_headers (product_name, revision, status, target_qty, owner, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [product_name, revision, status || 'draft', target_qty || 1, owner || null, notes || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'product_name+revision already exists' });
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { product_name, revision, status, target_qty, owner, notes } = req.body;
    const r = await db.query(
      'UPDATE bom_headers SET product_name=$1, revision=$2, status=$3, target_qty=$4, owner=$5, notes=$6 WHERE id=$7 RETURNING *',
      [product_name, revision, status, target_qty, owner, notes, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM bom_headers WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---------- LINE CRUD ----------

router.post('/:id/lines', async (req, res) => {
  try {
    const { ref_designator, component_id, qty_per_assembly, do_not_populate, preferred_distributor, alt_mpn_1, alt_mpn_2, notes } = req.body;
    if (!component_id) return res.status(400).json({ error: 'component_id required' });
    const r = await db.query(
      `INSERT INTO bom_lines (bom_id, ref_designator, component_id, qty_per_assembly, do_not_populate, preferred_distributor, alt_mpn_1, alt_mpn_2, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [req.params.id, ref_designator || null, component_id, qty_per_assembly || 1, !!do_not_populate, preferred_distributor || null, alt_mpn_1 || null, alt_mpn_2 || null, notes || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/lines/:lineId', async (req, res) => {
  try {
    const { ref_designator, component_id, qty_per_assembly, do_not_populate, preferred_distributor, alt_mpn_1, alt_mpn_2, notes } = req.body;
    const r = await db.query(
      `UPDATE bom_lines SET ref_designator=$1, component_id=$2, qty_per_assembly=$3, do_not_populate=$4,
         preferred_distributor=$5, alt_mpn_1=$6, alt_mpn_2=$7, notes=$8
       WHERE id=$9 RETURNING *`,
      [ref_designator, component_id, qty_per_assembly, do_not_populate, preferred_distributor, alt_mpn_1, alt_mpn_2, notes, req.params.lineId]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Line not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/lines/:lineId', async (req, res) => {
  try {
    await db.query('DELETE FROM bom_lines WHERE id=$1', [req.params.lineId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ---------- ANALYTICS ----------

router.get('/:id/cost-rollup', async (req, res) => {
  try {
    const h = await db.query('SELECT * FROM bom_headers WHERE id=$1', [req.params.id]);
    if (!h.rows[0]) return res.status(404).json({ error: 'BOM not found' });
    const buildQty = parseInt(req.query.qty || h.rows[0].target_qty || '1', 10);

    const lines = await db.query(`
      SELECT l.id, l.ref_designator, l.qty_per_assembly, l.do_not_populate, l.preferred_distributor,
             c.id AS component_id, c.mpn, c.manufacturer, c.lifecycle, c.unit_price AS reference_unit_price
      FROM bom_lines l LEFT JOIN components c ON c.id = l.component_id
      WHERE l.bom_id = $1 ORDER BY l.id
    `, [req.params.id]);

    let total_extended = 0;
    let unsourced = 0;
    const detailed = [];

    for (const ln of lines.rows) {
      if (ln.do_not_populate) {
        detailed.push({ ...ln, ext_cost: 0, dnp: true });
        continue;
      }
      const off = await db.query(`
        SELECT distributor, distributor_sku, stock, moq,
               cost_break_1, cost_break_100, cost_break_1000, lead_time_days
        FROM distributor_offerings
        WHERE component_id=$1
        ORDER BY COALESCE(cost_break_1000, cost_break_100, cost_break_1, 999999) ASC
      `, [ln.component_id]);

      const totalNeeded = parseFloat(ln.qty_per_assembly) * buildQty;
      let unit = parseFloat(ln.reference_unit_price || 0);
      let pickedOffer = null;
      if (off.rows.length) {
        // Choose price break by total quantity needed.
        const o = off.rows[0];
        if (totalNeeded >= 1000) unit = parseFloat(o.cost_break_1000 || o.cost_break_100 || o.cost_break_1 || 0);
        else if (totalNeeded >= 100) unit = parseFloat(o.cost_break_100 || o.cost_break_1 || 0);
        else unit = parseFloat(o.cost_break_1 || o.cost_break_100 || 0);
        pickedOffer = o;
      } else {
        unsourced += 1;
      }
      const ext = unit * totalNeeded;
      total_extended += ext;
      detailed.push({
        ...ln,
        chosen_unit_cost: unit,
        chosen_distributor: pickedOffer ? pickedOffer.distributor : null,
        chosen_sku: pickedOffer ? pickedOffer.distributor_sku : null,
        chosen_lead_time_days: pickedOffer ? pickedOffer.lead_time_days : null,
        chosen_stock: pickedOffer ? pickedOffer.stock : 0,
        total_qty: totalNeeded,
        ext_cost: Math.round(ext * 10000) / 10000,
      });
    }

    res.json({
      bom_id: parseInt(req.params.id, 10),
      build_qty: buildQty,
      cost_per_unit: detailed.length ? Math.round((total_extended / buildQty) * 10000) / 10000 : 0,
      total_extended: Math.round(total_extended * 100) / 100,
      unsourced_lines: unsourced,
      lines: detailed,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/lifecycle-report', async (req, res) => {
  try {
    const lines = await db.query(`
      SELECT l.id AS line_id, l.ref_designator, l.qty_per_assembly,
             c.id AS component_id, c.mpn, c.manufacturer, c.lifecycle, c.last_buy_date,
             l.alt_mpn_1, l.alt_mpn_2
      FROM bom_lines l JOIN components c ON c.id = l.component_id
      WHERE l.bom_id=$1
    `, [req.params.id]);

    const buckets = { Active: [], NRND: [], EOL: [], Obsolete: [], Preview: [] };
    for (const r of lines.rows) (buckets[r.lifecycle] = buckets[r.lifecycle] || []).push(r);

    const today = new Date();
    const risky = [];
    for (const r of lines.rows) {
      if (r.lifecycle === 'NRND' || r.lifecycle === 'EOL') {
        const days = r.last_buy_date ? Math.round((new Date(r.last_buy_date) - today) / 86400000) : null;
        risky.push({
          line_id: r.line_id, ref_designator: r.ref_designator, mpn: r.mpn, manufacturer: r.manufacturer,
          lifecycle: r.lifecycle, last_buy_date: r.last_buy_date, days_until_last_buy: days,
          has_alt: !!(r.alt_mpn_1 || r.alt_mpn_2),
          recommended_alts: [r.alt_mpn_1, r.alt_mpn_2].filter(Boolean),
        });
      } else if (r.lifecycle === 'Obsolete') {
        risky.push({
          line_id: r.line_id, ref_designator: r.ref_designator, mpn: r.mpn, manufacturer: r.manufacturer,
          lifecycle: r.lifecycle, last_buy_date: r.last_buy_date,
          urgent: true, recommended_alts: [r.alt_mpn_1, r.alt_mpn_2].filter(Boolean),
        });
      }
    }
    res.json({
      bom_id: parseInt(req.params.id, 10),
      counts: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])),
      at_risk: risky.sort((a, b) => (a.urgent === b.urgent ? 0 : a.urgent ? -1 : 1)),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/clone', async (req, res) => {
  try {
    const newRev = req.query.revision || req.body.revision;
    if (!newRev) return res.status(400).json({ error: 'revision query/body required' });
    const src = await db.query('SELECT * FROM bom_headers WHERE id=$1', [req.params.id]);
    if (!src.rows[0]) return res.status(404).json({ error: 'Source BOM not found' });
    const h = await db.query(
      'INSERT INTO bom_headers (product_name, revision, status, target_qty, owner, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [src.rows[0].product_name, newRev, 'draft', src.rows[0].target_qty, src.rows[0].owner, `Cloned from rev ${src.rows[0].revision}`]
    );
    await db.query(`
      INSERT INTO bom_lines (bom_id, ref_designator, component_id, qty_per_assembly, do_not_populate, preferred_distributor, alt_mpn_1, alt_mpn_2, notes)
      SELECT $1, ref_designator, component_id, qty_per_assembly, do_not_populate, preferred_distributor, alt_mpn_1, alt_mpn_2, notes
      FROM bom_lines WHERE bom_id=$2
    `, [h.rows[0].id, req.params.id]);
    res.status(201).json(h.rows[0]);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Target revision already exists' });
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
