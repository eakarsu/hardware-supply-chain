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

-- =========================================================================
-- Deep features seed data (audit 2026-05-14)
-- =========================================================================

-- Components: real MPNs from TI, ST, Murata, TDK, Vishay, Nordic, Espressif, Bosch
INSERT INTO components (mpn, manufacturer, description, package, category, lifecycle, last_buy_date, pin_count, pitch_mm, operating_temp_min, operating_temp_max, unit_price_break_qty, unit_price, notes) VALUES
('LM358DR',          'Texas Instruments',   'Dual op-amp, low-power, general purpose',          'SOIC-8',     'analog-ic',   'Active', NULL, 8,   1.27, -40, 85,  1000, 0.18, 'Industry-standard op-amp'),
('STM32F407VGT6',    'STMicroelectronics',  '32-bit Arm Cortex-M4 MCU, 1MB Flash, 192KB RAM',   'LQFP-100',   'mcu',         'Active', NULL, 100, 0.50, -40, 85,  1000, 9.40, 'Workhorse F4 series'),
('ESP32-WROOM-32E',  'Espressif Systems',   'Wi-Fi + BT module, 4MB flash, dual-core 240MHz',   'SMD-Module', 'wireless',    'Active', NULL, 38,  1.27, -40, 85,  1000, 3.20, 'Replaces -32D (NRND)'),
('NRF52840-QIAA-R',  'Nordic Semiconductor','Cortex-M4F BT5/Thread/Zigbee SoC, 1MB/256KB',      'aQFN-73',    'wireless',    'Active', NULL, 73,  0.50, -40, 85,  1000, 6.55, 'Widely used in Matter products'),
('GRM188R71H104KA93D','Murata',             '0.1uF 50V X7R 0603 MLCC',                          '0603',       'capacitor',   'Active', NULL, 2,   NULL, -55, 125, 4000, 0.013,'Workhorse decoupling cap'),
('C3216X7R1H106K160AC','TDK',               '10uF 50V X7R 1206 MLCC',                           '1206',       'capacitor',   'Active', NULL, 2,   NULL, -55, 125, 2000, 0.42, 'Bulk decoupling'),
('CRCW06031K00FKEA', 'Vishay Dale',         '1k ohm 0603 1% thin-film resistor',                '0603',       'resistor',    'Active', NULL, 2,   NULL, -55, 155, 5000, 0.008,'High-volume 1% resistor'),
('SI4435BDY-T1-GE3', 'Vishay Siliconix',    'P-channel 30V 8A MOSFET, SOIC-8',                  'SOIC-8',     'mosfet',      'Active', NULL, 8,   1.27, -55, 150, 2500, 0.74, 'Power-path switch'),
('TPS62160DGKT',     'Texas Instruments',   '3-17V 1A buck converter, 3MHz',                    'VSSOP-8',    'pmic',        'Active', NULL, 8,   0.65, -40, 125, 1000, 1.85, 'Compact step-down'),
('LSM6DSOXTR',       'STMicroelectronics',  '6-axis IMU, FSM/MLC, 0.55mA',                      'LGA-14',     'sensor',      'Active', NULL, 14,  0.65, -40, 85,  1000, 4.12, 'Common in wearables'),
('BME280',           'Bosch Sensortec',     'Temp/Humidity/Pressure sensor',                    'LGA-8',      'sensor',      'Active', NULL, 8,   0.65, -40, 85,  1000, 3.95, 'Used in environmental sensing'),
('FT232RL-REEL',     'FTDI',                'USB-UART bridge, full-speed',                      'SSOP-28',    'interface',   'NRND',   '2027-12-31', 28, 0.65, -40, 85,  1000, 4.20, 'Replace with CH340 or CP2102N'),
('CP2102N-A02-GQFN24R','Silicon Labs',      'USB-UART bridge, USB 2.0',                         'QFN-24',     'interface',   'Active', NULL, 24,  0.50, -40, 85,  1000, 2.35, 'FT232RL drop-in candidate'),
('ATMEGA328P-AU',    'Microchip',           '8-bit AVR MCU, 32KB flash, Arduino-class',         'TQFP-32',    'mcu',         'Active', NULL, 32,  0.80, -40, 85,  1000, 2.10, 'Arduino UNO core'),
('NCP1117ST33T3G',   'onsemi',              '3.3V 1A LDO regulator',                            'SOT-223',    'pmic',        'Active', NULL, 3,   2.30, -40, 125, 1000, 0.46, 'Generic 3.3V supply'),
('ADXL345BCCZ-RL',   'Analog Devices',      '3-axis 13-bit accel, +-16g',                       'LGA-14',     'sensor',      'Active', NULL, 14,  0.65, -40, 85,  1000, 5.85, 'Legacy but still recommended'),
('XC7Z020-1CLG400C', 'AMD/Xilinx',          'Zynq-7000 SoC FPGA, dual-A9 + 7-series PL',        'CSG400 BGA', 'fpga',        'Active', NULL, 400, 0.80, 0,   85,  100,  85.0, 'Pitch 0.8mm, BGA'),
('RC0402FR-0710KL',  'Yageo',               '10k ohm 0402 1% thick-film resistor',              '0402',       'resistor',    'Active', NULL, 2,   NULL, -55, 155, 10000, 0.003,'Smallest mainstream R'),
('GMK316ABJ226ML-T', 'Taiyo Yuden',         '22uF 6.3V X5R 1206 MLCC',                          '1206',       'capacitor',   'EOL',    '2025-06-30', 2, NULL, -55, 85, 2000, 0.55, 'Replaced by GRM31...'),
('PIC18F46K22-I/PT', 'Microchip',           '8-bit PIC18, 64KB flash, 3896B RAM',               'TQFP-44',    'mcu',         'Active', NULL, 44,  0.80, -40, 85,  1000, 3.65, 'Used in legacy projects'),
('LIS3DH',           'STMicroelectronics',  '3-axis 16-bit accel, +-16g, MEMS',                 'LGA-16',     'sensor',      'NRND',   '2028-12-31', 16, 0.50, -40, 85, 1000, 2.20, 'Successor LIS2DH12'),
('MAX31855KASA+',    'Analog Devices/Maxim','Thermocouple-to-digital converter, K-type',        'SOIC-8',     'analog-ic',   'Active', NULL, 8,   1.27, -40, 125, 1000, 6.80, 'Common K-type interface')
ON CONFLICT (mpn, manufacturer) DO NOTHING;

