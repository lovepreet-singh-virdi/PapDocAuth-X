/**
 * Database Migration Script
 * Run: node run-migrations.js
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
  host: process.env.POSTGRES_HOST || '127.0.0.1',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'papdocauthxv2',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

async function runMigrations() {
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected to database:', process.env.POSTGRES_DB);

    // Migration 1: Add PENDING to document_workflow status enum
    console.log('\nMigration 1: Adding PENDING to document_workflow status enum...');
    try {
      await client.query(`
        ALTER TYPE enum_document_workflow_status ADD VALUE IF NOT EXISTS 'PENDING';
      `);
      console.log('Migration 1 completed');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('Warning: PENDING value already exists, skipping...');
      } else {
        throw err;
      }
    }

    // Migration 2: Add VERIFIED to audit_logs action enum
    console.log('\nMigration 2: Adding VERIFIED to audit_logs action enum...');
    try {
      await client.query(`
        ALTER TYPE enum_audit_logs_action ADD VALUE IF NOT EXISTS 'VERIFIED';
      `);
      console.log('Migration 2 completed');
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log('Warning: VERIFIED value already exists, skipping...');
      } else {
        throw err;
      }
    }

    // Verify migrations
    console.log('\nVerifying enum values...');
    
    const workflowStatusResult = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'enum_document_workflow_status'::regtype
      ORDER BY enumsortorder;
    `);
    console.log('\nDocument Workflow Status values:');
    workflowStatusResult.rows.forEach(row => console.log('   -', row.enumlabel));

    const auditActionResult = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'enum_audit_logs_action'::regtype
      ORDER BY enumsortorder;
    `);
    console.log('\nAudit Log Action values:');
    auditActionResult.rows.forEach(row => console.log('   -', row.enumlabel));

    console.log('\nAll migrations completed successfully!');
    console.log('\nNext steps:');
    console.log('   1. Restart your backend server (npm run dev)');
    console.log('   2. Test workflow status changes (REVOKED -> PENDING)');
    console.log('   3. Verify analytics dashboards load correctly');

  } catch (err) {
    console.error('\nMigration failed:', err.message);
    console.error('\nFull error:', err);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

runMigrations();
