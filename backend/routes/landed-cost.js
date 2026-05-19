// Landed Cost calculator — deep feature.
//
// Endpoints:
//   GET    /api/landed-cost                                List all rollups.
//   GET    /api/landed-cost/bom/:bomId                     Rollups for a specific BOM.
//   GET    /api/landed-cost/:id                            Single rollup.
//   POST   /api/landed-cost                                Save a rollup (computes landed-per-unit).
//   PUT    /api/landed-cost/:id                            Update + recompute.
//   DELETE /api/landed-cost/:id                            Remove a rollup.
//   POST   /api/landed-cost/preview                        Compute without persisting; returns full breakdown.
//   GET    /api/landed-cost/duty-rates                     Returns the HTS-aligned duty table we model.
//   GET    /api/landed-cost/compare/:bomId                 Compare all saved scenarios for a BOM with deltas.

const router = require('express').Router();
const verifyToken = require("../middleware/auth");
const db = require('../db');

router.use(verifyToken);

// Real-world style HTS duty rate table (rough US rates as of 2026; for modelling only).
// Origin-country dependent (China gets Section-301 List-3/4 layered duty).
const DUTY_TABLE = {
  // HS heading -> base duty %
  '8542 (ICs)':                  { base: 0,    china_extra: 25 },
  '8504 (DC-DC/PSU)':            { base: 1.5,  china_extra: 25 },
  '8536 (connectors/switches)':  { base: 2.7,  china_extra: 25 },
  '8534 (printed circuits)':     { base: 0,    china_extra: 25 },
  '7308 (steel structures)':     { base: 0,    china_extra: 25 },
  '7616 (aluminum articles)':    { base: 2.5,  china_extra: 25 },
  '9030 (test instruments)':     { base: 1.7,  china_extra: 25 },
  '8473 (PC parts/assemblies)':  { base: 0,    china_extra: 25 },
};

const FREE_TRADE = {
  USMCA: ['Mexico', 'Canada'],
  KORUS: ['South Korea'],
  USJTA: ['Japan'], // US-Japan Trade Agreement (limited goods)
};

function lookupDutyPct(htsHeading, origin) {
  const row = DUTY_TABLE[htsHeading];
  if (!row) return 2.5; // generic mainstream default
  let pct = row.base;
  const isChina = /china/i.test(origin || '');
  if (isChina) pct += row.china_extra;
  return pct;
}

function applyFTA(pct, origin) {
  for (const [pact, countries] of Object.entries(FREE_TRADE)) {
    if (countries.some(c => c.toLowerCase() === (origin || '').toLowerCase())) return { pct: 0, fta: pact };
  }
  return { pct, fta: null };
}

// Compute landed cost per unit. Mirrors the academic formula:
// landed/unit = (fob/lot + freight/lot + insurance/lot + brokerage/lot) / qty
//              * (1 + duty_pct)
//              * (1 + carrying_pct_per_year * days_in_inventory / 365)
function computeLanded(input) {
  const fob = parseFloat(input.fob_total_usd || 0);
  const dutyPctRaw = parseFloat(input.duty_pct ?? 0);
  const freight = parseFloat(input.freight_usd || 0);
  const insurance = parseFloat(input.insurance_usd || 0);
  const brokerage = parseFloat(input.brokerage_usd || 0);
  const carryingPctYear = parseFloat(input.carrying_pct_per_year || 0);
  const days = parseInt(input.days_in_inventory || 0, 10);
  const qty = parseInt(input.lot_qty || 1, 10) || 1;

  const dutyValue = (fob * dutyPctRaw) / 100;
  const cifPlus = fob + freight + insurance + brokerage + dutyValue;
  const carrying = cifPlus * carryingPctYear * (days / 365);
  const total = cifPlus + carrying;
  const perUnit = total / qty;
  return {
    duty_value_usd: round(dutyValue),
    cif_plus_duty_usd: round(cifPlus),
    carrying_cost_usd: round(carrying),
    total_landed_usd: round(total),
    landed_per_unit_usd: round(perUnit),
  };
}

function round(n) { return Math.round((Number.isFinite(n) ? n : 0) * 100) / 100; }

