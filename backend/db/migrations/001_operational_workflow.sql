CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'operator';
ALTER TABLE users ADD CONSTRAINT users_role_valid CHECK (role IN ('operator','quality','planner','admin')) NOT VALID;

CREATE TABLE IF NOT EXISTS source_systems (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('bom','supplier','inventory','quality','schedule','telemetry','work_order')),
  authoritative BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingest_events (
  id BIGSERIAL PRIMARY KEY,
  source_id BIGINT NOT NULL REFERENCES source_systems(id),
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL,
  payload_hash CHAR(64) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('accepted','rejected','duplicate')),
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(source_id, event_id)
);

CREATE TABLE IF NOT EXISTS inventory_lots (
  id BIGSERIAL PRIMARY KEY,
  part_id INTEGER NOT NULL REFERENCES parts(id),
  supplier_id INTEGER REFERENCES suppliers(id),
  lot_code TEXT NOT NULL UNIQUE,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  unit TEXT NOT NULL CHECK (unit IN ('EA')),
  status TEXT NOT NULL DEFAULT 'expected' CHECK (status IN ('expected','received','quarantined','released','rejected','consumed')),
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lot_events (
  id BIGSERIAL PRIMARY KEY,
  lot_id BIGINT NOT NULL REFERENCES inventory_lots(id),
  sequence INTEGER NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor TEXT NOT NULL,
  reason TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(lot_id, sequence)
);

CREATE TABLE IF NOT EXISTS inspection_records (
  id BIGSERIAL PRIMARY KEY,
  lot_id BIGINT NOT NULL REFERENCES inventory_lots(id),
  sample_size INTEGER NOT NULL CHECK (sample_size > 0),
  defects_found INTEGER NOT NULL CHECK (defects_found >= 0 AND defects_found <= sample_size),
  accept_at INTEGER NOT NULL,
  reject_at INTEGER NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('accepted','rejected','retest')),
  inspector TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supply_plans (
  id BIGSERIAL PRIMARY KEY,
  parent_plan_id BIGINT REFERENCES supply_plans(id),
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('BLOCKED','PROPOSED','APPROVED','APPLIED','ROLLED_BACK')),
  inputs JSONB NOT NULL,
  output JSONB NOT NULL,
  uncertainty JSONB NOT NULL DEFAULT '[]'::jsonb,
  proposed_by TEXT NOT NULL,
  approved_by TEXT,
  override_reason TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supply_exceptions (
  id BIGSERIAL PRIMARY KEY,
  exception_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','approved','resolved')),
  evidence JSONB NOT NULL,
  proposed_by TEXT NOT NULL,
  approved_by TEXT,
  resolution TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  CREATE OR REPLACE FUNCTION reject_lot_event_mutation() RETURNS trigger AS $fn$
  BEGIN RAISE EXCEPTION 'lot_events are append-only'; END; $fn$ LANGUAGE plpgsql;
  DROP TRIGGER IF EXISTS lot_events_append_only ON lot_events;
  CREATE TRIGGER lot_events_append_only BEFORE UPDATE OR DELETE ON lot_events
    FOR EACH ROW EXECUTE FUNCTION reject_lot_event_mutation();
END $$;
