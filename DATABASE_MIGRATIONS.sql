-- ================================================================
-- Database Schema Migrations for PapDocAuthX
-- Run these migrations to fix enum type mismatches
-- ================================================================


ALTER TYPE enum_document_workflow_status ADD VALUE IF NOT EXISTS 'PENDING';
-- This ensures all audit actions are supported

-- ==========================================
-- Safe removal of 'user' from enum_users_role
-- This migration will:
-- 1) Ensure there are ZERO rows with role='user' (abort if found)
-- 2) Create a new enum type without 'user'
-- 3) Alter the `users.role` column to the new type
-- 4) Drop the old enum type and rename the new one
-- Run only after confirming backups are taken.
-- ==========================================

BEGIN;

-- Abort if any rows still have the 'user' role
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM users WHERE role = 'user') THEN
		RAISE EXCEPTION 'Migration aborted: found rows with role=''user''. Remove or migrate them first.';
	END IF;
END$$;

-- Create new enum type without 'user'
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role_new') THEN
		CREATE TYPE enum_users_role_new AS ENUM ('superadmin','admin','verifier');
	END IF;
END$$;

-- Alter column to the new type (uses text cast)
ALTER TABLE users ALTER COLUMN role TYPE enum_users_role_new USING role::text::enum_users_role_new;

-- Drop the old enum and rename the new one to keep the original name
DROP TYPE IF EXISTS enum_users_role;
ALTER TYPE enum_users_role_new RENAME TO enum_users_role;

COMMIT;

-- ==========================================
-- Create `access_requests` table if it does not exist
-- ==========================================

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


ALTER TYPE enum_audit_log_action ADD VALUE IF NOT EXISTS 'VERIFIED';

-- ================================================================
-- Verification Queries
-- ================================================================

-- Check current enum values for document_workflow status
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'enum_document_workflow_status'::regtype
ORDER BY enumsortorder;

-- Expected output: APPROVED, REVOKED, PENDING

-- Check current enum values for audit_log action
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'enum_audit_log_action'::regtype
ORDER BY enumsortorder;

-- Expected output: UPLOAD, APPROVE, REVOKE, CRYPTO_CHECK, VERIFIED

-- ================================================================
-- Alternative: Drop and Recreate (USE WITH CAUTION - LOSES DATA)
-- Only use if adding values doesn't work
-- ================================================================

/*
-- Backup your data first!

-- 1. Drop dependent constraints/columns
ALTER TABLE document_workflow ALTER COLUMN status TYPE VARCHAR(50);
DROP TYPE IF EXISTS enum_document_workflow_status CASCADE;

-- 2. Recreate the enum
CREATE TYPE enum_document_workflow_status AS ENUM ('APPROVED', 'REVOKED', 'PENDING');

-- 3. Convert column back to enum
ALTER TABLE document_workflow ALTER COLUMN status TYPE enum_document_workflow_status USING status::enum_document_workflow_status;

-- Same for audit_logs
ALTER TABLE audit_logs ALTER COLUMN action TYPE VARCHAR(50);
DROP TYPE IF EXISTS enum_audit_log_action CASCADE;
CREATE TYPE enum_audit_log_action AS ENUM ('UPLOAD', 'APPROVE', 'REVOKE', 'CRYPTO_CHECK', 'VERIFIED');
ALTER TABLE audit_logs ALTER COLUMN action TYPE enum_audit_log_action USING action::enum_audit_log_action;
*/