-- Distributor offerings (Digi-Key, Mouser, Arrow, Avnet, LCSC, Newark) with real-style SKUs
INSERT INTO distributor_offerings (component_id, distributor, distributor_sku, stock, factory_stock, moq, spq, price_break_1, cost_break_1, price_break_100, cost_break_100, price_break_1000, cost_break_1000, lead_time_days, url) VALUES
(1,  'Digi-Key', '296-1013-1-ND',          12480, 50000, 1,    1,    1,  0.42, 100, 0.28,  1000, 0.18,  14, 'https://www.digikey.com/short/lm358dr'),
(1,  'Mouser',   '595-LM358DR',             8200, 32000, 1,    1,    1,  0.43, 100, 0.30,  1000, 0.19,  14, 'https://www.mouser.com/c/?q=LM358DR'),
(2,  'Digi-Key', '497-11767-ND',            1230,  4500, 1,    1,    1, 12.30, 100,10.50,  1000, 9.40,  35, 'https://www.digikey.com/short/stm32f407vgt6'),
(2,  'Arrow',    'STM32F407VGT6',            980,  5200, 1,    1,    1, 12.10, 100,10.20,  1000, 9.30,  28, 'https://www.arrow.com/p/stm32f407vgt6'),
(3,  'Digi-Key', '1965-ESP32-WROOM-32E-ND',24500, 80000, 1,    1,    1,  4.50, 100, 3.80,  1000, 3.20,  21, 'https://www.digikey.com/short/esp32-wroom'),
(3,  'LCSC',     'C701341',                33000,100000, 1,    1,    1,  3.10, 100, 2.65,  1000, 2.20,  14, 'https://www.lcsc.com/product-detail/C701341.html'),
(4,  'Digi-Key', '1490-1014-1-ND',          5400, 18000, 1,    1,    1,  8.20, 100, 7.10,  1000, 6.55,  28, 'https://www.digikey.com/short/nrf52840'),
(4,  'Mouser',   '949-NRF52840-QIAA-R',     3100, 12500, 1,    1,    1,  8.40, 100, 7.20,  1000, 6.60,  35, 'https://www.mouser.com/c/?q=nrf52840'),
(5,  'Digi-Key', '490-1532-1-ND',         210000,1000000,1, 4000,   1,  0.020,100, 0.015, 4000, 0.013, 14, 'https://www.digikey.com/short/grm188'),
(5,  'LCSC',     'C14663',                480000,2000000,1, 1000,   1,  0.015,100, 0.012, 4000, 0.010, 7,  'https://www.lcsc.com/product-detail/C14663.html'),
(6,  'Digi-Key', '445-1423-1-ND',          82000, 250000, 1, 2000,   1,  0.65, 100, 0.50,  2000, 0.42,  21, 'https://www.digikey.com/short/c3216'),
(7,  'Digi-Key', '541-1.00KHCT-ND',       350000,1500000, 1, 5000,   1,  0.020,100, 0.012, 5000, 0.008, 14, 'https://www.digikey.com/short/crcw0603'),
(8,  'Digi-Key', 'SI4435BDY-T1-GE3CT-ND',   8200, 30000, 1,    1,    1,  1.20, 100, 0.90,  2500, 0.74,  21, 'https://www.digikey.com/short/si4435'),
(9,  'Digi-Key', '296-37290-1-ND',         15600, 60000, 1,    1,    1,  2.85, 100, 2.10,  1000, 1.85,  21, 'https://www.digikey.com/short/tps62160'),
(10, 'Mouser',   '511-LSM6DSOXTR',          9800, 40000, 1,    1,    1,  5.40, 100, 4.60,  1000, 4.12,  28, 'https://www.mouser.com/c/?q=lsm6dsox'),
(11, 'Digi-Key', '828-1063-1-ND',           7200, 30000, 1,    1,    1,  5.10, 100, 4.40,  1000, 3.95,  28, 'https://www.digikey.com/short/bme280'),
(12, 'Digi-Key', '768-1007-1-ND',           2400, 12000, 1,    1,    1,  5.40, 100, 4.60,  1000, 4.20,  35, 'https://www.digikey.com/short/ft232rl'),
(13, 'Mouser',   '634-CP2102NA02GQFN24',    8400, 30000, 1,    1,    1,  3.10, 100, 2.65,  1000, 2.35,  21, 'https://www.mouser.com/c/?q=cp2102n'),
(14, 'Digi-Key', 'ATMEGA328P-AURCT-ND',    18200, 80000, 1,    1,    1,  2.75, 100, 2.35,  1000, 2.10,  21, 'https://www.digikey.com/short/atmega328p'),
(15, 'Digi-Key', 'NCP1117ST33T3GOSCT-ND',  92000, 300000, 1,    1,    1,  0.80, 100, 0.58,  1000, 0.46,  14, 'https://www.digikey.com/short/ncp1117'),
(17, 'Avnet',    'XC7Z020-1CLG400C',          120,   400, 1,    1,    1, 95.00, 100,89.50,  100, 85.00, 56, 'https://www.avnet.com/shop/us/p/xc7z020'),
(18, 'LCSC',     'C25744',                850000,3000000, 1,10000,   1,  0.006,100, 0.005,10000, 0.003, 7, 'https://www.lcsc.com/product-detail/C25744.html'),
(20, 'Mouser',   '579-PIC18F46K22-I/PT',    4200, 18000, 1,    1,    1,  4.80, 100, 4.00,  1000, 3.65,  28, 'https://www.mouser.com/c/?q=pic18f46k22')
ON CONFLICT (distributor, distributor_sku) DO NOTHING;

