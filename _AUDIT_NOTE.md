# HardwareOS — Audit Note

Last updated: 2026-05-07

## Stack
- Backend: Express + Postgres (port 3009, DB `hardware_supply_db`)
- Frontend: React + Vite + Tailwind (port 5173)
- Auth: JWT bearer; users table uses `password` column (NOT `password_hash`)
- AI: OpenRouter (env `OPENROUTER_API_KEY`, optional model `OPENROUTER_MODEL`)
- Login: admin@demo.com / demo123

## Routes (backend/routes)
- auth, parts, suppliers, orders, iterations, quality, manufacturers
- ai (lead-time, supplier-rec, bottleneck, cost, supplier-risk, bom-optimizer, defect-predictor, demand-forecast, geopolitical-analyzer)
- export (CSV per entity), search (cross-entity + filters), audit (audit_log)

## Conventions
- All non-auth routes guarded by middleware/auth.js
- AI helper `callAI()` throws `code='AI_UNAVAILABLE'` -> handler returns 503
- AI invocations and CSV exports auto-write to `audit_log` (best-effort, swallowed on failure)
- Schema changes are idempotent (`CREATE TABLE IF NOT EXISTS`)

## Pages (frontend/src/pages)
- Dashboard (post-login landing), PartsPage, SuppliersPage, OrdersPage, IterationsPage, QualityPage, ManufacturersPage
- AICenterPage (9 tabs), SearchPage, AuditLogPage, ExportPage, SampleDataPage

## Recent Additions (2026-05-07)
5 new AI features + 3 utility features fully wired. See
`/Users/erolakarsu/projects/_AUDIT/apply3_logs/feature_add_hardware-supply-chain.md`
for the full changelog and smoke-test results.

Sample Data admin page added: `POST /api/admin/sample-data/:entity`
(JWT-protected) seeds 5-10 domain-realistic rows per entity (parts,
suppliers, manufacturers, orders, iterations, quality). Frontend page
`/sample-data` wired into Tools sidebar. Smoke-tested 200 OK on port
3009. See `/Users/erolakarsu/projects/_AUDIT/apply3_logs/sample_data_hardware-supply-chain.md`.

Dashboard page added (2026-05-07): first sidebar entry (LayoutDashboard
icon) and post-login landing at `/dashboard`. Backend
`GET /api/dashboard/stats` (JWT-protected) aggregates KPIs (parts,
suppliers, manufacturers, open_orders, quality_issues,
recent_iterations[30d], low_stock, totals) plus 10 latest `audit_log`
entries. Quick actions link to AI Center, Parts, Suppliers, Sample
Data. Smoke-tested 200 on port 3009 with admin@demo.com/demo123;
401 without bearer. See
`/Users/erolakarsu/projects/_AUDIT/apply3_logs/dashboard_hardware-supply-chain.md`.

## Apply pass 7 (full backlog implementation)

Date: 2026-05-21. Wired all 16 orphaned scaffolded pages (Cf* and Gap*) and
added a new mission-critical Iteration Speed dashboard.

Backlog items addressed:
- 5 Cf* iteration-speed pages (DFM Agent, Port Disruption, Auto-RFQ Blast,
  Shenzhen Tracker, Tariff Sourcing) — backend routes existed since pass 4
  but pages had no nav entry or App.tsx route.
- 11 Gap* feature pages (Shenzhen vs US, Factory Handoff, DFM Advisor,
  Customs/Tariff, Incoming Inspection, CAD Upload, Shipping Tracking,
  Payments/LC, Mobile Intake, EDI Portal, QR Tracking) — same situation.
- New Iteration Speed dashboard (`/iteration-speed`,
  `GET /api/iteration-speed/summary`, `POST/DELETE /api/iteration-speed/baseline`)
  — pure SQL aggregator over `iterations` + new `iteration_speed_baselines`
  table; reports avg/median/min/max loop hours, by-engineer leaderboard,
  fastest-iterating parts, 180-day weekly trend, and team-vs-Shenzhen /
  team-vs-US multipliers (Shenzhen 24h, US 168h reference baselines from
  description.txt).

Files added:
- backend/routes/iteration-speed.js
- frontend/src/pages/IterationSpeedPage.tsx

Files modified:
- backend/server.js — moved `app.listen` to bottom; mounted iteration-speed
  router BEFORE the 404 handler (previous Cf/Gap mounts were after
  `app.listen`, technically working but bad-pattern; now all routes are
  mounted in a single block before the 404).
- frontend/src/App.tsx — added 17 new `<Route>` entries (16 Cf/Gap + 1
  iteration-speed) inside the Layout-protected tree.
- frontend/src/components/Layout.tsx — added two new sidebar groups
  ("Iteration Speed" with 5 Cf items, "Gap Features" with 11 Gap items),
  added `/iteration-speed` to the Deep Features group, and pulled in the
  required lucide icons.
- frontend/src/api.ts — added `getIterationSpeed`, `addIterationBaseline`,
  `deleteIterationBaseline` client methods.

Schema:
- `iteration_speed_baselines (id, region, part_category, baseline_hours,
  source, created_at)` — created idempotently with CREATE TABLE IF NOT
  EXISTS on first call.

Skipped per task constraints:
- NEEDS-CREDS: AI endpoints already return graceful "AI unavailable" string
  when OPENROUTER_API_KEY is missing — no change needed.
- TOO-RISKY: TimelineView/Codex pages route outside Layout (custom chrome)
  — left intact; pre-existing TS6133 warnings in those files predate this
  pass.

Syntax: `node --check backend/server.js` and
`node --check backend/routes/iteration-speed.js` both clean.
`tsc --noEmit` introduces 0 new errors (3 pre-existing TS6133 warnings
unrelated to this pass).

Status: COMPLETE.

---

Sample-prefill buttons added to all 9 tabs of `AICenterPage.tsx`
(2-3 per tab, real hardware data: H100/EPYC/Xeon/DDR5, TSMC/Foxconn/
Pegatron/Wistron/Murata/Samsung, Taiwan-Strait + China-export-control
scenarios). Inline samples — single-page AI center didn't warrant
abstraction. `vite build` clean, `POST /api/auth/login` 200, AI
endpoint smoke-test 200. See
`/Users/erolakarsu/projects/_AUDIT/apply3_logs/samples_hardware-supply-chain.md`.
