const router = require('express').Router();
const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const db = require('../db');
const verifyToken = require('../middleware/auth');

function tokenHash(token) { return crypto.createHash('sha256').update(token).digest('hex'); }

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const r = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!r.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = crypto.randomBytes(32).toString('base64url');
    await db.query(`INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '8 hours')`, [tokenHash(token), user.id]);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role || 'operator' } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/me', verifyToken, (req, res) => res.json({ user: req.user }));

module.exports = router;
