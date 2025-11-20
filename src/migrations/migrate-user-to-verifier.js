import dotenv from "dotenv";
dotenv.config();

import { sequelize } from "../config/dbPostgres.js";

/**
 * Migration: Update role ENUM from 'user' to 'verifier'
 * Steps:
 * 1. Add 'verifier' to the ENUM type
 * 2. Update all 'user' records to 'verifier'
 * 3. Remove 'user' from the ENUM type
 */
async function migrateUserRoleToVerifier() {
  try {
    console.log("Starting migration: user -> verifier");

    // Connect to database
    await sequelize.authenticate();
    console.log("Database connected");

    // Step 1: Check how many users have role 'user'
    const [results] = await sequelize.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'user'"
    );
    const userCount = results[0].count;
    console.log(`Found ${userCount} users with role='user'`);

    if (userCount === 0) {
      console.log("No users to migrate. Checking ENUM...");
    }

    // Step 2: Add 'verifier' to the ENUM type (if not exists)
    console.log("Adding 'verifier' to enum_users_role...");
    try {
      await sequelize.query(
        "ALTER TYPE enum_users_role ADD VALUE IF NOT EXISTS 'verifier'"
      );
      console.log("Added 'verifier' to ENUM");
    } catch (err) {
      // PostgreSQL < 9.3 doesn't support IF NOT EXISTS
      console.log("Warning: 'verifier' may already exist in ENUM (or PostgreSQL version < 9.3)");
    }

    // Step 3: Update all users with role 'user' to 'verifier'
    if (userCount > 0) {
      console.log(`Updating ${userCount} users...`);
      await sequelize.query(
        "UPDATE users SET role = 'verifier' WHERE role = 'user'"
      );
      console.log(`Successfully migrated ${userCount} users from 'user' to 'verifier'`);
    }

    // Step 4: Verify the update
    const [verifyResults] = await sequelize.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'user'"
    );
    const remainingUsers = verifyResults[0].count;

    if (remainingUsers === 0) {
      console.log("Migration completed successfully!");
      console.log("\nSummary:");
      console.log(`   - Users migrated: ${userCount}`);
      console.log(`   - Remaining 'user' roles: ${remainingUsers}`);
      console.log("\nNOTE: The 'user' value still exists in the ENUM type.");
      console.log("To remove it completely you may: ");
      console.log("  1) Create a new ENUM type without 'user'");
      console.log("  2) Alter the column to use the new type");
      console.log("  3) Drop the old ENUM type");
      console.log("This is an advanced operation and not required if no rows use 'user'.");
    } else {
      console.log(`Warning: ${remainingUsers} users still have role='user'`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

// Run migration
migrateUserRoleToVerifier();
