-- Seed data for HardwareOS

-- Users
INSERT INTO users (email, password, name) VALUES
('admin@demo.com', '$2b$10$e4dPQpe3XIDluCZCv3b3iu/H/3f816tgim6l5ly5k7pChHG235Dey', 'Admin User')
ON CONFLICT (email) DO NOTHING;

-- Parts
INSERT INTO parts (name, part_number, description, material, category, unit_cost, weight_grams, lead_time_days, status, in_stock, reorder_threshold) VALUES
('Titanium Hex Bolt M8', 'HW-2024-001', 'Grade 5 titanium hex bolt M8x25mm', 'Titanium Grade 5', 'fastener', 2.50, 8.2, 14, 'active', 500, 50),
('Aluminum Bearing Housing', 'HW-2024-002', 'Precision CNC machined bearing housing for 6204 series bearings', 'Aluminum 6061-T6', 'mechanical', 45.00, 285.0, 21, 'active', 80, 10),
('Brushless DC Motor 48V', 'HW-2024-003', '48V 500W BLDC motor with Hall sensors', 'Neodymium/Steel', 'electronic', 189.00, 1240.0, 35, 'active', 25, 5),
('Pneumatic Cylinder 63mm', 'HW-2024-004', 'Double-acting pneumatic cylinder 63mm bore 200mm stroke', 'Stainless Steel', 'pneumatic', 78.50, 920.0, 28, 'active', 40, 8),
('Carbon Fiber Tube 30mm OD', 'HW-2024-005', 'Pultruded carbon fiber tube 30mm OD 1m length', 'Carbon Fiber T700', 'structural', 95.00, 340.0, 42, 'active', 60, 10),
('Optical Encoder 1000PPR', 'HW-2024-006', 'Incremental optical encoder 1000 pulses per revolution', 'Aluminum/Glass', 'optical', 67.00, 125.0, 21, 'active', 30, 5),
('Steel Worm Gear Set', 'HW-2024-007', '20:1 ratio steel worm gear set module 2', 'Carbon Steel', 'mechanical', 34.00, 520.0, 18, 'active', 45, 10),
('MOSFET Driver IC', 'HW-2024-008', 'High-speed gate driver IC for half-bridge configuration', 'Silicon', 'electronic', 3.20, 1.5, 7, 'active', 200, 30),
('Silicone O-Ring Kit', 'HW-2024-009', 'Assorted silicone O-rings for pneumatic sealing', 'Silicone 70A', 'pneumatic', 12.50, 45.0, 10, 'active', 150, 25),
('Structural Steel Channel 50x25', 'HW-2024-010', 'Hot-rolled steel channel 50x25x3mm per meter', 'Mild Steel S275', 'structural', 18.00, 2100.0, 14, 'active', 100, 20),
('Fiber Optic Sensor 0.1mm', 'HW-2024-011', 'High-precision fiber optic displacement sensor', 'Sapphire/Fiber', 'optical', 245.00, 85.0, 56, 'prototype', 10, 2),
('Stainless Steel M5 Socket Cap', 'HW-2024-012', 'A4 stainless steel M5x16mm socket cap screw', 'Stainless 316', 'fastener', 0.45, 2.8, 10, 'active', 1000, 100),
('Servo Motor Planetary Gearbox', 'HW-2024-013', '5:1 planetary gearbox for NEMA23 servo motors', 'Alloy Steel', 'mechanical', 125.00, 650.0, 30, 'on_order', 15, 5),
('Hall Effect Sensor Array', 'HW-2024-014', '12-element Hall effect sensor array PCB assembly', 'Silicon/FR4', 'electronic', 28.00, 35.0, 21, 'active', 60, 10),
('Hydraulic Manifold Block', 'HW-2024-015', 'Machined aluminum hydraulic manifold 4-station', 'Aluminum 7075', 'pneumatic', 185.00, 1850.0, 45, 'active', 12, 3)
ON CONFLICT DO NOTHING;

