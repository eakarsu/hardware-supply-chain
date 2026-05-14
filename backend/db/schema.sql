-- HardwareOS Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  part_number VARCHAR(100),
  description TEXT,
  material VARCHAR(100),
  category VARCHAR(100),
  unit_cost DECIMAL,
  weight_grams DECIMAL,
  lead_time_days INTEGER,
  status VARCHAR(30),
  in_stock INTEGER DEFAULT 0,
  reorder_threshold INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100),
  city VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  lead_time_days INTEGER,
  reliability_score DECIMAL,
  min_order_qty INTEGER,
  payment_terms VARCHAR(50),
  certifications TEXT,
  active BOOLEAN DEFAULT TRUE,
  joined_date DATE
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  part_id INT REFERENCES parts(id),
  supplier_id INT REFERENCES suppliers(id),
  quantity INTEGER,
  unit_price DECIMAL,
  total_cost DECIMAL,
  status VARCHAR(30),
  ordered_at TIMESTAMP DEFAULT NOW(),
  expected_by DATE,
  received_at TIMESTAMP,
  tracking_number VARCHAR(100),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS iterations (
  id SERIAL PRIMARY KEY,
  part_id INT REFERENCES parts(id),
  version VARCHAR(20),
  changes TEXT,
  engineer VARCHAR(255),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  success BOOLEAN,
  iteration_hours DECIMAL,
  cad_file_url VARCHAR(255),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS quality_checks (
  id SERIAL PRIMARY KEY,
  part_id INT REFERENCES parts(id),
  order_id INT REFERENCES orders(id),
  inspector VARCHAR(255),
  pass BOOLEAN,
  defect_rate DECIMAL,
  sample_size INTEGER,
  notes TEXT,
  check_date DATE,
  failure_modes TEXT,
  corrective_action TEXT
);

CREATE TABLE IF NOT EXISTS manufacturers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  country VARCHAR(100),
  capacity_per_day INTEGER,
  specialization TEXT,
  rating DECIMAL,
  certifications TEXT,
  min_run INTEGER,
  turnaround_days INTEGER,
  contact VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- =========================================================================
-- Deep feature tables (audit 2026-05-14):
-- BOM, component lifecycle, landed cost, CM lead-time, DFM, ECN/PPAP, AQL
-- =========================================================================

-- A component is a real electronic / mechanical part with an MPN, manufacturer,
-- lifecycle status, and references to distributor offerings.
CREATE TABLE IF NOT EXISTS components (
  id SERIAL PRIMARY KEY,
  mpn VARCHAR(120) NOT NULL,
  manufacturer VARCHAR(120) NOT NULL,
  description TEXT,
  package VARCHAR(60),
  category VARCHAR(80),
  rohs BOOLEAN DEFAULT TRUE,
  lifecycle VARCHAR(20) DEFAULT 'Active', -- Active, NRND, EOL, Obsolete, Preview
  last_buy_date DATE,
  datasheet_url TEXT,
  pin_count INTEGER,
  pitch_mm DECIMAL,
  operating_temp_min INTEGER,
  operating_temp_max INTEGER,
  unit_price_break_qty INTEGER,
  unit_price DECIMAL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(mpn, manufacturer)
);
CREATE INDEX IF NOT EXISTS idx_components_lifecycle ON components(lifecycle);
CREATE INDEX IF NOT EXISTS idx_components_manufacturer ON components(manufacturer);

-- Distributor offerings (Digi-Key, Mouser, Arrow, Avnet, LCSC, Newark)
CREATE TABLE IF NOT EXISTS distributor_offerings (
  id SERIAL PRIMARY KEY,
  component_id INTEGER REFERENCES components(id) ON DELETE CASCADE,
  distributor VARCHAR(60) NOT NULL,
  distributor_sku VARCHAR(120) NOT NULL,
  stock INTEGER DEFAULT 0,
  factory_stock INTEGER DEFAULT 0,
  moq INTEGER DEFAULT 1,
  spq INTEGER DEFAULT 1,
  price_break_1 INTEGER,  cost_break_1 DECIMAL,
  price_break_100 INTEGER, cost_break_100 DECIMAL,
  price_break_1000 INTEGER, cost_break_1000 DECIMAL,
  lead_time_days INTEGER,
  url TEXT,
  last_checked TIMESTAMP DEFAULT NOW(),
  UNIQUE(distributor, distributor_sku)
);
CREATE INDEX IF NOT EXISTS idx_distoff_component ON distributor_offerings(component_id);

-- Bill of Materials header (one per product/revision)
CREATE TABLE IF NOT EXISTS bom_headers (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(200) NOT NULL,
  revision VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, released, frozen, superseded
  target_qty INTEGER DEFAULT 1,
  owner VARCHAR(120),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_name, revision)
);

