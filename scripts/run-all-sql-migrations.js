// Script to run all SQL migrations in order using psql
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

// You can set these via env or hardcode for local dev
defaults = {
  PGUSER: process.env.PGUSER || 'postgres',
  PGDATABASE: process.env.PGDATABASE || 'papdocauthxv2',
  PGPASSWORD: process.env.PGPASSWORD || '',
  PGHOST: process.env.PGHOST || 'localhost',
  PGPORT: process.env.PGPORT || '5432',
};

const env = Object.entries(defaults)
  .map(([k, v]) => `${k}=${v}`)
  .join(' ');

// Get all .sql files in migrations dir, sorted
const files = fs.readdirSync(MIGRATIONS_DIR)
  .filter(f => f.match(/^\d+_.+\.sql$/))
  .sort();

for (const file of files) {
  const filePath = path.join(MIGRATIONS_DIR, file);
  const cmd = `${env} psql -U ${defaults.PGUSER} -d ${defaults.PGDATABASE} -h ${defaults.PGHOST} -p ${defaults.PGPORT} -f "${filePath}"`;
  try {
    console.log('Running migration:', file);
    execSync(cmd, { stdio: 'inherit' });
    console.log('Migration completed:', file);
  } catch (err) {
    console.error('Migration failed:', file, err.message);
    process.exit(1);
  }
}
console.log('All migrations completed successfully.');