-- Suppliers
INSERT INTO suppliers (name, country, city, contact_email, contact_phone, lead_time_days, reliability_score, min_order_qty, payment_terms, certifications, active, joined_date) VALUES
('TechMetal Solutions Inc', 'USA', 'Detroit', 'orders@techmetal.com', '+1-313-555-0142', 14, 9.2, 100, 'Net 30', 'ISO 9001, AS9100', TRUE, '2019-03-15'),
('Shenzhen FastParts Co', 'China', 'Shenzhen', 'sales@fastparts.cn', '+86-755-8821-4433', 21, 8.7, 500, 'T/T 30%', 'ISO 9001, RoHS', TRUE, '2020-07-22'),
('Müller Precision GmbH', 'Germany', 'Stuttgart', 'einkauf@muller-precision.de', '+49-711-345-6789', 28, 9.6, 50, 'Net 60', 'ISO 9001, IATF 16949', TRUE, '2018-11-08'),
('Nippon Components Ltd', 'Japan', 'Osaka', 'procurement@nippon-comp.jp', '+81-6-6201-8800', 35, 9.8, 200, 'Net 45', 'ISO 9001, JIS', TRUE, '2017-05-30'),
('Korea Advanced Materials', 'South Korea', 'Incheon', 'sales@korea-am.kr', '+82-32-747-5500', 21, 9.1, 300, 'T/T 50%', 'ISO 9001, KS', TRUE, '2021-02-14'),
('Pacific Rim Electronics', 'China', 'Guangzhou', 'export@pacific-rim.cn', '+86-20-8765-4321', 18, 8.4, 1000, 'L/C 30 days', 'ISO 9001, CE', TRUE, '2019-08-17'),
('Precision Dynamics USA', 'USA', 'Chicago', 'sales@precisiondyn.com', '+1-312-555-0891', 21, 9.0, 25, 'Net 30', 'ISO 9001, NADCAP', TRUE, '2020-01-10'),
('EuroCast Berlin', 'Germany', 'Berlin', 'vertrieb@eurocast.de', '+49-30-9876-5432', 35, 9.3, 100, 'Net 45', 'ISO 9001, ISO 14001', TRUE, '2019-06-20'),
('Daewoo Industrial Supply', 'South Korea', 'Busan', 'b2b@daewoo-supply.kr', '+82-51-600-1234', 28, 8.9, 200, 'T/T 40%', 'ISO 9001', TRUE, '2020-09-05'),
('Texas Fastener Corp', 'USA', 'Houston', 'orders@texasfastener.com', '+1-713-555-0234', 10, 9.5, 1000, 'Net 30', 'ISO 9001, ASME', TRUE, '2018-04-12'),
('Beijing Aerospace Parts', 'China', 'Beijing', 'sales@bap-cn.com', '+86-10-6234-5678', 42, 8.2, 100, 'T/T 50%', 'AS9100, ISO 9001', TRUE, '2021-11-03'),
('Kyoto Sensors Japan', 'Japan', 'Kyoto', 'export@kyoto-sensors.jp', '+81-75-323-1100', 28, 9.7, 50, 'Net 60', 'ISO 9001, IEC', TRUE, '2019-12-18'),
('SteelWorks Munich', 'Germany', 'Munich', 'info@steelworks-muc.de', '+49-89-2345-6789', 21, 9.4, 200, 'Net 30', 'ISO 9001, DIN', TRUE, '2020-03-07'),
('Seoul Precision Electronics', 'South Korea', 'Seoul', 'sales@spe-korea.com', '+82-2-3456-7890', 24, 9.0, 500, 'T/T 30%', 'ISO 9001, UL', TRUE, '2021-07-29'),
('Midwest Machining LLC', 'USA', 'Cleveland', 'rfq@midwestmachine.com', '+1-216-555-0567', 18, 8.8, 10, 'Net 30', 'ISO 9001, AS9100', TRUE, '2019-09-14')
ON CONFLICT DO NOTHING;

