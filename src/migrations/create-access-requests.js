import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/dbPostgres.js';

async function run() {
  try {
    console.log('Connecting to Postgres via Sequelize...');
    await sequelize.authenticate();
    console.log('Connected');

    const sql = `
-- Create enum type for access request status if missing
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_access_requests_status') THEN
    CREATE TYPE enum_access_requests_status AS ENUM ('pending','approved','rejected');
  END IF;
END$$;

-- Create table if not exists
CREATE TABLE IF NOT EXISTS access_requests (
  id SERIAL PRIMARY KEY,
  name varchar(255) NOT NULL,
  organization varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  message text,
  status enum_access_requests_status NOT NULL DEFAULT 'pending',
  reviewedBy integer REFERENCES users(id),
  reviewedAt timestamp with time zone,
  reviewNotes text,
  "createdAt" timestamp with time zone DEFAULT now(),
  "updatedAt" timestamp with time zone DEFAULT now()
);
`;

    await sequelize.query(sql);
    console.log('access_requests table ensured');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
