# Completeness Review: hardware-supply-chain

**Review date:** 2026-07-18

## Assessment basis

Static inspection of project-owned source and configuration only; no dependency installation, build, database migration, external-service call, or runtime launch was performed. The scan considered 117 project files (101 source files), 3 manifest(s), 0 test-like file(s), and 0 CI workflow(s), excluding dependency/generated directories.

## Classification

**Prototype-demo**

This is a prototype/demo for industrial/supply-chain. Generated gap/demo patterns are present: it contains 101 source files and visible routes/pages in `frontend/`, `backend/`, but those surfaces are not evidence of durable domain execution, verified integrations, or operational completion.

## Why it is not complete

- Generated gap/visualization routes describe missing capabilities or simulate recommendations; they do not implement the underlying domain operation.
- Generic LLM calls are used as product behavior without enough typed tools, grounded evidence, deterministic rules, or output evaluation.
- Mock, demo, sample, fixture, or placeholder behavior remains in executable/product paths.
- No recognizable project-owned automated tests were found for the main workflow.
- No checked-in CI workflow proves builds, tests, migrations, and security checks on every change.

## Needed features

1. Connect authoritative BOM, supplier, inventory, quality, schedule, telemetry, and work-order data sources.
2. Implement traceable state transitions for parts, lots, inspections, exceptions, approvals, and change orders.
3. Add constraint-aware planning with human override, uncertainty reporting, and deterministic safety/business rules.
4. Test disrupted supply, late telemetry, unit mismatches, duplicate events, and rollback/replanning scenarios.
5. Add risk-based unit, integration, and end-to-end tests in CI, including migration and failure-path coverage.

## Risks or launch blockers

- Credential/configuration exposure: environment files are present in the repository tree and must be checked against Git history and rotated if real.
- Automation contains destructive process, filesystem, or database operations; do not run it on a shared machine without review.
- Startup appears coupled to seed/migration behavior, risking data mutation or non-repeatable launches.
- AI-provider availability, cost, privacy, prompt injection, and unvalidated output are launch risks until bounded and evaluated.

## Evidence inspected

- `frontend/src/App.tsx:44`
- `frontend/src/components/BomPdfExporter.tsx:48`
- `backend/server.js`
- `backend/middleware/auth.js`
- `requirements.txt`
- `start.sh`

## Recommended next action

Stop adding generated pages; prove one industrial/supply-chain workflow against real services and persistent state, with tests and measurable acceptance criteria.

## Implementation progress (2026-07-20)

Implemented a persistent, deterministic sourcing and incoming-quality workflow. The new authoritative source registry covers BOM, supplier, inventory, quality, schedule, telemetry, and work-order connector classes; ingestion uses source/event idempotency plus canonical payload hashes and rejects replay substitution. Inventory lots now have constrained traceable states, optimistic versions, deterministic AQL inspection decisions, append-only lot events, and complete trace reads. Supply planning accepts only offers whose exact payload matches accepted authoritative evidence, enforces exact units and fresh telemetry, excludes active disruptions, reports shortages/uncertainty/confidence and safety rules, uses deterministic selection, requires independently approved human overrides, and supports apply, compensating rollback, and parent-linked replanning.

Added an explicit repeatable PostgreSQL migration and migration-aware readiness; startup no longer kills processes, creates/seeds databases, installs dependencies, or mutates schema. Removed all generated gap/AI/sample routes from the executable backend and UI navigation. Hardened JWT algorithm/issuer/audience/expiry, strong-secret and explicit-CORS validation, production authoritative-provider requirements, bounded JSON input, rate limiting, and admin-only source registration. Removed two ignored local `.env` files containing weak wildcard development settings; Git history contained no tracked copies, and `.env.example` now documents safe configuration.

Added seven deterministic workflow tests for duplicate events, unit mismatches, lot transitions, AQL outcomes, disrupted supply, stale telemetry, independent overrides, rollback, and replanning. CI now applies migrations twice against PostgreSQL 16, runs tests and syntax checks, builds the frontend, audits production dependencies, and scans full history for secrets. Local verification passed all seven tests, backend syntax checks, a real PostgreSQL migration/repeatability smoke test (temporary database removed afterward), frontend production build, zero backend/frontend production dependency audit findings, Gitleaks history/current-tree scans (with three public distributor SKUs narrowly allowlisted as documented false positives), and a clean diff check.

## Runtime acceptance (2026-07-20)

The non-suite validator passed on PostgreSQL `55653`, API `6110`, and UI
`6111` at `2026-07-20T21:12:44Z`, recording
`API_VERIFIED / startup_login_session_api`. The run proved explicit admin
provisioning, bcrypt credential verification, a cryptographically random opaque
session whose hash/expiry/identity are persisted and revalidated in PostgreSQL,
`/api/auth/me`, and a protected operational API. Startup requires explicit
ports/database configuration, migration deployment applies every ordered SQL
migration, and the static demo hash/login control were removed.
