// Script to run a raw SQL migration file using psql
const { execSync } = require('child_process');
const path = require('path');

const MIGRATION_FILE = path.join(__dirname, '../migrations/007_add_verified_to_audit_action_enum.sql');

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

const cmd = `${env} psql -U ${defaults.PGUSER} -d ${defaults.PGDATABASE} -h ${defaults.PGHOST} -p ${defaults.PGPORT} -f "${MIGRATION_FILE}"`;

try {
  console.log('Running migration:', MIGRATION_FILE);
  execSync(cmd, { stdio: 'inherit' });
  console.log('Migration completed successfully.');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
}
