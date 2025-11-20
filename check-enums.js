import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const client = new pg.Client({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

await client.connect();

const result = await client.query(`
  SELECT t.typname, e.enumlabel 
  FROM pg_type t 
  JOIN pg_enum e ON t.oid = e.enumtypid 
  ORDER BY t.typname, e.enumsortorder;
`);

console.log('\nCurrent database enums:');
let currentType = null;
result.rows.forEach(row => {
  if (row.typname !== currentType) {
    console.log(`\n${row.typname}:`);
    currentType = row.typname;
  }
  console.log(`  - ${row.enumlabel}`);
});

await client.end();
