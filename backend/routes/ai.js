const router = require('express').Router();
const verifyToken = require("../middleware/auth");
const db = require('../db');

async function callAI(userPrompt, systemPrompt = '') {
  if (!process.env.OPENROUTER_API_KEY) {
    const err = new Error('AI service unavailable: OPENROUTER_API_KEY not configured');
    err.code = 'AI_UNAVAILABLE';
    throw err;
  }
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost',
      'X-Title': 'HardwareOS'
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: userPrompt }
      ]
    })
  });
  if (!r.ok) {
    const err = new Error(`AI service unavailable (HTTP ${r.status})`);
    err.code = 'AI_UNAVAILABLE';
    throw err;
  }
  const data = await r.json();
  return data.choices?.[0]?.message?.content || 'AI unavailable';
}

function aiHandler(buildPrompt, systemPrompt) {
  return async (req, res) => {
    try {
      const prompt = buildPrompt(req.body);
      const result = await callAI(prompt, systemPrompt);
      // Best-effort audit logging (table may not exist on first run)
      try {
        await db.query(
          'INSERT INTO audit_log (user_id, user_email, action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4,$5,$6)',
          [req.user?.id || null, req.user?.email || null, 'ai_invocation', 'ai_feature', null, req.path]
        );
      } catch (_) { /* ignore audit failures */ }
      res.json({ result });
    } catch (e) {
      if (e.code === 'AI_UNAVAILABLE') return res.status(503).json({ error: e.message });
      res.status(500).json({ error: e.message });
    }
  };
}

router.post('/lead-time-prediction', verifyToken, aiHandler(({ part, supplier, order_history }) => `Analyze this hardware supply chain data and predict the actual lead time vs the quoted lead time.

Part: ${JSON.stringify(part)}
Supplier: ${JSON.stringify(supplier)}
Order History: ${JSON.stringify(order_history)}

Provide:
1. **Predicted Actual Lead Time** (with confidence range)
2. **Key Risk Factors** affecting delivery
3. **Historical Pattern Analysis** from order data
4. **Recommendations** to reduce lead time variance

Be specific with numbers and actionable insights.`, 'You are a supply chain analyst specializing in hardware component procurement. Provide detailed, data-driven analysis.'));

router.post('/supplier-recommendation', verifyToken, aiHandler(({ part, requirements, available_suppliers }) => `Recommend the best supplier for this hardware component.

Part: ${JSON.stringify(part)}
Requirements: ${JSON.stringify(requirements)}
Available Suppliers: ${JSON.stringify(available_suppliers)}

Provide:
1. **Top 3 Supplier Recommendations** with scores
2. **Comparison Matrix** (cost, lead time, quality, reliability)
3. **Risk Assessment** for each supplier
4. **Final Recommendation** with justification`, 'You are a procurement specialist for hardware manufacturing companies.'));

router.post('/bottleneck-analysis', verifyToken, aiHandler(({ iterations, orders }) => `Analyze this supply chain data to identify bottlenecks.

Design Iterations: ${JSON.stringify(iterations)}
Orders: ${JSON.stringify(orders)}

Identify:
1. **Critical Bottlenecks** slowing production
2. **US vs Overseas Manufacturing Gap** - specific time differences
3. **Iteration Cycle Analysis** - where time is lost
4. **Top 5 Actionable Recommendations** to eliminate bottlenecks`, 'You are a supply chain optimization expert. Focus on actionable insights.'));

router.post('/cost-optimization', verifyToken, aiHandler(({ part, suppliers }) => `Suggest cost reduction strategies for this hardware part.

Part: ${JSON.stringify(part)}
Available Suppliers: ${JSON.stringify(suppliers)}

Provide:
1. **Cost Breakdown Analysis** - where costs come from
2. **Quick Wins** (savings achievable in <30 days)
3. **Strategic Initiatives** (longer-term cost reduction)
4. **Make vs Buy Analysis**
5. **Estimated Savings** for each recommendation`, 'You are a cost engineering specialist for hardware manufacturing.'));

// === New AI features ===

// 1. Supplier risk scorer
router.post('/supplier-risk', verifyToken, aiHandler(({ supplier, orders, quality_checks }) => `Score the operational and supply-chain risk for this supplier on a 0-100 scale (higher = riskier).

Supplier: ${JSON.stringify(supplier)}
Recent Orders: ${JSON.stringify(orders)}
Quality Checks: ${JSON.stringify(quality_checks)}

Return:
1. **Overall Risk Score** (0-100) with level (Low/Med/High/Critical)
2. **Risk Breakdown** across: delivery, quality, financial, geopolitical, single-source dependency
3. **Top 3 Red Flags** in the data
4. **Mitigation Plan** with specific tactical steps
5. **Monitoring KPIs** to watch monthly`, 'You are a supplier risk and procurement compliance analyst. Be quantitative and concise.'));

// 2. BOM cost optimizer
router.post('/bom-optimizer', verifyToken, aiHandler(({ bom, suppliers }) => `Optimize the total cost of this Bill of Materials while preserving quality.

BOM (parts and quantities): ${JSON.stringify(bom)}
Suppliers Pool: ${JSON.stringify(suppliers)}

Deliver:
1. **Current BOM Total** (computed from data)
2. **Optimized BOM** with line-item changes (sub, supplier-switch, requantify)
3. **Estimated Savings** ($ and %)
4. **Risk Trade-offs** for each change
5. **Implementation Sequence** (what to switch first)`, 'You are a hardware cost engineer optimizing BOM economics without compromising design intent.'));

// 3. Quality defect predictor
router.post('/defect-predictor', verifyToken, aiHandler(({ part, supplier, quality_history }) => `Predict the likely defect rate and failure modes for the next batch of this part from this supplier.

Part: ${JSON.stringify(part)}
Supplier: ${JSON.stringify(supplier)}
Historical QC Data: ${JSON.stringify(quality_history)}

Provide:
1. **Predicted Defect Rate %** with confidence interval
2. **Most Probable Failure Modes** ranked
3. **Sample Size Recommendation** for incoming inspection
4. **Pre-emptive Corrective Actions**
5. **Pass/Fail Probability** for the next batch`, 'You are a hardware quality engineer specializing in incoming inspection and SPC.'));

// 4. Demand forecaster
router.post('/demand-forecast', verifyToken, aiHandler(({ part, orders, horizon_days }) => `Forecast demand for the next ${horizon_days || 90} days for this part based on historical orders.

Part: ${JSON.stringify(part)}
Order History: ${JSON.stringify(orders)}
Horizon (days): ${horizon_days || 90}

Output:
1. **Forecasted Demand** (units) with weekly granularity if possible
2. **Seasonality / Trend Signals** detected
3. **Reorder Recommendation** (timing + quantity) given current stock level
4. **Confidence Level** and key assumptions
5. **Risks to the Forecast**`, 'You are a demand planner for hardware components. Be numeric and structured.'));

// 5. Geopolitical disruption analyzer
router.post('/geopolitical-analyzer', verifyToken, aiHandler(({ suppliers, focus_region }) => `Assess geopolitical and trade-disruption exposure across this supplier base.

Suppliers: ${JSON.stringify(suppliers)}
Focus Region (optional): ${JSON.stringify(focus_region || 'global')}

Provide:
1. **Country Exposure Map** (% of base by country) and concentration risk
2. **Top 5 Geopolitical Risks** in next 6-12 months relevant to this base
3. **Tariff / Export-Control Watchlist**
4. **Diversification Recommendations** (which countries to add)
5. **Contingency Playbook** for the most likely disruption`, 'You are a geopolitical and trade risk analyst for hardware supply chains.'));

module.exports = router;
