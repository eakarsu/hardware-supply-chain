# HardwareOS supply-chain workflow

HardwareOS now exposes a bounded operational workflow for hardware sourcing and incoming quality. Its production boundary is the Express API in `backend/server.js`; generated gap/AI/sample routes are not mounted and their frontend routes are not executable.

## Proven workflow

- register BOM, supplier, inventory, quality, schedule, telemetry, and work-order source systems and explicitly mark authoritative systems;
- ingest source events idempotently using `(source, event ID)` plus a canonical payload hash that rejects event-ID substitution;
- receive traceable `EA` inventory lots, run deterministic AQL inspection decisions, enforce lot states, optimistic versions, and append-only lot events;
- generate constraint-aware supply plans only from accepted authoritative evidence, excluding disrupted suppliers, stale telemetry, wrong units, and insufficient inventory;
- expose shortages, stale-data uncertainty, confidence, deterministic safety rules, and stable tie-breaking;
- require an independent approver and reason for human allocation overrides;
- apply, roll back with compensating releases, and replan with parent lineage.

The planning engine never uses an LLM for allocation, quality, state, or safety decisions.

## Setup and operations

Requirements: Node 22+ and PostgreSQL 16+.

```bash
cp .env.example .env
# Replace every sample credential.
cd backend
npm ci
npm run migrate
npm start
```

Migrations are an explicit deployment step and are safe to rerun. Server startup never creates or seeds data, installs packages, kills processes, or mutates schema. `/api/health/live` is process liveness; `/api/health/ready` requires a database connection and migration `001_operational_workflow`.

Local ignored `.env` files containing wildcard CORS and weak development secrets were removed on 2026-07-20. Git history contains no tracked `.env` or `backend/.env` entries. If those values were ever reused outside this workspace, rotate them anyway.

Production configuration requires:

- `DATABASE_URL`;
- a random `JWT_SECRET` of at least 32 characters;
- explicit HTTPS `CORS_ORIGINS`;
- `AUTHORITATIVE_PROVIDER_KINDS` listing all seven required connector classes.

JWTs use HS256 with fixed issuer/audience and 30-minute expiry. Source registration requires an admin token. Request bodies are capped at 256 KiB and the API has a per-process request-rate guard; distributed deployments should enforce rate limits at the gateway too.

## Verification

```bash
cd backend
npm test
node --check server.js
node --check routes/operations.js
npm audit --omit=dev

cd ../frontend
npm ci
npm run build
npm audit --omit=dev
```

CI applies the migration twice against PostgreSQL 16, runs deterministic workflow tests, checks server syntax, builds the frontend, and fails on production dependency vulnerabilities. Tests cover disrupted supply, late telemetry, unit mismatches, duplicate/replayed payload identity, invalid lot transitions, deterministic inspection, independent overrides, rollback, and replanning.

## External connectors

The source registry is the typed boundary for external systems. A production connector must authenticate at the gateway, translate its native contract to `/api/operations/events`, include the original occurrence timestamp, and retain the returned event ID/result. Mark a source authoritative only after contract, unit, clock-skew, replay, and ownership validation. Provider credentials belong in the deployment secret store, never this repository.
