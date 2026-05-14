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
