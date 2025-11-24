const { execSync } = require('child_process');
const path = require('path');

const migrationsDir = path.join(__dirname, '../migrations');
const files = [
  '001_add_indexes.sql',
  '002_partition_audit_logs.sql',
  '003_stored_procedures.sql',
  '004_triggers.sql',
  '005_materialized_views.sql',
  '006_advanced_sql_features.sql',
  '007_add_verified_to_audit_action_enum.sql',
];


let dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!dbUrl) {
  // Build from POSTGRES_* env vars
  const host = process.env.POSTGRES_HOST || '127.0.0.1';
  const port = process.env.POSTGRES_PORT || '5432';
  const db = process.env.POSTGRES_DB || 'postgres';
  const user = process.env.POSTGRES_USER || 'postgres';
  const pass = process.env.POSTGRES_PASSWORD || '';
  dbUrl = `postgresql://${user}:${pass}@${host}:${port}/${db}`;
}

for (const file of files) {
  const filePath = path.join(migrationsDir, file);
  console.log(`Running migration: ${file}`);
  try {
    execSync(`psql "${dbUrl}" -f "${filePath}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`Migration failed: ${file}`);
    process.exit(1);
  }
}
console.log('All migrations applied successfully.');
