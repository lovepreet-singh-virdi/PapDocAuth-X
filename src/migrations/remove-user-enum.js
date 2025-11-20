import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../config/dbPostgres.js';

/**
 * Safe migration to remove 'user' from enum_users_role.
 * Preconditions:
 *  - You must have a recent database backup (pg_dump).
 *  - There must be ZERO rows with role='user'. This script will abort if any exist.
 * Behavior:
 *  - Creates a temporary enum type without 'user'
 *  - Alters the users.role column to use the new enum
 *  - Drops the old enum and renames the new type
 */
async function run() {
  try {
    console.log('Connecting to DB');
    await sequelize.authenticate();

    const [countResults] = await sequelize.query("SELECT COUNT(*)::int as cnt FROM users WHERE role = 'user'");
    const cnt = countResults[0].cnt;
    console.log(`users with role='user': ${cnt}`);

    if (cnt > 0) {
      console.error("Aborting: there are users with role='user'. Migrate or remove them first.");
      process.exit(2);
    }

    console.log('Applying migration to replace enum_users_role');
    const sql = `BEGIN;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role_new') THEN
    CREATE TYPE enum_users_role_new AS ENUM ('superadmin','admin','verifier');
  END IF;
END$$;

ALTER TABLE users ALTER COLUMN role TYPE enum_users_role_new USING role::text::enum_users_role_new;

DROP TYPE IF EXISTS enum_users_role;
ALTER TYPE enum_users_role_new RENAME TO enum_users_role;

COMMIT;`;

    await sequelize.query(sql);
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
