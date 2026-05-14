// Design-For-Manufacture (DFM) and Design-For-Assembly (DFA) rule checks — deep feature.
//
// Real DFM/DFA rules covered:
//   - ACUTE_ANGLE      (copper acute angles below 30 deg create acid traps)
//   - BGA_PITCH        (BGA ball pitch vs board layer count / via-in-pad need)
//   - COPPER_POUR      (pour-to-edge clearance, thermal relief on high-current pads)
//   - FPC_BEND         (flex-circuit bend radius vs flex thickness ratio, IPC 6013)
//   - SILK_OVER_PAD    (silkscreen overlapping SMD pad)
//   - VIA_IN_PAD       (sub-0.8mm pitch BGA needs via-in-pad filled+capped)
//   - TRACE_TO_EDGE    (trace clearance to board edge)
//
// Endpoints:
//   GET    /api/dfm/rules                        Spec sheet of all rules + thresholds.
//   GET    /api/dfm/bom/:bomId                   All DFM findings for a BOM.
//   GET    /api/dfm/:id                          Single finding.
//   POST   /api/dfm                              Manually record a finding.
//   PUT    /api/dfm/:id                          Update finding.
//   POST   /api/dfm/:id/waive                    Waive a finding with a reason.
//   POST   /api/dfm/:id/resolve                  Mark a finding fixed.
//   DELETE /api/dfm/:id                          Delete a finding.
//   POST   /api/dfm/run/:bomId                   Run a synthetic rule pass given inputs (returns + persists).

const router = require('express').Router();
const verifyToken = require('../middleware/auth');
const db = require('../db');

router.use(verifyToken);

// Real DFM thresholds in mm / deg.
const RULE_SPECS = {
  ACUTE_ANGLE: {
    description: 'Acute angles in copper polygons cause acid traps during etching.',
    spec: { min_angle_deg: 30 },
    fail_if: 'angle_deg < 30',
    severity_default: 'warn',
  },
  BGA_PITCH: {
    description: 'BGA ball pitch determines breakout strategy and minimum layer count.',
    spec: {
      ge_0_80mm: '4-layer board OK with dog-bone breakout',
      lt_0_80mm: 'Requires via-in-pad (filled+capped) and 6+ layer stack-up',
      lt_0_50mm: 'Specialty process required (HDI, microvias)',
    },
    fail_if: 'pitch_mm < 0.80 AND layers < 6',
    severity_default: 'warn',
  },
  COPPER_POUR: {
    description: 'Copper pour clearance to board edge and thermal relief on high-current pads.',
    spec: { min_pour_to_edge_mm: 0.20, min_thermal_spokes_mm: 0.30 },
    fail_if: 'pour_to_edge_mm < 0.20',
    severity_default: 'fail',
  },
  FPC_BEND: {
    description: 'Flex bend radius vs total flex thickness (IPC-6013 dynamic flex 100x, static 10x).',
    spec: { static_ratio_min: 10, dynamic_ratio_min: 100 },
    fail_if: 'bend_radius / flex_thickness < 10',
    severity_default: 'fail',
  },
  SILK_OVER_PAD: {
    description: 'Silkscreen must not overlap SMD pads (assembly contamination + cosmetic).',
    spec: { allow_overlap_mm: 0 },
    fail_if: 'overlap_mm > 0',
    severity_default: 'warn',
  },
  VIA_IN_PAD: {
    description: 'Sub-0.8mm pitch BGA requires filled, capped via-in-pad.',
    spec: { required_if_pitch_lt_mm: 0.80 },
    severity_default: 'fail',
  },
  TRACE_TO_EDGE: {
    description: 'Signal trace clearance to PCB edge for routing margin.',
    spec: { min_trace_to_edge_mm: 0.25 },
    fail_if: 'trace_to_edge_mm < 0.25',
    severity_default: 'warn',
  },
};

router.get('/rules', (_req, res) => res.json(RULE_SPECS));