-- BOM lines
CREATE TABLE IF NOT EXISTS bom_lines (
  id SERIAL PRIMARY KEY,
  bom_id INTEGER REFERENCES bom_headers(id) ON DELETE CASCADE,
  ref_designator VARCHAR(80),     -- e.g. "C1,C2,C3" or "U7"
  component_id INTEGER REFERENCES components(id),
  qty_per_assembly DECIMAL NOT NULL DEFAULT 1,
  do_not_populate BOOLEAN DEFAULT FALSE,
  preferred_distributor VARCHAR(60),
  alt_mpn_1 VARCHAR(120),
  alt_mpn_2 VARCHAR(120),
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_bom_lines_bom ON bom_lines(bom_id);

-- Contract manufacturer lead-time observations
CREATE TABLE IF NOT EXISTS cm_lead_times (
  id SERIAL PRIMARY KEY,
  cm_name VARCHAR(120) NOT NULL,   -- Foxconn, Pegatron, Jabil, Flex, Wistron, Sanmina
  cm_site VARCHAR(120),            -- Shenzhen Longhua, Suzhou, Penang, Guadalajara
  process VARCHAR(60),             -- SMT, AOI, ICT, FATP, NPI
  quoted_days INTEGER,
  actual_days INTEGER,
  pcs INTEGER,
  yield_pct DECIMAL,
  observed_on DATE,
  notes TEXT
);

-- Landed-cost roll-up entries (FOB + duty + freight + carrying)
CREATE TABLE IF NOT EXISTS landed_costs (
  id SERIAL PRIMARY KEY,
  bom_id INTEGER REFERENCES bom_headers(id) ON DELETE CASCADE,
  origin_country VARCHAR(60),
  destination_country VARCHAR(60),
  incoterm VARCHAR(10),            -- FOB, EXW, CIF, DDP
  fob_total_usd DECIMAL,
  duty_pct DECIMAL,                -- HTS-derived duty rate
  freight_usd DECIMAL,             -- freight cost for the lot
  insurance_usd DECIMAL,
  brokerage_usd DECIMAL,
  carrying_pct_per_year DECIMAL,   -- e.g. 0.18 = 18%
  days_in_inventory INTEGER,
  lot_qty INTEGER,
  computed_landed_per_unit DECIMAL,
  computed_at TIMESTAMP DEFAULT NOW()
);

-- Design-For-Manufacture rule checks (PCB / mechanical)
CREATE TABLE IF NOT EXISTS dfm_checks (
  id SERIAL PRIMARY KEY,
  bom_id INTEGER REFERENCES bom_headers(id) ON DELETE CASCADE,
  rule_code VARCHAR(60),           -- ACUTE_ANGLE, BGA_PITCH, COPPER_POUR, FPC_BEND, SILK_OVER_PAD
  rule_description TEXT,
  severity VARCHAR(20),            -- info, warn, fail
  location VARCHAR(120),           -- ref designator or coordinate
  measured_value VARCHAR(60),
  spec_value VARCHAR(60),
  status VARCHAR(20) DEFAULT 'open', -- open, waived, fixed
  waiver_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ECN (Engineering Change Notice) / PPAP workflow
CREATE TABLE IF NOT EXISTS ecns (
  id SERIAL PRIMARY KEY,
  ecn_number VARCHAR(40) UNIQUE NOT NULL,
  bom_id INTEGER REFERENCES bom_headers(id),
  change_type VARCHAR(40),         -- MPN_SWAP, REV_BUMP, SOURCE_ADD, OBSOLETE_REPLACEMENT
  description TEXT,
  reason TEXT,                     -- COST, EOL, SHORTAGE, QUALITY, REGULATORY
  status VARCHAR(30) DEFAULT 'draft', -- draft, in_review, approved, rejected, implemented
  ppap_level INTEGER,              -- 1..5 (automotive PPAP levels)
  ppap_required_docs TEXT,         -- comma list: DFMEA,PFMEA,CONTROL_PLAN,...
  initiated_by VARCHAR(120),
  approved_by VARCHAR(120),
  approved_at TIMESTAMP,
  target_effective_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AQL inspection plans (ISO 2859-1)
CREATE TABLE IF NOT EXISTS aql_plans (
  id SERIAL PRIMARY KEY,
  lot_size_min INTEGER,
  lot_size_max INTEGER,
  inspection_level VARCHAR(5),     -- I, II, III, S-1..S-4
  code_letter CHAR(1),             -- A..R
  aql_pct DECIMAL,                 -- 0.065, 0.10, ..., 6.5
  sample_size INTEGER,
  accept INTEGER,
  reject INTEGER,
  plan_type VARCHAR(20) DEFAULT 'normal' -- normal, tightened, reduced
);

-- Recorded inspections referencing an AQL plan
CREATE TABLE IF NOT EXISTS aql_inspections (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  plan_id INTEGER REFERENCES aql_plans(id),
  lot_size INTEGER,
  sample_size INTEGER,
  defects_found INTEGER,
  decision VARCHAR(20),            -- accept, reject, retest
  inspector VARCHAR(120),
  inspected_at TIMESTAMP DEFAULT NOW(),
  notes TEXT
);