-- Orders
INSERT INTO orders (part_id, supplier_id, quantity, unit_price, total_cost, status, ordered_at, expected_by, tracking_number, notes) VALUES
(1, 10, 2000, 2.30, 4600.00, 'received', '2024-10-01 09:00:00', '2024-10-15', 'TFC-2024-10-0012', 'Bulk order Q4'),
(2, 1, 100, 42.00, 4200.00, 'in_production', '2024-11-15 14:30:00', '2024-12-20', 'TMS-24111502', NULL),
(3, 4, 50, 180.00, 9000.00, 'shipped', '2024-11-20 10:00:00', '2024-12-30', 'NCL-JPN-20241128', 'Motor batch for Q1 production'),
(4, 3, 80, 72.00, 5760.00, 'confirmed', '2024-11-25 08:00:00', '2025-01-05', NULL, 'Pneumatic cylinders for assembly line'),
(5, 3, 200, 88.00, 17600.00, 'pending', '2024-12-01 11:00:00', '2025-02-01', NULL, 'Carbon fiber structural tubes'),
(6, 12, 75, 62.00, 4650.00, 'shipped', '2024-11-10 13:00:00', '2024-12-20', 'KSJ-20241118', NULL),
(7, 13, 60, 30.00, 1800.00, 'received', '2024-09-15 09:00:00', '2024-10-10', 'SWM-2024-0987', 'Gear sets for actuator assembly'),
(8, 6, 5000, 2.80, 14000.00, 'in_production', '2024-11-01 15:00:00', '2024-12-15', 'PRE-GZ-2024-1045', NULL),
(9, 2, 300, 11.00, 3300.00, 'received', '2024-10-20 09:00:00', '2024-11-15', 'SFP-2024-3301', 'Standard O-ring replenishment'),
(10, 7, 500, 16.50, 8250.00, 'confirmed', '2024-11-28 10:00:00', '2025-01-10', NULL, NULL),
(11, 12, 25, 230.00, 5750.00, 'pending', '2024-12-02 14:00:00', '2025-03-15', NULL, 'Prototype evaluation batch'),
(12, 10, 10000, 0.40, 4000.00, 'received', '2024-09-01 09:00:00', '2024-09-15', 'TFC-2024-09-0045', 'Standard inventory restock'),
(13, 7, 30, 115.00, 3450.00, 'shipped', '2024-11-05 11:00:00', '2024-12-10', 'SWM-2024-1102', NULL),
(14, 14, 120, 25.00, 3000.00, 'in_production', '2024-11-22 09:00:00', '2025-01-05', NULL, 'New product line sensors'),
(15, 1, 20, 170.00, 3400.00, 'pending', '2024-12-01 16:00:00', '2025-02-28', NULL, 'Hydraulic manifolds for custom project')
ON CONFLICT DO NOTHING;

-- Design Iterations
INSERT INTO iterations (part_id, version, changes, engineer, started_at, completed_at, success, iteration_hours, cad_file_url, notes) VALUES
(2, 'v1.0', 'Initial design - standard bearing housing', 'John Smith', '2024-01-10 08:00:00', '2024-01-17 16:00:00', TRUE, 56.0, 'https://cad.example.com/bearing-v1.step', 'First functional design'),
(2, 'v1.1', 'Added chamfer on bearing bore, improved surface finish spec', 'John Smith', '2024-02-01 08:00:00', '2024-02-03 16:00:00', TRUE, 16.0, 'https://cad.example.com/bearing-v1-1.step', 'Minor improvement based on assembly feedback'),
(2, 'v2.0', 'Redesign for lighter weight - added pockets, changed to 6061-T6', 'Sarah Chen', '2024-03-15 09:00:00', '2024-03-29 17:00:00', TRUE, 112.0, 'https://cad.example.com/bearing-v2.step', 'Weight reduction 15%'),
(3, 'v1.0', 'Initial motor spec - 36V 300W', 'Mike Torres', '2024-02-01 09:00:00', '2024-02-22 17:00:00', FALSE, 168.0, 'https://cad.example.com/motor-v1.step', 'Failed thermal test at rated load'),
(3, 'v2.0', 'Upgraded to 48V 500W, improved thermal management', 'Mike Torres', '2024-03-01 09:00:00', '2024-04-12 17:00:00', TRUE, 240.0, 'https://cad.example.com/motor-v2.step', 'US engineering took 10 weeks vs Shenzhen 3 week quote'),
(5, 'v1.0', 'Initial carbon fiber tube spec - 28mm OD, T300', 'Lisa Park', '2024-04-01 09:00:00', '2024-04-08 17:00:00', TRUE, 56.0, 'https://cad.example.com/cftube-v1.step', 'Simple design, quick iteration'),
(7, 'v1.0', 'Worm gear set initial design - 15:1 ratio', 'David Lee', '2024-03-10 09:00:00', '2024-04-10 17:00:00', FALSE, 240.0, 'https://cad.example.com/worm-v1.step', 'Ratio too low for application, overheating'),
(7, 'v2.0', 'Changed to 20:1 ratio, improved tooth profile', 'David Lee', '2024-04-15 09:00:00', '2024-05-10 17:00:00', TRUE, 200.0, 'https://cad.example.com/worm-v2.step', 'Full month of engineering time in Detroit'),
(7, 'v2.1', 'Surface hardening spec update', 'David Lee', '2024-05-12 09:00:00', '2024-05-13 17:00:00', TRUE, 8.0, 'https://cad.example.com/worm-v2-1.step', NULL),
(11, 'v0.1', 'Concept design for sapphire fiber optic sensor', 'Anna Zhang', '2024-06-01 09:00:00', NULL, FALSE, 72.0, NULL, 'Prototype in progress - challenging optics alignment'),
(13, 'v1.0', 'Planetary gearbox initial design - 3:1 ratio', 'John Smith', '2024-05-01 09:00:00', '2024-05-22 17:00:00', TRUE, 168.0, 'https://cad.example.com/planet-v1.step', NULL),
(13, 'v2.0', 'Redesigned for 5:1 ratio with improved backlash', 'John Smith', '2024-06-01 09:00:00', '2024-07-05 17:00:00', TRUE, 240.0, 'https://cad.example.com/planet-v2.step', 'Shenzhen would have done this in 2 weeks'),
(1, 'v1.0', 'Initial fastener spec review', 'Sarah Chen', '2024-01-05 09:00:00', '2024-01-06 12:00:00', TRUE, 3.0, NULL, 'Standard part, minimal iteration'),
(15, 'v1.0', 'Hydraulic manifold initial design', 'Mike Torres', '2024-07-01 09:00:00', '2024-09-15 17:00:00', TRUE, 400.0, 'https://cad.example.com/manifold-v1.step', '12-week lead time for custom manifold in US'),
(15, 'v1.1', 'Port location adjustment for improved flow', 'Mike Torres', '2024-09-20 09:00:00', '2024-09-25 17:00:00', TRUE, 40.0, 'https://cad.example.com/manifold-v1-1.step', NULL)
ON CONFLICT DO NOTHING;