-- BOM headers (3 real-style products)
INSERT INTO bom_headers (product_name, revision, status, target_qty, owner, notes) VALUES
('IoT Sensor Node',          'A1', 'released', 5000, 'Sarah Chen',  'Wi-Fi + IMU + env sensor; ESP32 platform'),
('Industrial Motor Driver',  'B2', 'draft',     200, 'Mike Torres', '48V BLDC; STM32F4 control'),
('USB Debug Adapter',        'C0', 'released',1000, 'David Lee',   'USB-UART + GPIO; replaces FT232RL with CP2102N')
ON CONFLICT (product_name, revision) DO NOTHING;

-- BOM lines
INSERT INTO bom_lines (bom_id, ref_designator, component_id, qty_per_assembly, preferred_distributor, alt_mpn_1, alt_mpn_2, notes) VALUES
(1, 'U1',                3, 1,  'Digi-Key', NULL,                  NULL,                  'Main MCU/radio'),
(1, 'U2',                10,1,  'Mouser',   'LSM6DSO',             NULL,                  'IMU'),
(1, 'U3',                11,1,  'Digi-Key', NULL,                  NULL,                  'Environmental sensor'),
(1, 'U4',                9, 1,  'Digi-Key', 'TPS62080',            NULL,                  '3.3V rail'),
(1, 'C1,C2,C3,C4,C5,C6', 5, 6,  'LCSC',     'CL10B104KO8NNNC',     NULL,                  '0.1uF decoupling'),
(1, 'C7,C8',             6, 2,  'Digi-Key', NULL,                  NULL,                  '10uF bulk'),
(1, 'R1,R2,R3,R4',       7, 4,  'Digi-Key', 'RC0603FR-071KL',      NULL,                  '1k pull-ups'),
(2, 'U1',                2, 1,  'Arrow',    'STM32F405VGT6',       NULL,                  'Main MCU'),
(2, 'U2,U3',             8, 2,  'Digi-Key', NULL,                  NULL,                  'P-ch high-side switch'),
(2, 'U4',                9, 1,  'Digi-Key', NULL,                  NULL,                  '3.3V from 5V'),
(2, 'C1..C20',           5, 20, 'LCSC',     NULL,                  NULL,                  '0.1uF bulk'),
(2, 'R1..R30',           7, 30, 'Digi-Key', NULL,                  NULL,                  '1k references'),
(3, 'U1',                13,1,  'Mouser',   'CH340G',              'FT231XS',             'USB-UART (post-ECN)'),
(3, 'U2',                15,1,  'Digi-Key', NULL,                  NULL,                  '3.3V LDO'),
(3, 'C1..C4',            5, 4,  'LCSC',     NULL,                  NULL,                  '0.1uF decoupling'),
(3, 'R1,R2',             18,2,  'LCSC',     NULL,                  NULL,                  '10k pull-ups')
ON CONFLICT DO NOTHING;