router.get('/duty-rates', (_req, res) => res.json({ table: DUTY_TABLE, fta: FREE_TRADE }));

router.post('/preview', (req, res) => {
  try {
    const i = req.body || {};
    let duty = i.duty_pct;
    if (duty === undefined || duty === null) duty = lookupDutyPct(i.hts_heading, i.origin_country);
    const ftaResult = applyFTA(duty, i.origin_country);
    const computed = computeLanded({ ...i, duty_pct: ftaResult.pct });
    res.json({
      inputs: i,
      duty_pct_applied: ftaResult.pct,
      fta_applied: ftaResult.fta,
      ...computed,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/', async (_req, res) => {
  try {
    const r = await db.query(`
      SELECT lc.*, b.product_name, b.revision
      FROM landed_costs lc LEFT JOIN bom_headers b ON b.id = lc.bom_id
      ORDER BY lc.computed_at DESC
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/bom/:bomId', async (req, res) => {
  try {
    const r = await db.query(
      'SELECT * FROM landed_costs WHERE bom_id=$1 ORDER BY computed_at DESC',
      [req.params.bomId]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/compare/:bomId', async (req, res) => {
  try {
    const r = await db.query(
      'SELECT * FROM landed_costs WHERE bom_id=$1 ORDER BY origin_country, incoterm',
      [req.params.bomId]
    );
    if (!r.rows.length) return res.json({ bom_id: parseInt(req.params.bomId, 10), scenarios: [] });
    const cheapest = r.rows.reduce((acc, row) =>
      (acc == null || parseFloat(row.computed_landed_per_unit) < parseFloat(acc.computed_landed_per_unit)) ? row : acc, null);
    const scenarios = r.rows.map(s => ({
      ...s,
      delta_vs_cheapest_usd_per_unit: round(parseFloat(s.computed_landed_per_unit) - parseFloat(cheapest.computed_landed_per_unit)),
      delta_vs_cheapest_pct: round(((parseFloat(s.computed_landed_per_unit) - parseFloat(cheapest.computed_landed_per_unit)) / parseFloat(cheapest.computed_landed_per_unit)) * 100),
    }));
    res.json({ bom_id: parseInt(req.params.bomId, 10), cheapest_id: cheapest.id, scenarios });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM landed_costs WHERE id=$1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const f = req.body || {};
    let duty = f.duty_pct;
    if (duty === undefined || duty === null) duty = lookupDutyPct(f.hts_heading, f.origin_country);
    const ftaResult = applyFTA(duty, f.origin_country);
    const computed = computeLanded({ ...f, duty_pct: ftaResult.pct });
    const r = await db.query(`
      INSERT INTO landed_costs (bom_id, origin_country, destination_country, incoterm, fob_total_usd,
        duty_pct, freight_usd, insurance_usd, brokerage_usd, carrying_pct_per_year, days_in_inventory,
        lot_qty, computed_landed_per_unit)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [f.bom_id, f.origin_country, f.destination_country, f.incoterm, f.fob_total_usd,
       ftaResult.pct, f.freight_usd, f.insurance_usd, f.brokerage_usd, f.carrying_pct_per_year,
       f.days_in_inventory, f.lot_qty, computed.landed_per_unit_usd]
    );
    res.status(201).json({ ...r.rows[0], breakdown: computed, fta_applied: ftaResult.fta });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const f = req.body || {};
    const computed = computeLanded(f);
    const r = await db.query(`
      UPDATE landed_costs SET bom_id=$1, origin_country=$2, destination_country=$3, incoterm=$4,
        fob_total_usd=$5, duty_pct=$6, freight_usd=$7, insurance_usd=$8, brokerage_usd=$9,
        carrying_pct_per_year=$10, days_in_inventory=$11, lot_qty=$12, computed_landed_per_unit=$13
      WHERE id=$14 RETURNING *`,
      [f.bom_id, f.origin_country, f.destination_country, f.incoterm, f.fob_total_usd, f.duty_pct,
       f.freight_usd, f.insurance_usd, f.brokerage_usd, f.carrying_pct_per_year, f.days_in_inventory,
       f.lot_qty, computed.landed_per_unit_usd, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ ...r.rows[0], breakdown: computed });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM landed_costs WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