-- Quality Checks
INSERT INTO quality_checks (part_id, order_id, inspector, pass, defect_rate, sample_size, notes, check_date, failure_modes, corrective_action) VALUES
(1, 1, 'Robert Kim', TRUE, 0.2, 100, 'Batch meets spec, minor surface marks on 2 parts', '2024-10-16', NULL, NULL),
(7, 7, 'Emma Wilson', TRUE, 0.0, 30, 'All gear sets pass dimensional and hardness checks', '2024-10-11', NULL, NULL),
(9, 9, 'Robert Kim', TRUE, 0.5, 50, 'Two O-rings slightly undersized, within tolerance', '2024-11-16', 'Minor dimension deviation', NULL),
(12, 12, 'Lisa Tanaka', TRUE, 0.0, 200, 'Perfect batch, all screws within spec', '2024-09-16', NULL, NULL),
(2, 2, 'Emma Wilson', FALSE, 3.5, 20, 'Surface roughness out of spec on 7 parts, needs rework', '2024-12-22', 'Surface finish Ra>1.6um on 35% of parts', 'Return to supplier for reprocessing'),
(3, 3, 'Robert Kim', TRUE, 0.0, 10, 'Motor performance verified, Hall sensors functional', '2024-12-31', NULL, NULL),
(6, 6, 'Lisa Tanaka', TRUE, 1.3, 15, 'One encoder with poor signal, replaced', '2024-12-21', 'Signal noise on 1 unit', 'Replace unit, acceptable batch overall'),
(8, 8, 'Emma Wilson', TRUE, 0.1, 200, 'ICs tested on evaluation board, all functional', '2024-12-16', NULL, NULL),
(13, 13, 'Robert Kim', FALSE, 6.7, 10, 'Two gearboxes with excessive backlash, out of spec', '2024-12-11', 'Backlash >5 arcmin on 20% sample', 'Return defective units, request full inspection'),
(5, 5, 'Lisa Tanaka', TRUE, 0.0, 20, 'Tube dimensions and surface quality excellent', '2025-02-02', NULL, NULL),
(4, 4, 'Emma Wilson', TRUE, 0.0, 15, 'Cylinder bore and stroke within 0.01mm', '2025-01-06', NULL, NULL),
(10, 10, 'Robert Kim', TRUE, 0.8, 50, 'Minor weld inclusions on 4 channels, acceptable', '2025-01-11', 'Minor weld inclusions', NULL),
(11, NULL, 'Anna Zhang', FALSE, 100.0, 5, 'Prototype optical alignment unstable, all fail', '2024-12-15', 'Fiber-to-lens gap inconsistency', 'Redesign fiber mounting jig'),
(14, 14, 'Lisa Tanaka', TRUE, 0.0, 24, 'All sensor arrays within electrical spec', '2025-01-06', NULL, NULL),
(15, NULL, 'Emma Wilson', TRUE, 0.0, 5, 'Hydraulic flow test passed at 200 bar', '2024-11-01', NULL, NULL)
ON CONFLICT DO NOTHING;