-- CM lead-times (Foxconn, Pegatron, Jabil, Flex, Wistron, Sanmina)
INSERT INTO cm_lead_times (cm_name, cm_site, process, quoted_days, actual_days, pcs, yield_pct, observed_on, notes) VALUES
('Foxconn',  'Shenzhen Longhua',     'SMT',  14, 12,  5000, 99.2, '2026-04-18', 'Standard line, 0402+ caps'),
('Foxconn',  'Zhengzhou',            'FATP', 21, 28, 25000, 98.7, '2026-04-22', 'Final assembly, missed 1 week on enclosure'),
('Pegatron', 'Suzhou',               'SMT',  18, 17,  3200, 99.0, '2026-04-25', 'Mid-vol BLDC controller'),
('Pegatron', 'Chongqing',            'AOI',   2,  2,  3200, 99.6, '2026-04-26', 'Inline AOI added'),
('Jabil',    'Penang',               'SMT',  21, 24,  1500, 98.4, '2026-04-10', 'Component shortage delayed 3d'),
('Jabil',    'Guadalajara',          'FATP', 28, 31,  1500, 97.9, '2026-04-15', 'USMCA destination preference'),
('Flex',     'Guadalajara',          'SMT',  18, 18,  4000, 99.1, '2026-04-08', NULL),
('Flex',     'Sorocaba',             'NPI',  45, 60,   200, 95.0, '2026-03-20', 'New product introduction, 4 ECRs'),
('Wistron',  'Hsinchu',              'ICT',   3,  3,  2000, 99.4, '2026-04-12', NULL),
('Sanmina',  'Huntsville AL',        'SMT',  21, 22,  1200, 98.8, '2026-04-14', 'US site, premium 22% vs China'),
('Foxconn',  'Tainan',               'SMT',  12, 11,  6000, 99.3, '2026-04-29', NULL),
('Pegatron', 'Indjija',              'SMT',  21, 19,  2500, 98.9, '2026-04-30', 'EU-side capacity'),
('Jabil',    'Wroclaw',              'FATP', 30, 32,   900, 98.0, '2026-04-02', 'Polish EU site'),
('Flex',     'Penang',               'FATP', 28, 28,  3000, 99.0, '2026-04-19', NULL),
('Sanmina',  'Chennai',              'SMT',  21, 20,  1500, 98.5, '2026-04-21', 'India alternative'),
('Foxconn',  'Shenzhen Longhua',     'AOI',   1,  1,  5000, 99.8, '2026-04-19', NULL),
('Foxconn',  'Zhengzhou',            'ICT',   2,  2, 25000, 99.5, '2026-04-23', NULL),
('Pegatron', 'Suzhou',               'FATP', 35, 33,  3200, 98.2, '2026-04-28', NULL),
('Wistron',  'Texcoco',              'SMT',  21, 23,  1800, 98.6, '2026-04-11', 'Mexico nearshore'),
('Jabil',    'Penang',               'NPI',  60, 75,    50, 92.0, '2026-03-15', 'Brand-new SKU')
ON CONFLICT DO NOTHING;

