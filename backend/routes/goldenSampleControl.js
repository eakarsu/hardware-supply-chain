const express = require('express');
const router = express.Router();

let samples = [
  { id: 1, part: 'ENC-ALU-42', supplier: 'Shenzhen Alpha CNC', sample: 'GS-1004', revision: 'B2', inspection: 'dimensional pass', status: 'locked' },
  { id: 2, part: 'PCB-MAIN-09', supplier: 'Bay Circuits', sample: 'GS-1011', revision: 'C1', inspection: 'solder mask delta', status: 'review' },
  { id: 3, part: 'HARNESS-7P', supplier: 'WireWorks MX', sample: 'GS-998', revision: 'A4', inspection: 'pull test pass', status: 'locked' }
];

router.get('/', (_req, res) => {
  const summary = samples.reduce((acc, row) => {
    acc.total += 1;
    acc.locked += row.status === 'locked' ? 1 : 0;
    acc.review += row.status === 'review' ? 1 : 0;
    return acc;
  }, { total: 0, locked: 0, review: 0 });
  res.json({ samples, summary });
});

router.post('/', (req, res) => {
  const item = {
    id: Date.now(),
    part: req.body.part || 'part-pending',
    supplier: req.body.supplier || 'supplier-pending',
    sample: req.body.sample || 'GS-pending',
    revision: req.body.revision || 'A0',
    inspection: req.body.inspection || 'pending',
    status: req.body.status || 'review'
  };
  samples = [item, ...samples];
  res.status(201).json(item);
});

module.exports = router;