-- Manufacturers
INSERT INTO manufacturers (name, location, country, capacity_per_day, specialization, rating, certifications, min_run, turnaround_days, contact) VALUES
('Shenzhen Rapid Manufacturing', 'Shenzhen, Guangdong', 'China', 5000, 'CNC machining, sheet metal, rapid prototyping', 4.7, 'ISO 9001, ISO 14001', 10, 7, 'mfg@szrapid.cn'),
('Detroit Precision Works', 'Detroit, MI', 'USA', 800, 'Precision machining, aerospace components', 4.9, 'AS9100, NADCAP, ISO 9001', 5, 28, 'rfq@detroitprecision.com'),
('Yamaha Industrial Manufacturing', 'Hamamatsu, Shizuoka', 'Japan', 2000, 'Precision electronics, motor assemblies', 4.9, 'ISO 9001, ISO 14001, JIS', 100, 42, 'b2b@yamaha-ind.jp'),
('Bayern Fertigungstechnik', 'Ingolstadt, Bavaria', 'Germany', 1200, 'Automotive precision parts, gears, shafts', 4.8, 'IATF 16949, ISO 9001', 50, 35, 'kontakt@bayern-ft.de'),
('Hyundai Mobis Advanced', 'Ulsan, South Gyeongsang', 'South Korea', 3000, 'Automotive and industrial components', 4.7, 'IATF 16949, ISO 9001, KS', 200, 28, 'supplier@hyundai-mobis.com'),
('PCBWay Electronics', 'Shenzhen, Guangdong', 'China', 10000, 'PCB fabrication, PCBA, electronic assemblies', 4.6, 'ISO 9001, RoHS, UL', 5, 3, 'service@pcbway.com'),
('Texas CNC Solutions', 'San Antonio, TX', 'USA', 600, 'Custom CNC parts, titanium and aluminum', 4.8, 'AS9100, ISO 9001', 1, 21, 'quotes@texascnc.com'),
('Stuttgart Werkzeugmaschinen', 'Stuttgart, Baden-Württemberg', 'Germany', 900, 'Tool and die, precision grinding', 4.9, 'ISO 9001, DIN', 10, 35, 'info@stw-mfg.de'),
('Foxconn Industrial Components', 'Zhengzhou, Henan', 'China', 50000, 'Electronics manufacturing, cable assemblies', 4.5, 'ISO 9001, ISO 14001, RoHS', 1000, 14, 'industrial@foxconn.com'),
('Cleveland Specialty Metals', 'Cleveland, OH', 'USA', 400, 'Exotic metals, titanium, Inconel machining', 4.9, 'AS9100, NADCAP', 1, 21, 'metals@clevelandsm.com'),
('Osaka Bearing Industries', 'Osaka', 'Japan', 1500, 'Bearings, precision rotary components', 5.0, 'ISO 9001, ISO 14001', 50, 28, 'export@oki-bearings.jp'),
('Gdansk Composites', 'Gdansk', 'Poland', 300, 'Carbon fiber, composite structures', 4.7, 'ISO 9001, NADCAP', 5, 28, 'composites@gdansk-comp.pl'),
('Singapore Advanced Manufacturing', 'Singapore', 'Singapore', 700, 'Semiconductor equipment parts, micro-machining', 4.8, 'ISO 9001, ISO 14001', 5, 21, 'sam@singaporeadvmfg.sg'),
('Mexico City FastForge', 'Mexico City', 'Mexico', 2000, 'Die casting, forgings, nearshore delivery', 4.5, 'IATF 16949, ISO 9001', 200, 14, 'ventas@fastforge.mx'),
('Toronto Fluid Systems', 'Toronto, Ontario', 'Canada', 250, 'Hydraulic components, manifolds, valves', 4.8, 'ISO 9001, CSA', 1, 42, 'rfq@torontofluid.ca')
ON CONFLICT DO NOTHING;