-- Landed-cost rollups
INSERT INTO landed_costs (bom_id, origin_country, destination_country, incoterm, fob_total_usd, duty_pct, freight_usd, insurance_usd, brokerage_usd, carrying_pct_per_year, days_in_inventory, lot_qty, computed_landed_per_unit) VALUES
(1, 'China',  'USA', 'FOB', 18500.00, 0.0,  2100.00, 80.00, 150.00, 0.18, 45, 5000, 4.30),
(1, 'China',  'USA', 'FOB', 18500.00, 25.0, 2100.00, 80.00, 150.00, 0.18, 60, 5000, 5.41),
(2, 'China',  'USA', 'FOB',  9200.00, 25.0,  850.00, 40.00, 120.00, 0.20, 30,  200, 60.30),
(2, 'Mexico', 'USA', 'DDP',  9400.00, 0.0,   320.00, 30.00, 100.00, 0.18, 14,  200, 49.25),
(3, 'China',  'USA', 'FOB',  2200.00, 0.0,   180.00, 20.00,  60.00, 0.15, 30, 1000, 2.49),
(3, 'China',  'USA', 'FOB',  2200.00, 25.0,  180.00, 20.00,  60.00, 0.15, 60, 1000, 3.08),
(1, 'Vietnam','USA', 'CIF', 19800.00, 0.0,  2100.00, 80.00, 150.00, 0.18, 45, 5000, 4.55)
ON CONFLICT DO NOTHING;

-- DFM checks
INSERT INTO dfm_checks (bom_id, rule_code, rule_description, severity, location, measured_value, spec_value, status) VALUES
(1, 'BGA_PITCH',     'BGA ball pitch under min for 4-layer stack-up',         'warn', 'U17 (XC7Z020 BGA)', '0.80mm', '>=0.80mm 4L OK',       'open'),
(1, 'COPPER_POUR',   'Copper pour clearance to board edge',                   'fail', 'edge L1',           '0.10mm', '>=0.20mm',             'open'),
(1, 'ACUTE_ANGLE',   'Acute angle in copper polygon (<30 deg)',               'warn', 'GND L4 cutout',     '24deg',  '>=30deg',              'open'),
(1, 'SILK_OVER_PAD', 'Silkscreen overlapping SMD pad',                        'warn', 'U2 pin 1 dot',      'overlap','no overlap',          'fixed'),
(2, 'FPC_BEND',      'FPC bend radius vs flex thickness ratio',               'fail', 'FPC J3-J4',         '4x',     '>=10x thickness',      'open'),
(2, 'COPPER_POUR',   'Inadequate thermal relief on high-current pad',         'warn', 'Q1 source',         '0.15mm spokes', '0.30mm spokes','waived'),
(2, 'BGA_PITCH',     'BGA pitch acceptable (LGA-14 not BGA)',                 'info', 'U2',                '0.50mm', '>=0.50mm OK',         'fixed'),
(3, 'ACUTE_ANGLE',   'Sharp inside corner of slot (stress riser)',            'warn', 'enclosure slot',    '0.5mm radius','>=1.0mm radius', 'open'),
(3, 'SILK_OVER_PAD', 'Silk over SMD pad on R2',                               'fail', 'R2',                'overlap','no overlap',          'open'),
(1, 'BGA_PITCH',     'Via-in-pad required for 0.80mm BGA but not specified',  'fail', 'U17',               'standard via','via-in-pad',     'open')
ON CONFLICT DO NOTHING;

