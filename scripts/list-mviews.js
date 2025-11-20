#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import { Client } from 'pg';

const client = new Client({
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'papdocauthxv2',
});

async function listMaterializedViews() {
  try {
    await client.connect();
    const result = await client.query(`
      SELECT matviewname 
      FROM pg_matviews 
      WHERE schemaname = 'public'
      ORDER BY matviewname;
    `);
    
    console.log('Existing materialized views:');
    result.rows.forEach(row => console.log('  -', row.matviewname));
    console.log(`\nTotal: ${result.rows.length}`);
    
    return result.rows.map(r => r.matviewname);
  } finally {
    await client.end();
  }
}

listMaterializedViews().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
