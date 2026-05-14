// Contract-manufacturer lead-time tracking — deep feature.
//
// Real CMs: Foxconn, Pegatron, Jabil, Flex, Wistron, Sanmina.
// Real processes: SMT, AOI, ICT, FATP, NPI.
//
// Endpoints:
//   GET    /api/cm-lead-times                              All observations (newest first).
//   GET    /api/cm-lead-times/:id                          Single observation.
//   POST   /api/cm-lead-times                              Record a new observation.
//   PUT    /api/cm-lead-times/:id                          Update.
//   DELETE /api/cm-lead-times/:id                          Delete.
//   GET    /api/cm-lead-times/cm/:cm                       All observations for one CM (across sites).
//   GET    /api/cm-lead-times/site/:cm/:site               All observations for one CM site.
//   GET    /api/cm-lead-times/summary                      Summary stats per CM + process: avg slip, avg yield.
//   GET    /api/cm-lead-times/ranking                      Rank CMs by reliability (slip + yield combined).
//   GET    /api/cm-lead-times/slip-alerts?threshold=0.2    Lots that slipped >threshold (default 20%).

const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const db = require('../db');

router.use(verifyToken);

const CMS = ['Foxconn', 'Pegatron', 'Jabil', 'Flex', 'Wistron', 'Sanmina'];
const PROCESSES = ['SMT', 'AOI', 'ICT', 'FATP', 'NPI'];

router.get('/', async (_req, res) => {
  try {
    const r = await db.query('SELECT * FROM cm_lead_times ORDER BY observed_on DESC, id DESC');
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/summary', async (_req, res) => {
  try {
    const r = await db.query(`
      SELECT cm_name, process,
             COUNT(*) AS n_obs,
             ROUND(AVG(actual_days)::numeric, 1) AS avg_actual_days,
             ROUND(AVG(quoted_days)::numeric, 1) AS avg_quoted_days,
             ROUND(AVG(actual_days - quoted_days)::numeric, 1) AS avg_slip_days,
             ROUND(AVG((actual_days::float - quoted_days)/NULLIF(quoted_days, 0))::numeric * 100, 1) AS avg_slip_pct,
             ROUND(AVG(yield_pct)::numeric, 2) AS avg_yield_pct,
             SUM(pcs) AS total_pcs
      FROM cm_lead_times
      GROUP BY cm_name, process
      ORDER BY cm_name, process
    `);
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/ranking', async (_req, res) => {
  try {
    const r = await db.query(`
      SELECT cm_name,
             COUNT(*) AS observations,
             SUM(pcs) AS total_pcs,
             ROUND(AVG(yield_pct)::numeric, 2) AS avg_yield_pct,
             ROUND(AVG((actual_days::float - quoted_days)/NULLIF(quoted_days, 0))::numeric * 100, 1) AS avg_slip_pct
      FROM cm_lead_times
      GROUP BY cm_name
    `);
    const ranked = r.rows.map(row => {
      const yieldScore = parseFloat(row.avg_yield_pct || 0);   // higher better
      const slipPct = parseFloat(row.avg_slip_pct || 0);       // lower better
      // Combined score: yield% minus slip penalty (slip pct counted at 0.5 weight).
      const score = yieldScore - Math.max(0, slipPct) * 0.5;
      return { ...row, composite_score: Math.round(score * 100) / 100 };
    }).sort((a, b) => b.composite_score - a.composite_score);
    res.json({ ranking: ranked });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/slip-alerts', async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold || '0.20');
    const r = await db.query(`
      SELECT *,
             ROUND(((actual_days::float - quoted_days)/NULLIF(quoted_days, 0))::numeric * 100, 1) AS slip_pct
      FROM cm_lead_times
      WHERE (actual_days::float - quoted_days)/NULLIF(quoted_days, 0) >= $1
      ORDER BY observed_on DESC
    `, [threshold]);
    res.json({ threshold_pct: threshold * 100, count: r.rows.length, items: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/cm/:cm', async (req, res) => {
  try {
    const r = await db.query(
      'SELECT * FROM cm_lead_times WHERE LOWER(cm_name)=LOWER($1) ORDER BY observed_on DESC',
      [req.params.cm]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/site/:cm/:site', async (req, res) => {
  try {
    const r = await db.query(
      'SELECT * FROM cm_lead_times WHERE LOWER(cm_name)=LOWER($1) AND LOWER(cm_site)=LOWER($2) ORDER BY observed_on DESC',
      [req.params.cm, req.params.site]
    );
    res.json(r.rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM cm_lead_times WHERE id=$1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const f = req.body || {};
    if (!f.cm_name || !f.process) return res.status(400).json({ error: 'cm_name and process required' });
    if (!CMS.includes(f.cm_name)) console.warn(`[cm-lead-times] unknown CM ${f.cm_name}`);
    if (!PROCESSES.includes(f.process)) console.warn(`[cm-lead-times] unknown process ${f.process}`);
    const r = await db.query(`
      INSERT INTO cm_lead_times (cm_name, cm_site, process, quoted_days, actual_days, pcs, yield_pct, observed_on, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [f.cm_name, f.cm_site, f.process, f.quoted_days, f.actual_days, f.pcs, f.yield_pct, f.observed_on || new Date(), f.notes]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const f = req.body;
    const r = await db.query(`
      UPDATE cm_lead_times SET cm_name=$1, cm_site=$2, process=$3, quoted_days=$4, actual_days=$5,
        pcs=$6, yield_pct=$7, observed_on=$8, notes=$9 WHERE id=$10 RETURNING *`,
      [f.cm_name, f.cm_site, f.process, f.quoted_days, f.actual_days, f.pcs, f.yield_pct, f.observed_on, f.notes, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cm_lead_times WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
