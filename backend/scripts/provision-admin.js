const bcrypt = require('bcrypt');
const db = require('../db');

async function main() {
  if (process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') throw new Error('BOOTSTRAP_ACKNOWLEDGEMENT=create-initial-admin is required');
  const email = String(process.env.PROVISION_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.PROVISION_ADMIN_PASSWORD || '');
  const name = String(process.env.PROVISION_ADMIN_NAME || '').trim();
  if (!email.includes('@') || password.length < 12 || !name) throw new Error('Valid PROVISION_ADMIN_* environment is required');
  const existing = await db.query('SELECT id FROM users WHERE lower(email)=lower($1)', [email]);
  if (existing.rows[0]) { console.log(JSON.stringify({ event: 'initial_admin_exists' })); return; }
  const result = await db.query("INSERT INTO users(email,password,name,role) VALUES($1,$2,$3,'admin') RETURNING id", [email, await bcrypt.hash(password, 12), name]);
  console.log(JSON.stringify({ event: 'initial_admin_created', userId: result.rows[0].id }));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.end());
