const router = require('express').Router();
const db = require('../db');
const verifyToken = require("../middleware/auth");

// Apply pass 7 — iteration-speed leaderboard tying directly to project mission
// (Shenzhen vs US iteration loop time). Pure aggregator over iterations + parts.

async function ensureViewTable() {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS iteration_speed_baselines (
      id SERIAL PRIMARY KEY,
      region TEXT NOT NULL,
      part_category TEXT,
      baseline_hours NUMERIC NOT NULL,
      source TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
  } catch (e) { /* swallow */ }
}

router.get('/summary', verifyToken, async (req, res) => {
  try {
    await ensureViewTable();

    const overall = await db.query(`
      SELECT
        COUNT(*)::int AS total_iterations,
        COUNT(*) FILTER (WHERE success = true)::int AS successful,
        ROUND(AVG(iteration_hours)::numeric, 2) AS avg_hours,
        ROUND(MIN(iteration_hours)::numeric, 2) AS min_hours,
        ROUND(MAX(iteration_hours)::numeric, 2) AS max_hours,
        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY iteration_hours)::numeric, 2) AS median_hours
      FROM iterations
      WHERE iteration_hours IS NOT NULL
    `);

    const byEngineer = await db.query(`
      SELECT
        COALESCE(engineer, 'unknown') AS engineer,
        COUNT(*)::int AS iterations,
        ROUND(AVG(iteration_hours)::numeric, 2) AS avg_hours,
        ROUND((COUNT(*) FILTER (WHERE success = true)::numeric
               / NULLIF(COUNT(*), 0) * 100)::numeric, 1) AS success_rate
      FROM iterations
      WHERE iteration_hours IS NOT NULL
      GROUP BY engineer
      ORDER BY avg_hours ASC NULLS LAST
      LIMIT 20
    `);

    const fastestParts = await db.query(`
      SELECT
        p.id, p.part_number, p.name, p.category,
        ROUND(AVG(i.iteration_hours)::numeric, 2) AS avg_hours,
        COUNT(i.id)::int AS iteration_count
      FROM iterations i
      JOIN parts p ON i.part_id = p.id
      WHERE i.iteration_hours IS NOT NULL
      GROUP BY p.id, p.part_number, p.name, p.category
      HAVING COUNT(i.id) >= 1
      ORDER BY avg_hours ASC
      LIMIT 10
    `);

    const trend = await db.query(`
      SELECT
        DATE_TRUNC('week', started_at)::date AS week,
        COUNT(*)::int AS iterations,
        ROUND(AVG(iteration_hours)::numeric, 2) AS avg_hours
      FROM iterations
      WHERE started_at IS NOT NULL AND iteration_hours IS NOT NULL
        AND started_at > NOW() - INTERVAL '180 days'
      GROUP BY week
      ORDER BY week ASC
    `);

    const baselines = await db.query(
      'SELECT region, part_category, baseline_hours, source FROM iteration_speed_baselines ORDER BY region, part_category'
    );

    // Reference baselines per project description.txt (Shenzhen ~1 day, US ~weeks)
    const shenzhenHours = 24;
    const usHours = 168; // 1 week
    const teamAvg = Number(overall.rows[0]?.avg_hours || 0);
    const gapVsShenzhen = teamAvg > 0 ? Number((teamAvg / shenzhenHours).toFixed(2)) : null;
    const gapVsUs = teamAvg > 0 ? Number((teamAvg / usHours).toFixed(2)) : null;

    res.json({
      overall: overall.rows[0],
      by_engineer: byEngineer.rows,
      fastest_parts: fastestParts.rows,
      weekly_trend: trend.rows,
      reference_baselines: {
        shenzhen_hours: shenzhenHours,
        us_typical_hours: usHours,
        team_vs_shenzhen_multiplier: gapVsShenzhen,
        team_vs_us_multiplier: gapVsUs,
      },
      custom_baselines: baselines.rows,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/baseline', verifyToken, async (req, res) => {
  try {
    await ensureViewTable();
    const { region, part_category, baseline_hours, source } = req.body || {};
    if (!region || baseline_hours == null) {
      return res.status(400).json({ error: 'region and baseline_hours required' });
    }
    const r = await db.query(
      'INSERT INTO iteration_speed_baselines (region, part_category, baseline_hours, source) VALUES ($1,$2,$3,$4) RETURNING *',
      [region, part_category || null, baseline_hours, source || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/baseline/:id', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM iteration_speed_baselines WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