router.get('/bom/:bomId', async (req, res) => {
  try {
    const r = await db.query(
      'SELECT * FROM dfm_checks WHERE bom_id=$1 ORDER BY status, severity, id',
      [req.params.bomId]
    );
    const counts = { fail: 0, warn: 0, info: 0, total: r.rows.length, open: 0, fixed: 0, waived: 0 };
    for (const x of r.rows) {
      counts[x.severity] = (counts[x.severity] || 0) + 1;
      counts[x.status] = (counts[x.status] || 0) + 1;
    }
    res.json({ bom_id: parseInt(req.params.bomId, 10), counts, items: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM dfm_checks WHERE id=$1', [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const f = req.body || {};
    if (!f.rule_code) return res.status(400).json({ error: 'rule_code required' });
    if (!RULE_SPECS[f.rule_code]) return res.status(400).json({ error: `unknown rule_code ${f.rule_code}` });
    const sev = f.severity || RULE_SPECS[f.rule_code].severity_default;
    const r = await db.query(`
      INSERT INTO dfm_checks (bom_id, rule_code, rule_description, severity, location, measured_value, spec_value, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [f.bom_id, f.rule_code, f.rule_description || RULE_SPECS[f.rule_code].description, sev,
       f.location, f.measured_value, f.spec_value, f.status || 'open']
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const f = req.body;
    const r = await db.query(`
      UPDATE dfm_checks SET bom_id=$1, rule_code=$2, rule_description=$3, severity=$4, location=$5,
        measured_value=$6, spec_value=$7, status=$8, waiver_reason=$9 WHERE id=$10 RETURNING *`,
      [f.bom_id, f.rule_code, f.rule_description, f.severity, f.location, f.measured_value, f.spec_value,
       f.status, f.waiver_reason, req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/waive', async (req, res) => {
  try {
    const r = await db.query(
      "UPDATE dfm_checks SET status='waived', waiver_reason=$1 WHERE id=$2 RETURNING *",
      [req.body?.reason || 'No reason provided', req.params.id]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/resolve', async (req, res) => {
  try {
    const r = await db.query("UPDATE dfm_checks SET status='fixed' WHERE id=$1 RETURNING *", [req.params.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM dfm_checks WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Synthetic rule pass: client sends measurements; we evaluate vs RULE_SPECS and persist findings.
router.post('/run/:bomId', async (req, res) => {
  try {
    const m = req.body?.measurements || {};
    const findings = [];

    function add(code, location, measured, spec, severity) {
      findings.push({ rule_code: code, location, measured, spec, severity, description: RULE_SPECS[code].description });
    }

    if (m.acute_angle_deg !== undefined && m.acute_angle_deg < RULE_SPECS.ACUTE_ANGLE.spec.min_angle_deg) {
      add('ACUTE_ANGLE', m.acute_angle_location || 'unspecified',
          `${m.acute_angle_deg}deg`, `>=${RULE_SPECS.ACUTE_ANGLE.spec.min_angle_deg}deg`, 'warn');
    }
    if (m.bga_pitch_mm !== undefined) {
      const layers = parseInt(m.layers || 4, 10);
      if (m.bga_pitch_mm < 0.50) add('BGA_PITCH', m.bga_location || 'BGA', `${m.bga_pitch_mm}mm`, 'HDI required', 'fail');
      else if (m.bga_pitch_mm < 0.80 && layers < 6) add('BGA_PITCH', m.bga_location || 'BGA',
          `${m.bga_pitch_mm}mm @ ${layers}L`, '>=0.80mm @ 4L or use 6L+', 'fail');
    }
    if (m.bga_pitch_mm !== undefined && m.bga_pitch_mm < 0.80 && !m.via_in_pad) {
      add('VIA_IN_PAD', m.bga_location || 'BGA', 'standard via', 'via-in-pad filled/capped', 'fail');
    }
    if (m.pour_to_edge_mm !== undefined && m.pour_to_edge_mm < RULE_SPECS.COPPER_POUR.spec.min_pour_to_edge_mm) {
      add('COPPER_POUR', 'board edge', `${m.pour_to_edge_mm}mm`,
          `>=${RULE_SPECS.COPPER_POUR.spec.min_pour_to_edge_mm}mm`, 'fail');
    }
    if (m.flex_bend_radius_mm !== undefined && m.flex_thickness_mm) {
      const ratio = m.flex_bend_radius_mm / m.flex_thickness_mm;
      if (ratio < 10) add('FPC_BEND', m.flex_location || 'FPC',
          `${ratio.toFixed(1)}x thickness`, '>=10x (static), >=100x (dynamic)', 'fail');
    }
    if (m.silk_overlaps_pad === true) {
      add('SILK_OVER_PAD', m.silk_location || 'unspecified', 'overlap', 'no overlap', 'warn');
    }
    if (m.trace_to_edge_mm !== undefined && m.trace_to_edge_mm < RULE_SPECS.TRACE_TO_EDGE.spec.min_trace_to_edge_mm) {
      add('TRACE_TO_EDGE', m.trace_location || 'edge', `${m.trace_to_edge_mm}mm`,
          `>=${RULE_SPECS.TRACE_TO_EDGE.spec.min_trace_to_edge_mm}mm`, 'warn');
    }

    // Persist findings to dfm_checks
    for (const f of findings) {
      try {
        await db.query(`
          INSERT INTO dfm_checks (bom_id, rule_code, rule_description, severity, location, measured_value, spec_value, status)
          VALUES ($1,$2,$3,$4,$5,$6,$7,'open')`,
          [req.params.bomId, f.rule_code, f.description, f.severity, f.location, f.measured, f.spec]);
      } catch (_) { /* swallow per-row */ }
    }

    res.json({
      bom_id: parseInt(req.params.bomId, 10),
      findings_count: findings.length,
      findings,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