-- ECNs
INSERT INTO ecns (ecn_number, bom_id, change_type, description, reason, status, ppap_level, ppap_required_docs, initiated_by, approved_by, approved_at, target_effective_date) VALUES
('ECN-2026-001', 3, 'MPN_SWAP',             'Replace FT232RL-REEL with CP2102N-A02-GQFN24R',                     'EOL',        'approved',    3, 'DFMEA,PFMEA,CONTROL_PLAN,DIM_REPORT,IMDS', 'David Lee',  'Sarah Chen', '2026-04-12 10:00:00', '2026-05-01'),
('ECN-2026-002', 1, 'SOURCE_ADD',           'Add LCSC C701341 as second source for ESP32-WROOM-32E',             'SHORTAGE',   'implemented', 2, 'DIM_REPORT,APPEARANCE',                  'Sarah Chen', 'Sarah Chen', '2026-03-20 10:00:00', '2026-04-01'),
('ECN-2026-003', 2, 'OBSOLETE_REPLACEMENT', 'Replace GMK316ABJ226ML-T (EOL) with GRM31CR60J226ME19L',             'EOL',        'in_review',   3, 'DFMEA,PFMEA,CONTROL_PLAN,DIM_REPORT',     'Mike Torres', NULL,         NULL,                  '2026-06-15'),
('ECN-2026-004', 1, 'REV_BUMP',             'Rev A1->A2: add ESD diode on USB-C VBUS',                            'QUALITY',    'draft',       1, 'DIM_REPORT',                             'Sarah Chen', NULL,         NULL,                  '2026-06-30'),
('ECN-2026-005', 2, 'MPN_SWAP',             'Switch CRCW06031K00FKEA -> RC0603FR-071KL (cost down)',              'COST',       'approved',    1, 'DIM_REPORT',                             'Mike Torres','Sarah Chen', '2026-04-25 10:00:00', '2026-05-10'),
('ECN-2026-006', 3, 'REV_BUMP',             'Rev C0->C1: silkscreen fix on R2',                                   'REGULATORY', 'rejected',    1, 'NONE',                                   'David Lee',  'Sarah Chen', '2026-04-30 10:00:00', NULL)
ON CONFLICT (ecn_number) DO NOTHING;

-- AQL plans (ISO 2859-1, General Inspection Level II, normal)
INSERT INTO aql_plans (lot_size_min, lot_size_max, inspection_level, code_letter, aql_pct, sample_size, accept, reject, plan_type) VALUES
(2,      8,      'II', 'A', 0.65,  2,   0, 1, 'normal'),
(9,      15,     'II', 'B', 0.65,  3,   0, 1, 'normal'),
(16,     25,     'II', 'C', 0.65,  5,   0, 1, 'normal'),
(26,     50,     'II', 'D', 1.0,   8,   0, 1, 'normal'),
(51,     90,     'II', 'E', 1.0,  13,   0, 1, 'normal'),
(91,     150,    'II', 'F', 1.0,  20,   0, 1, 'normal'),
(151,    280,    'II', 'G', 1.0,  32,   1, 2, 'normal'),
(281,    500,    'II', 'H', 1.0,  50,   1, 2, 'normal'),
(501,    1200,   'II', 'J', 1.0,  80,   2, 3, 'normal'),
(1201,   3200,   'II', 'K', 1.0, 125,   3, 4, 'normal'),
(3201,   10000,  'II', 'L', 1.0, 200,   5, 6, 'normal'),
(10001,  35000,  'II', 'M', 1.0, 315,   7, 8, 'normal'),
(35001,  150000, 'II', 'N', 1.0, 500,  10,11, 'normal'),
(151,    280,    'II', 'G', 0.65, 32,   0, 1, 'tightened'),
(281,    500,    'II', 'H', 0.65, 50,   1, 2, 'tightened'),
(501,    1200,   'II', 'J', 0.65, 80,   1, 2, 'tightened'),
(151,    280,    'II', 'G', 1.5,  32,   2, 3, 'reduced'),
(281,    500,    'II', 'H', 1.5,  50,   3, 4, 'reduced'),
(2,      8,      'II', 'A', 1.5,   2,   0, 1, 'normal'),
(9,      15,     'II', 'B', 2.5,   3,   0, 1, 'normal'),
(16,     25,     'II', 'C', 4.0,   5,   1, 2, 'normal')
ON CONFLICT DO NOTHING;

-- AQL inspections
INSERT INTO aql_inspections (order_id, plan_id, lot_size, sample_size, defects_found, decision, inspector, notes) VALUES
(1,  11, 2000,  125, 1, 'accept', 'Robert Kim',  'Bolt batch, single cosmetic ding'),
(8,  12, 5000,  200, 4, 'accept', 'Emma Wilson', 'MOSFET driver, 4 marginal Vds'),
(9,  9,  300,   80,  3, 'accept', 'Lisa Tanaka', 'O-ring batch'),
(12, 12,10000, 200, 5, 'accept', 'Robert Kim',  'M5 socket cap, no issues'),
(2,  9,  100,   80,  9, 'reject','Emma Wilson', 'Surface finish high, 9 fails'),
(7,  9,   60,   50,  0, 'accept','Lisa Tanaka', 'Worm gear set, perfect lot'),
(13, 8,   30,   13,  3, 'reject','Robert Kim',  'Backlash issue 23%')
ON CONFLICT DO NOTHING;
