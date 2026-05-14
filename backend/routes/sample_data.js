const router = require('express').Router();
const db = require('../db');
const { verifyToken } = require('../middleware/auth');

// Domain-realistic sample sets for HardwareOS hardware supply chain
const SAMPLES = {
  parts: [
    { name: 'PCB substrate FR-4 (4-layer)', part_number: 'PCB-FR4-04L-160x100', description: 'Glass-reinforced epoxy laminate, 1.6mm, 1oz copper', material: 'FR-4', category: 'electronic', unit_cost: 4.85, weight_grams: 28.5, lead_time_days: 14, status: 'active', in_stock: 1200, reorder_threshold: 200 },
    { name: 'NVIDIA H100 SXM5 GPU module', part_number: 'NV-H100-SXM5-80G', description: 'Hopper architecture, 80GB HBM3, SXM5 form factor', material: 'silicon/copper', category: 'electronic', unit_cost: 28999.00, weight_grams: 850, lead_time_days: 120, status: 'on_order', in_stock: 6, reorder_threshold: 4 },
    { name: 'AMD EPYC 9654 96-core CPU', part_number: 'AMD-9654-SP5', description: 'Zen 4, 96C/192T, 384MB L3, SP5 socket', material: 'silicon', category: 'electronic', unit_cost: 11805.00, weight_grams: 95, lead_time_days: 45, status: 'active', in_stock: 22, reorder_threshold: 10 },
    { name: 'Intel Xeon Platinum 8490H', part_number: 'INT-XEON-8490H', description: 'Sapphire Rapids, 60 cores, LGA4677', material: 'silicon', category: 'electronic', unit_cost: 17000.00, weight_grams: 80, lead_time_days: 35, status: 'active', in_stock: 14, reorder_threshold: 6 },
    { name: 'M.2 2280 NVMe heatsink', part_number: 'HS-M2-2280-AL', description: 'Anodized aluminum heatsink with thermal pad', material: 'aluminum 6063', category: 'mechanical', unit_cost: 3.20, weight_grams: 18, lead_time_days: 10, status: 'active', in_stock: 3500, reorder_threshold: 500 },
    { name: 'Stainless M3x8 socket-head screw', part_number: 'FAS-M3X8-SS304', description: 'ISO 4762 socket cap, A2-70 stainless', material: 'stainless 304', category: 'fastener', unit_cost: 0.04, weight_grams: 0.6, lead_time_days: 5, status: 'active', in_stock: 50000, reorder_threshold: 5000 },
    { name: 'Samsung DDR5-4800 RDIMM 64GB', part_number: 'SAM-M321R8GA0BB0', description: 'Registered ECC, 2Rx4, 1.1V', material: 'silicon/PCB', category: 'electronic', unit_cost: 285.00, weight_grams: 22, lead_time_days: 21, status: 'active', in_stock: 240, reorder_threshold: 60 },
    { name: 'Aluminum CNC chassis 2U', part_number: 'CHA-2U-AL6061', description: 'Machined 2U server chassis, 6061-T6 aluminum', material: 'aluminum 6061-T6', category: 'structural', unit_cost: 89.50, weight_grams: 4200, lead_time_days: 28, status: 'active', in_stock: 75, reorder_threshold: 20 },
  ],

  suppliers: [
    { name: 'Foxconn Technology Group', country: 'Taiwan', city: 'Taipei', contact_email: 'procurement@foxconn.com', contact_phone: '+886-2-2268-3466', lead_time_days: 35, reliability_score: 0.94, min_order_qty: 100, payment_terms: 'Net 60', certifications: 'ISO 9001, ISO 14001, IATF 16949', active: true, joined_date: '2018-04-12' },
    { name: 'Pegatron Corporation', country: 'Taiwan', city: 'Taipei', contact_email: 'sales@pegatroncorp.com', contact_phone: '+886-2-8143-9001', lead_time_days: 30, reliability_score: 0.91, min_order_qty: 50, payment_terms: 'Net 45', certifications: 'ISO 9001, ISO 14001', active: true, joined_date: '2019-09-03' },
    { name: 'Wistron Corporation', country: 'Taiwan', city: 'Hsinchu', contact_email: 'oem@wistron.com', contact_phone: '+886-3-666-1888', lead_time_days: 32, reliability_score: 0.89, min_order_qty: 50, payment_terms: 'Net 45', certifications: 'ISO 9001, RoHS', active: true, joined_date: '2020-02-18' },
    { name: 'TSMC (Taiwan Semiconductor)', country: 'Taiwan', city: 'Hsinchu', contact_email: 'foundry@tsmc.com', contact_phone: '+886-3-563-6688', lead_time_days: 90, reliability_score: 0.97, min_order_qty: 1, payment_terms: 'Net 30', certifications: 'ISO 9001, ISO 14001, ISO 45001', active: true, joined_date: '2017-06-22' },
    { name: 'Murata Manufacturing', country: 'Japan', city: 'Kyoto', contact_email: 'orders@murata.com', contact_phone: '+81-75-951-9111', lead_time_days: 21, reliability_score: 0.96, min_order_qty: 1000, payment_terms: 'Net 30', certifications: 'ISO 9001, IATF 16949', active: true, joined_date: '2016-11-08' },
    { name: 'Shenzhen Kingbrother PCB', country: 'China', city: 'Shenzhen', contact_email: 'sales@kingbrother-pcb.com', contact_phone: '+86-755-2969-1234', lead_time_days: 14, reliability_score: 0.86, min_order_qty: 10, payment_terms: 'Net 30', certifications: 'ISO 9001, UL', active: true, joined_date: '2021-03-15' },
    { name: 'Bossard AG', country: 'Switzerland', city: 'Zug', contact_email: 'contact@bossard.com', contact_phone: '+41-41-749-6611', lead_time_days: 10, reliability_score: 0.93, min_order_qty: 500, payment_terms: 'Net 30', certifications: 'ISO 9001', active: true, joined_date: '2019-07-01' },
    { name: 'Samsung Semiconductor', country: 'South Korea', city: 'Hwaseong', contact_email: 'memory@samsung.com', contact_phone: '+82-31-209-7114', lead_time_days: 28, reliability_score: 0.95, min_order_qty: 100, payment_terms: 'Net 45', certifications: 'ISO 9001, ISO 14001', active: true, joined_date: '2017-01-10' },
  ],

  manufacturers: [
    { name: 'Foxconn Zhengzhou Plant', location: 'Zhengzhou', country: 'China', capacity_per_day: 50000, specialization: 'High-volume electronics assembly, SMT', rating: 4.6, certifications: 'ISO 9001, IATF 16949, ISO 14001', min_run: 5000, turnaround_days: 21, contact: 'foxconn.zz@foxconn.com' },
    { name: 'Jabil Circuit Penang', location: 'Penang', country: 'Malaysia', capacity_per_day: 12000, specialization: 'PCBA, system integration, test', rating: 4.4, certifications: 'ISO 9001, ISO 13485', min_run: 500, turnaround_days: 18, contact: 'penang@jabil.com' },
    { name: 'Flex Guadalajara', location: 'Guadalajara', country: 'Mexico', capacity_per_day: 8000, specialization: 'Box build, cable assembly, EMS', rating: 4.3, certifications: 'ISO 9001, IPC-A-610', min_run: 250, turnaround_days: 15, contact: 'gdl@flex.com' },
    { name: 'Celestica Toronto', location: 'Toronto', country: 'Canada', capacity_per_day: 4000, specialization: 'Hyperscale server assembly, NPI', rating: 4.5, certifications: 'ISO 9001, AS9100', min_run: 100, turnaround_days: 14, contact: 'tor.ops@celestica.com' },
    { name: 'Sanmina Chennai', location: 'Chennai', country: 'India', capacity_per_day: 6000, specialization: 'Networking gear, optical modules', rating: 4.2, certifications: 'ISO 9001, TL 9000', min_run: 200, turnaround_days: 17, contact: 'chennai@sanmina.com' },
    { name: 'Quanta Computer', location: 'Taoyuan', country: 'Taiwan', capacity_per_day: 15000, specialization: 'Cloud server ODM, motherboard assembly', rating: 4.7, certifications: 'ISO 9001, ISO 14001, IATF 16949', min_run: 1000, turnaround_days: 20, contact: 'odm@quantatw.com' },
    { name: 'Inventec Shanghai', location: 'Shanghai', country: 'China', capacity_per_day: 10000, specialization: 'Server motherboards, AI accelerator boards', rating: 4.4, certifications: 'ISO 9001, ISO 14001', min_run: 500, turnaround_days: 19, contact: 'sh@inventec.com' },
  ],

  iterations: [
    { version: 'v0.1-alpha', changes: 'Initial PCB layout, 4-layer stackup defined', engineer: 'Aiko Tanaka', success: true, iteration_hours: 48.5, cad_file_url: 'https://cad.example.com/parts/rev-0.1.kicad', notes: 'Baseline routing complete, DRC clean' },
    { version: 'v0.2', changes: 'Reduced trace impedance variance on DDR5 lanes', engineer: 'Marcus Chen', success: true, iteration_hours: 22.0, cad_file_url: 'https://cad.example.com/parts/rev-0.2.kicad', notes: 'Signal integrity improved; eye diagram passes JEDEC' },
    { version: 'v0.3', changes: 'Added thermal vias under VRM, repositioned MOSFETs', engineer: 'Priya Sharma', success: false, iteration_hours: 35.5, cad_file_url: 'https://cad.example.com/parts/rev-0.3.kicad', notes: 'Hot-spot still 92C at full load; needs heatsink redesign' },
    { version: 'v0.4', changes: 'Heatsink fin density doubled, copper pour expanded', engineer: 'Priya Sharma', success: true, iteration_hours: 18.0, cad_file_url: 'https://cad.example.com/parts/rev-0.4.kicad', notes: 'Peak temp 78C at 100% TDP, within spec' },
    { version: 'v0.5-beta', changes: 'EMI shielding can added, ground stitching enhanced', engineer: 'Carlos Rivera', success: true, iteration_hours: 14.5, cad_file_url: 'https://cad.example.com/parts/rev-0.5.kicad', notes: 'CISPR 32 Class B passed in pre-compliance test' },
    { version: 'v1.0-rc1', changes: 'DFM review applied: panelization, fiducials, test points', engineer: 'Aiko Tanaka', success: true, iteration_hours: 9.0, cad_file_url: 'https://cad.example.com/parts/rev-1.0rc1.kicad', notes: 'Ready for pilot run at Foxconn Zhengzhou' },
    { version: 'v1.0', changes: 'Production release', engineer: 'Marcus Chen', success: true, iteration_hours: 4.5, cad_file_url: 'https://cad.example.com/parts/rev-1.0.kicad', notes: 'Released to manufacturing 2026-04-30' },
  ],

  quality: [
    { inspector: 'Yuki Nakamura', pass: true, defect_rate: 0.008, sample_size: 500, notes: 'AOI clean, X-ray on BGAs nominal', failure_modes: '', corrective_action: '' },
    { inspector: 'David Okafor', pass: false, defect_rate: 0.042, sample_size: 250, notes: 'Solder bridges on QFP-100 pin 47-48', failure_modes: 'solder_bridge,insufficient_solder', corrective_action: 'Reflow profile peak temp +5C, stencil aperture reduced 8%' },
    { inspector: 'Mei Lin Wang', pass: true, defect_rate: 0.015, sample_size: 1000, notes: 'In-circuit test 99.2% first-pass yield', failure_modes: '', corrective_action: '' },
    { inspector: 'Hans Mueller', pass: false, defect_rate: 0.063, sample_size: 200, notes: 'BGA voiding >25% on 6 of 200 units, X-ray confirmed', failure_modes: 'bga_voiding,head_in_pillow', corrective_action: 'Solder paste lot quarantined; switching to Indium 8.9HF' },
    { inspector: 'Anika Patel', pass: true, defect_rate: 0.005, sample_size: 750, notes: 'Functional test all green, burn-in 48h passed', failure_modes: '', corrective_action: '' },
    { inspector: 'Yuki Nakamura', pass: true, defect_rate: 0.011, sample_size: 600, notes: 'Visual inspection per IPC-A-610 Class 2', failure_modes: '', corrective_action: '' },
    { inspector: 'David Okafor', pass: true, defect_rate: 0.003, sample_size: 1200, notes: 'Outgoing QC sign-off, ready to ship', failure_modes: '', corrective_action: '' },
  ],

  orders: [
    { quantity: 5000, unit_price: 4.85, status: 'received', expected_by: '2026-04-15', tracking_number: 'FXCN-PCB-882341', notes: 'PCB substrate FR-4 panels, lot LX-2026-04A' },
    { quantity: 8, unit_price: 28999.00, status: 'in_transit', expected_by: '2026-06-12', tracking_number: 'NV-DHL-7728811', notes: 'NVIDIA H100 SXM5 - DGX integration build' },
    { quantity: 50000, unit_price: 0.04, status: 'received', expected_by: '2026-04-22', tracking_number: 'BOSS-CH-44912', notes: 'M3x8 stainless socket-head bulk order' },
    { quantity: 24, unit_price: 11805.00, status: 'pending', expected_by: '2026-06-30', tracking_number: '', notes: 'AMD EPYC 9654 - Q2 production allocation' },
    { quantity: 480, unit_price: 285.00, status: 'in_transit', expected_by: '2026-05-20', tracking_number: 'SAM-FEDEX-9981224', notes: 'Samsung DDR5-4800 RDIMM, ECC validation pending' },
    { quantity: 100, unit_price: 89.50, status: 'received', expected_by: '2026-04-10', tracking_number: 'QUAN-OCEAN-55812', notes: '2U aluminum chassis, anodized black' },
    { quantity: 5000, unit_price: 3.20, status: 'pending', expected_by: '2026-05-28', tracking_number: '', notes: 'M.2 NVMe heatsinks for SKU-77 build' },
  ],
};

