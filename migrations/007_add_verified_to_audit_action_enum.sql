-- Add VERIFIED to enum_audit_logs_action if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'enum_audit_logs_action' AND e.enumlabel = 'VERIFIED'
  ) THEN
    ALTER TYPE enum_audit_logs_action ADD VALUE 'VERIFIED';
  END IF;
END$$;
