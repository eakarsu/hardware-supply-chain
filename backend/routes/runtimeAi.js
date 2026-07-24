const router = require('express').Router();
const db = require('../db');
const verifyToken = require('../middleware/auth');

router.post('/supply-chain-advice', verifyToken, async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || '').trim();
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl = process.env.OPENROUTER_BASE_URL;
    const model = process.env.OPENROUTER_MODEL;
    if (!apiKey || !baseUrl || !model) return res.status(503).json({ error: 'OpenRouter is not configured' });
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Provide concise hardware supply-chain risk advice with auditable evidence and concrete mitigation steps.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) return res.status(502).json({ error: `OpenRouter returned ${response.status}` });
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) return res.status(502).json({ error: 'OpenRouter returned empty content' });
    const stored = await db.query(
      `INSERT INTO runtime_ai_results(user_id,prompt,content,provider,model)
       VALUES($1,$2,$3,'openrouter',$4) RETURNING id`,
      [req.user.id, prompt, content, model],
    );
    return res.json({ content, provider: 'openrouter', model, persistedId: stored.rows[0].id });
  } catch (error) {
    return res.status(502).json({ error: error instanceof Error ? error.message : 'AI request failed' });
  }
});

module.exports = router;