async function pickPartIds(limit) {
  const r = await db.query('SELECT id FROM parts ORDER BY id DESC LIMIT $1', [limit]);
  return r.rows.map(x => x.id);
}
async function pickSupplierIds(limit) {
  const r = await db.query('SELECT id FROM suppliers ORDER BY id DESC LIMIT $1', [limit]);
  return r.rows.map(x => x.id);
}
async function pickOrderIds(limit) {
  const r = await db.query('SELECT id FROM orders ORDER BY id DESC LIMIT $1', [limit]);
  return r.rows.map(x => x.id);
}

router.post('/sample-data/:entity', verifyToken, async (req, res) => {
  const { entity } = req.params;
  try {
    let inserted = 0;

    if (entity === 'parts') {
      for (const p of SAMPLES.parts) {
        await db.query(
          'INSERT INTO parts (name,part_number,description,material,category,unit_cost,weight_grams,lead_time_days,status,in_stock,reorder_threshold) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',
          [p.name, p.part_number, p.description, p.material, p.category, p.unit_cost, p.weight_grams, p.lead_time_days, p.status, p.in_stock, p.reorder_threshold]
        );
        inserted++;
      }
    } else if (entity === 'suppliers') {
      for (const s of SAMPLES.suppliers) {
        await db.query(
          'INSERT INTO suppliers (name,country,city,contact_email,contact_phone,lead_time_days,reliability_score,min_order_qty,payment_terms,certifications,active,joined_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
          [s.name, s.country, s.city, s.contact_email, s.contact_phone, s.lead_time_days, s.reliability_score, s.min_order_qty, s.payment_terms, s.certifications, s.active, s.joined_date]
        );
        inserted++;
      }
    } else if (entity === 'manufacturers') {
      for (const m of SAMPLES.manufacturers) {
        await db.query(
          'INSERT INTO manufacturers (name,location,country,capacity_per_day,specialization,rating,certifications,min_run,turnaround_days,contact) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
          [m.name, m.location, m.country, m.capacity_per_day, m.specialization, m.rating, m.certifications, m.min_run, m.turnaround_days, m.contact]
        );
        inserted++;
      }
    } else if (entity === 'iterations') {
      const partIds = await pickPartIds(SAMPLES.iterations.length);
      if (partIds.length === 0) return res.status(400).json({ error: 'No parts exist; insert sample parts first' });
      for (let i = 0; i < SAMPLES.iterations.length; i++) {
        const it = SAMPLES.iterations[i];
        const partId = partIds[i % partIds.length];
        const started = new Date(Date.now() - (SAMPLES.iterations.length - i) * 7 * 86400000);
        const completed = new Date(started.getTime() + it.iteration_hours * 3600000);
        await db.query(
          'INSERT INTO iterations (part_id,version,changes,engineer,started_at,completed_at,success,iteration_hours,cad_file_url,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
          [partId, it.version, it.changes, it.engineer, started, completed, it.success, it.iteration_hours, it.cad_file_url, it.notes]
        );
        inserted++;
      }
    } else if (entity === 'quality') {
      const partIds = await pickPartIds(SAMPLES.quality.length);
      const orderIds = await pickOrderIds(SAMPLES.quality.length);
      if (partIds.length === 0) return res.status(400).json({ error: 'No parts exist; insert sample parts first' });
      for (let i = 0; i < SAMPLES.quality.length; i++) {
        const q = SAMPLES.quality[i];
        const partId = partIds[i % partIds.length];
        const orderId = orderIds.length ? orderIds[i % orderIds.length] : null;
        const checkDate = new Date(Date.now() - (SAMPLES.quality.length - i) * 3 * 86400000).toISOString().slice(0, 10);
        await db.query(
          'INSERT INTO quality_checks (part_id,order_id,inspector,pass,defect_rate,sample_size,notes,check_date,failure_modes,corrective_action) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
          [partId, orderId, q.inspector, q.pass, q.defect_rate, q.sample_size, q.notes, checkDate, q.failure_modes, q.corrective_action]
        );
        inserted++;
      }
    } else if (entity === 'orders') {
      const partIds = await pickPartIds(SAMPLES.orders.length);
      const supplierIds = await pickSupplierIds(SAMPLES.orders.length);
      if (partIds.length === 0 || supplierIds.length === 0) {
        return res.status(400).json({ error: 'Need parts and suppliers first; insert sample parts and suppliers' });
      }
      for (let i = 0; i < SAMPLES.orders.length; i++) {
        const o = SAMPLES.orders[i];
        const partId = partIds[i % partIds.length];
        const supplierId = supplierIds[i % supplierIds.length];
        const total = o.quantity * o.unit_price;
        await db.query(
          'INSERT INTO orders (part_id,supplier_id,quantity,unit_price,total_cost,status,expected_by,tracking_number,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [partId, supplierId, o.quantity, o.unit_price, total, o.status, o.expected_by, o.tracking_number, o.notes]
        );
        inserted++;
      }
    } else {
      return res.status(400).json({ error: `Unknown entity: ${entity}` });
    }

    res.json({ inserted, entity });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
