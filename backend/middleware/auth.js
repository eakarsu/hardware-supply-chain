const crypto = require('node:crypto');
const db = require('../db');

module.exports = async function verifyToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'No token provided' });
  const token = auth.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const result = await db.query(
      `UPDATE auth_sessions s SET last_seen_at=now() FROM users u
        WHERE s.token_hash=$1 AND s.expires_at>now() AND u.id=s.user_id
        RETURNING u.id,u.email,u.name,u.role`,
      [tokenHash],
    );
    if (!result.rows[0]) return res.status(401).json({ error: 'Invalid token' });
    req.user = result.rows[0];
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
