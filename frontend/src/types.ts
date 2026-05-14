export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Part {
  id: number;
  name: string;
  part_number: string;
  description: string;
  material: string;
  category: string;
  unit_cost: number;
  weight_grams: number;
  lead_time_days: number;
  status: string;
  in_stock: number;
  reorder_threshold: number;
  created_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  country: string;
  city: string;
  contact_email: string;
  contact_phone: string;
  lead_time_days: number;
  reliability_score: number;
  min_order_qty: number;
  payment_terms: string;
  certifications: string;
  active: boolean;
  joined_date: string;
}

export interface Order {
  id: number;
  part_id: number;
  supplier_id: number;
  part_name: string;
  part_number: string;
  supplier_name: string;
  quantity: number;
  unit_price: number;
  total_cost: number;
  status: string;
  ordered_at: string;
  expected_by: string;
  received_at: string;
  tracking_number: string;
  notes: string;
}

export interface Iteration {
  id: number;
  part_id: number;
  part_name: string;
  part_number: string;
  version: string;
  changes: string;
  engineer: string;
  started_at: string;
  completed_at: string;
  success: boolean;
  iteration_hours: number;
  cad_file_url: string;
  notes: string;
}

export interface QualityCheck {
  id: number;
  part_id: number;
  order_id: number;
  part_name: string;
  part_number: string;
  tracking_number: string;
  inspector: string;
  pass: boolean;
  defect_rate: number;
  sample_size: number;
  notes: string;
  check_date: string;
  failure_modes: string;
  corrective_action: string;
}

export interface Manufacturer {
  id: number;
  name: string;
  location: string;
  country: string;
  capacity_per_day: number;
  specialization: string;
  rating: number;
  certifications: string;
  min_run: number;
  turnaround_days: number;
  contact: string;
}
