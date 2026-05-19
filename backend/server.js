require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/parts', require('./routes/parts'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/iterations', require('./routes/iterations'));
app.use('/api/quality', require('./routes/quality'));
app.use('/api/manufacturers', require('./routes/manufacturers'));
app.use('/api/export', require('./routes/export'));
app.use('/api/search', require('./routes/search'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/admin', require('./routes/sample_data'));
app.use('/api/dashboard', require('./routes/dashboard'));

const PORT = process.env.PORT || 3009;
app.listen(PORT, () => console.log(`HardwareOS API running on port ${PORT}`));
app.use('/api/gap-ai-shenzhen-vs-us', require('./routes/gap-ai-shenzhen-vs-us'));
app.use('/api/gap-ai-factory-handoff', require('./routes/gap-ai-factory-handoff'));
app.use('/api/gap-ai-dfm-advisor', require('./routes/gap-ai-dfm-advisor'));
app.use('/api/gap-ai-customs-tariff', require('./routes/gap-ai-customs-tariff'));
app.use('/api/gap-ai-incoming-inspection', require('./routes/gap-ai-incoming-inspection'));
app.use('/api/gap-nonai-cad-upload', require('./routes/gap-nonai-cad-upload'));
app.use('/api/gap-nonai-shipping-tracking', require('./routes/gap-nonai-shipping-tracking'));
app.use('/api/gap-nonai-payments-lc', require('./routes/gap-nonai-payments-lc'));
app.use('/api/gap-nonai-mobile-intake', require('./routes/gap-nonai-mobile-intake'));
app.use('/api/gap-nonai-edi-portal', require('./routes/gap-nonai-edi-portal'));
app.use('/api/gap-nonai-qr-tracking', require('./routes/gap-nonai-qr-tracking'));
app.use('/api/cf-shenzhen-tracker', require('./routes/cf-shenzhen-tracker'));
app.use('/api/cf-rfq-blast', require('./routes/cf-rfq-blast'));
app.use('/api/cf-tariff-sourcing', require('./routes/cf-tariff-sourcing'));
app.use('/api/cf-dfm-agent', require('./routes/cf-dfm-agent'));
app.use('/api/cf-port-disruption', require('./routes/cf-port-disruption'));

// Deep features (audit 2026-05-14)
app.use('/api/bom', require('./routes/bom'));
app.use('/api/components', require('./routes/components'));
app.use('/api/landed-cost', require('./routes/landed-cost'));
app.use('/api/cm-lead-times', require('./routes/cm-lead-times'));
app.use('/api/dfm', require('./routes/dfm'));
app.use('/api/ecn', require('./routes/ecn'));
app.use('/api/aql', require('./routes/aql'));

// Supply Views — custom views (audit 2026-05-18)
app.use('/api/custom-views', require('./routes/customViews'));

// Health endpoint (mounted before any 404 handler)
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'hardware-supply-chain', ts: new Date().toISOString() }));

// 404 fallback for unknown /api routes (must remain last)
app.use('/api', (req, res) => res.status(404).json({ error: 'not found', path: req.path }));
