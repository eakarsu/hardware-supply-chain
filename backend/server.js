require('dotenv').config({ path: require('path').join(__dirname, '../.env'), quiet: true });
const express = require('express');
const cors = require('cors');
const { loadConfig } = require('./config');
const db = require('./db');

const config = loadConfig();
const app = express();
app.disable('x-powered-by');
app.use(cors({ origin(origin, callback) {
  if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('origin not allowed'));
}, credentials: false }));
app.use(express.json({ limit: '256kb', strict: true }));

const requests = new Map();
app.use((req, res, next) => {
  const now = Date.now();
  const key = req.ip;
  const record = requests.get(key) || { since: now, count: 0 };
  if (now - record.since > 60_000) { record.since = now; record.count = 0; }
  record.count += 1;
  requests.set(key, record);
  if (record.count > 180) return res.status(429).json({ error: 'rate limit exceeded' });
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/runtime-ai', require('./routes/runtimeAi'));
app.use('/api/bom', require('./routes/bom'));
app.use('/api/components', require('./routes/components'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/parts', require('./routes/parts'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/iterations', require('./routes/iterations'));
app.use('/api/quality', require('./routes/quality'));
app.use('/api/manufacturers', require('./routes/manufacturers'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/search', require('./routes/search'));
app.use('/api/export', require('./routes/export'));
app.use('/api/landed-cost', require('./routes/landed-cost'));
app.use('/api/cm-lead-times', require('./routes/cm-lead-times'));
app.use('/api/dfm', require('./routes/dfm'));
app.use('/api/ecn', require('./routes/ecn'));
app.use('/api/aql', require('./routes/aql'));
app.use('/api/custom-views', require('./routes/customViews'));
app.use('/api/golden-sample-control', require('./routes/goldenSampleControl'));
app.use('/api/iteration-speed', require('./routes/iteration-speed'));
app.use('/api/operations', require('./routes/operations'));
app.use('/api/audit', require('./routes/audit'));

app.get('/api/health/live', (_req, res) => res.json({ status: 'ok' }));
app.get('/api/health/ready', async (_req, res) => {
  try {
    const result = await db.query("SELECT version FROM schema_migrations WHERE version='001_operational_workflow'");
    if (!result.rows[0]) return res.status(503).json({ status: 'not_ready', reason: 'migration_required' });
    res.json({ status: 'ready', migration: result.rows[0].version });
  } catch { res.status(503).json({ status: 'not_ready' }); }
});
app.use('/api', (req, res) => res.status(404).json({ error: 'not found', path: req.path }));
app.use((error, _req, res, _next) => res.status(400).json({ error: error.message === 'origin not allowed' ? error.message : 'invalid request' }));

if (require.main === module) app.listen(config.port, () => console.log(`HardwareOS API listening on ${config.port}`));

module.exports = app;
