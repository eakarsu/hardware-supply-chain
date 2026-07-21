const fs = require('fs');
const path = require('path');
const db = require('../db');

async function migrate() {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8'));
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    const directory = path.join(__dirname, '../db/migrations');
    for (const file of fs.readdirSync(directory).filter(name => name.endsWith('.sql')).sort()) {
      const version = file.replace(/\.sql$/, '');
      const applied = await client.query('SELECT 1 FROM schema_migrations WHERE version=$1', [version]);
      if (!applied.rows[0]) {
        await client.query(fs.readFileSync(path.join(directory, file), 'utf8'));
        await client.query('INSERT INTO schema_migrations(version) VALUES ($1)', [version]);
      }
    }
    await client.query('COMMIT');
    console.log('Database migrations complete');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await db.end();
  }
}

migrate().catch(error => { console.error(error.message); process.exitCode = 1; });
