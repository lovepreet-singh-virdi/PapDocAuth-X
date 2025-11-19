#!/usr/bin/env node
import dotenv from 'dotenv';
dotenv.config();

import { Client } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const migrationsFile = path.resolve(projectRoot, 'migrations', '005_materialized_views.sql');

async function run() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'papdocauthxv2',
  });

  try {
    console.log('Connecting to Postgres...');
    await client.connect();

    console.log('Dropping all materialized views with CASCADE (if they exist)...');
    await client.query('DROP MATERIALIZED VIEW IF EXISTS mv_org_stats CASCADE;');
    await client.query('DROP MATERIALIZED VIEW IF EXISTS mv_document_activity CASCADE;');
    await client.query('DROP MATERIALIZED VIEW IF EXISTS mv_user_activity CASCADE;');
    console.log('Dropped all materialized views');

    await client.end();
    console.log('Postgres client closed. Running seeder by importing seed module...');

    // Import and run the seed script directly (avoids spawn issues on Windows)
    const seedModule = await import('../src/seed/seed.js');
    // The seed.js runs immediately in an IIFE, so just importing it executes seeding.
    // Wait a moment for it to complete (it calls process.exit, so we won't reach here if successful)
    await new Promise((resolve) => setTimeout(resolve, 30000));

    // Seeder calls process.exit(0) on success, so we won't reach here.
    // If we do reach here, it means seeder didn't exit - that's unexpected but not fatal.
    console.log('Unexpected: seeder did not exit. Continuing to recreate views...');

  } catch (err) {
    console.error('Operation failed:');
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}

// Override process.exit temporarily so the seed doesn't kill our script
const originalExit = process.exit;
let seedCompleted = false;

process.exit = function(code) {
  if (!seedCompleted) {
    seedCompleted = true;
    console.log(`Seeder completed with exit code ${code}`);
    if (code !== 0) {
      console.error('Seeder failed. Aborting.');
      originalExit(code);
    }
    // Don't actually exit - continue to recreate views
    recreateViews().then(() => {
      originalExit(0);
    }).catch((err) => {
      console.error('Failed to recreate views:', err);
      originalExit(1);
    });
  } else {
    originalExit(code);
  }
};

async function recreateViews() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'papdocauthxv2',
  });

  try {
    console.log('\nReconnecting to Postgres to recreate materialized views...');
    await client.connect();

    // Double-check: drop views again before recreating (in case seeder somehow created them)
    console.log('Ensuring materialized views are dropped before recreation...');
    await client.query('DROP MATERIALIZED VIEW IF EXISTS mv_org_stats CASCADE;');
    await client.query('DROP MATERIALIZED VIEW IF EXISTS mv_document_activity CASCADE;');
    await client.query('DROP MATERIALIZED VIEW IF EXISTS mv_user_activity CASCADE;');

    const sql = await fs.readFile(migrationsFile, 'utf8');

    // Execute the entire SQL file as one query (don't split on semicolons
    // because that breaks dollar-quoted functions and other complex SQL)
    console.log('Executing migrations SQL file...');
    await client.query(sql);
    console.log('Materialized views recreated and refresh function defined.');
  } finally {
    try { await client.end(); } catch(_){}
  }
}

run();
