#!/usr/bin/env node
/**
 * Fresh Database Setup Script
 * 
 * This script sets up a fresh database from scratch:
 * 1. Connects to Postgres and runs all migrations in order
 * 2. Creates materialized views
 * 3. Runs the seeder to populate initial data
 * 
 * Use this for:
 * - First-time local development setup
 * - Resetting your local database
 * - CI/CD fresh environment setup
 */

import dotenv from 'dotenv';
dotenv.config();

import { Client } from 'pg';
import { sequelize } from '../src/config/dbPostgres.js';
import { connectMongo } from '../src/config/dbMongo.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const migrationsDir = path.resolve(projectRoot, 'migrations');

async function runMigrations() {
  const client = new Client({
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: process.env.POSTGRES_PORT ? Number(process.env.POSTGRES_PORT) : 5432,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'papdocauthxv2',
  });

  try {
    console.log('=== Fresh Database Setup ===\n');
    
    console.log('Step 1: Connecting to databases...');
    await client.connect();
    await connectMongo();
    console.log('Connected to Postgres and MongoDB\n');

    console.log('Step 2: Running Sequelize sync to create base tables...');
    await sequelize.sync({ force: false }); // Create tables that don't exist
    console.log('Base SQL tables created\n');

    console.log('Step 3: Running migration files...');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort(); // Ensure migrations run in order

    for (const file of sqlFiles) {
      console.log(`  Running ${file}...`);
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      await client.query(sql);
      console.log(`  ${file} completed`);
    }
    console.log('All migrations applied\n');

    await client.end();

    console.log('Step 4: Running seeder...');
    // Import the seed module (it runs immediately)
    const originalExit = process.exit;
    let seedExitCode = null;
    
    process.exit = function(code) {
      seedExitCode = code;
      if (code !== 0) {
        console.error(`\nSeeder failed with exit code ${code}`);
        originalExit(code);
      }
    };

    await import('../src/seed/seed.js');
    
    // Wait for seed to complete
    await new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (seedExitCode !== null) {
          clearInterval(checkInterval);
          process.exit = originalExit;
          resolve();
        }
      }, 100);
    });

    console.log('\n=== Setup Complete ===');
    console.log('Your database is ready! Start the server with: npm run dev\n');
    process.exit(0);

  } catch (err) {
    console.error('\nSetup failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

runMigrations();
