# Database Migrations - Week 1 Implementation

## Overview
This directory contains advanced database migrations implementing indexes, partitioning, stored procedures, triggers, and materialized views for the PapDocAuthX v2 system.

## Migration Files

### 001_add_indexes.sql
**Purpose:** Add strategic BTREE, GIN, and HASH indexes for query optimization

**Indexes Created:**
- **Users Table:** email, orgId, role, composite (orgId + role)
- **Organizations Table:** name (GIN trigram), domain, isActive
- **AuditLogs Table:** userId, orgId, docId, timestamp, action, org+timestamp, user+timestamp, prevHash
- **DocumentWorkflows Table:** docId, orgId, status, assignedTo, org+status
- **UserRoles Table:** userId, roleId

**Run Migration:**
```powershell
psql -U postgres -d papdocauthxv2 -f migrations/001_add_indexes.sql
```

**Verify Indexes:**
```sql
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

**Performance Testing:**
```sql
-- Before index
EXPLAIN ANALYZE SELECT * FROM "Users" WHERE email = 'admin@example.com';

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read 
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

---

### 002_partition_audit_logs.sql
**Purpose:** Implement range partitioning on AuditLogs by month for improved query performance

**Partitions Created:**
- Monthly partitions from June 2024 to June 2025
- Default partition for out-of-range timestamps

**Features:**
- Automatic partition creation function: `create_monthly_audit_partition()`
- Maintenance function: `drop_old_audit_partitions(months_to_keep INTEGER)`

**Run Migration:**
```powershell
psql -U postgres -d papdocauthxv2 -f migrations/002_partition_audit_logs.sql
```

**Verify Partitions:**
```sql
-- View all partitions
SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE tablename LIKE 'AuditLogs_%' 
ORDER BY tablename;

-- Check partition constraints
SELECT tablename, pg_get_expr(relpartbound, oid, true) AS partition_expression
FROM pg_class 
WHERE relname LIKE 'AuditLogs_%';

-- Count records per partition
SELECT tableoid::regclass AS partition, COUNT(*) 
FROM "AuditLogs" 
GROUP BY tableoid 
ORDER BY partition;
```

**Performance Testing:**
```sql
-- Query specific month (should hit only one partition)
EXPLAIN ANALYZE 
SELECT * FROM "AuditLogs" 
WHERE timestamp >= '2024-11-01' AND timestamp < '2024-12-01';
```

---

### 003_stored_procedures.sql
**Purpose:** Create reusable database functions for audit verification and analytics

**Functions Created:**

#### 1. verify_audit_chain(p_org_id, p_doc_id)
Verifies hash chain integrity for audit logs
```sql
SELECT * FROM verify_audit_chain();              -- Verify all chains
SELECT * FROM verify_audit_chain(p_org_id := 1); -- Verify org 1
SELECT * FROM verify_audit_chain(p_doc_id := 'DOC-2024-001'); -- Verify document
```

#### 2. get_org_statistics(p_org_id)
Returns comprehensive organization statistics
```sql
SELECT * FROM get_org_statistics(1);
```

#### 3. cleanup_old_audit_logs(p_retention_months, p_archive)
Archives and deletes old audit logs
```sql
-- DRY RUN - check what would be deleted (24 months retention)
SELECT * FROM cleanup_old_audit_logs(24, TRUE);
```

#### 4. get_document_version_history(p_doc_id)
Returns complete version history for a document
```sql
SELECT * FROM get_document_version_history('DOC-2024-001');
```

#### 5. bulk_create_users(p_org_id, p_users)
Bulk user creation for organizations
```sql
SELECT * FROM bulk_create_users(
  1, 
  '[{"email": "user1@example.com", "name": "User One", "role": "user"}]'::JSONB
);
```

**Run Migration:**
```powershell
psql -U postgres -d papdocauthxv2 -f migrations/003_stored_procedures.sql
```

**Test Functions:**
```sql
-- Test audit chain verification
SELECT * FROM verify_audit_chain();

-- Test org statistics
SELECT * FROM get_org_statistics(1);

-- Test document history
SELECT * FROM get_document_version_history('DOC-2024-001');
```

---

### 004_triggers.sql
**Purpose:** Implement automatic triggers for data integrity and audit logging

**Triggers Created:**

#### 1. Auto-update timestamp triggers
- `trigger_users_updated_at` - Updates `updatedAt` on Users
- `trigger_organizations_updated_at` - Updates `updatedAt` on Organizations
- `trigger_document_workflows_updated_at` - Updates `updatedAt` on DocumentWorkflows

#### 2. Auto-audit workflow changes
- `trigger_auto_audit_workflow` - Automatically logs DocumentWorkflow status changes

#### 3. Prevent approved document deletion
- `trigger_prevent_deletion` - Blocks deletion of approved documents

#### 4. Email domain validation
- `trigger_validate_email_domain` - Ensures user email matches org domain

#### 5. Organization deactivation cascade
- `trigger_cascade_org_deactivation` - Logs org deactivation events

#### 6. Audit chain validation
- `trigger_validate_chain` - Validates hash chain on insert

#### 7. Audit log immutability
- `trigger_prevent_audit_modification` - Prevents UPDATE/DELETE on audit logs
- `trigger_prevent_audit_deletion` - Prevents deletion of audit logs

**Run Migration:**
```powershell
psql -U postgres -d papdocauthxv2 -f migrations/004_triggers.sql
```

**Verify Triggers:**
```sql
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

**Test Triggers:**
```sql
-- Test auto-update timestamp
UPDATE "Users" SET name = 'Test Update' WHERE id = 1;
SELECT "updatedAt" FROM "Users" WHERE id = 1; -- Should be current timestamp

-- Test audit log immutability (should fail)
UPDATE "AuditLogs" SET action = 'MODIFIED' WHERE id = 1; -- Error expected
```

---

### 005_materialized_views.sql
**Purpose:** Create pre-computed analytics views for dashboard performance

**Materialized Views Created:**

#### 1. mv_organization_statistics
Organization dashboard metrics (users, documents, activity)

#### 2. mv_document_activity
Document-level activity summary (uploads, approvals, verifications)

#### 3. mv_user_activity
User activity metrics (actions, documents handled, engagement)

#### 4. mv_daily_system_metrics
Daily system-wide statistics

#### 5. mv_verification_metrics
Verification success rates and tamper scores

**Refresh Functions:**
- `refresh_all_materialized_views()` - Refreshes all views
- `refresh_materialized_view(p_view_name)` - Refreshes specific view

**Run Migration:**
```powershell
psql -U postgres -d papdocauthxv2 -f migrations/005_materialized_views.sql
```

**Query Materialized Views:**
```sql
-- Organization statistics
SELECT * FROM mv_organization_statistics ORDER BY total_documents DESC LIMIT 10;

-- Document activity
SELECT * FROM mv_document_activity ORDER BY verification_count DESC LIMIT 10;

-- User activity
SELECT * FROM mv_user_activity ORDER BY total_actions DESC LIMIT 10;

-- Daily metrics (last 30 days)
SELECT * FROM mv_daily_system_metrics ORDER BY activity_date DESC LIMIT 30;

-- Verification metrics
SELECT * FROM mv_verification_metrics ORDER BY verification_date DESC LIMIT 10;
```

**Refresh Views:**
```sql
-- Refresh all views
SELECT * FROM refresh_all_materialized_views();

-- Refresh specific view
SELECT * FROM refresh_materialized_view('mv_organization_statistics');
```

**Check View Sizes:**
```sql
SELECT schemaname, matviewname, pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) AS size
FROM pg_matviews 
WHERE schemaname = 'public';
```

---

## Complete Migration Sequence

### Step 1: Run all migrations in order
```powershell
cd "E:\Lovepreet\Projects\PapDocAuthX\PapDocAuthX-Backend"

# Run migrations
psql -U postgres -d papdocauthxv2 -f migrations/001_add_indexes.sql
psql -U postgres -d papdocauthxv2 -f migrations/002_partition_audit_logs.sql
psql -U postgres -d papdocauthxv2 -f migrations/003_stored_procedures.sql
psql -U postgres -d papdocauthxv2 -f migrations/004_triggers.sql
psql -U postgres -d papdocauthxv2 -f migrations/005_materialized_views.sql
```

### Step 2: Verify all migrations
```sql
-- Check indexes
SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';

-- Check partitions
SELECT COUNT(*) FROM pg_tables WHERE tablename LIKE 'AuditLogs_%';

-- Check functions
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';

-- Check triggers
SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public';

-- Check materialized views
SELECT COUNT(*) FROM pg_matviews WHERE schemaname = 'public';
```

### Step 3: Performance testing
```sql
-- Before/after EXPLAIN ANALYZE comparison
EXPLAIN ANALYZE SELECT * FROM "Users" WHERE "orgId" = 1;
EXPLAIN ANALYZE SELECT * FROM "AuditLogs" WHERE "orgId" = 1 ORDER BY timestamp DESC LIMIT 100;

-- Check index usage statistics
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC 
LIMIT 20;
```

---

## Expected Performance Improvements

| Query Type | Before (ms) | After (ms) | Improvement |
|------------|-------------|------------|-------------|
| User lookup by email | ~50ms | ~2ms | 96% faster |
| Org audit logs (1000 records) | ~200ms | ~20ms | 90% faster |
| Document verification | ~100ms | ~10ms | 90% faster |
| Organization statistics | ~500ms | ~5ms (materialized view) | 99% faster |

---

## Rollback Instructions

### Rollback 005_materialized_views.sql
```sql
DROP MATERIALIZED VIEW IF EXISTS mv_organization_statistics CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_document_activity CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_user_activity CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_daily_system_metrics CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_verification_metrics CASCADE;
DROP FUNCTION IF EXISTS refresh_all_materialized_views() CASCADE;
DROP FUNCTION IF EXISTS refresh_materialized_view(TEXT) CASCADE;
```

### Rollback 004_triggers.sql
```sql
DROP TRIGGER IF EXISTS trigger_users_updated_at ON "Users";
DROP TRIGGER IF EXISTS trigger_organizations_updated_at ON "Organizations";
DROP TRIGGER IF EXISTS trigger_document_workflows_updated_at ON "DocumentWorkflows";
DROP TRIGGER IF EXISTS trigger_auto_audit_workflow ON "DocumentWorkflows";
DROP TRIGGER IF EXISTS trigger_prevent_deletion ON "DocumentWorkflows";
DROP TRIGGER IF EXISTS trigger_validate_email_domain ON "Users";
DROP TRIGGER IF EXISTS trigger_cascade_org_deactivation ON "Organizations";
DROP TRIGGER IF EXISTS trigger_validate_chain ON "AuditLogs";
DROP TRIGGER IF EXISTS trigger_prevent_audit_modification ON "AuditLogs";
DROP TRIGGER IF EXISTS trigger_prevent_audit_deletion ON "AuditLogs";
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS auto_audit_workflow_changes() CASCADE;
DROP FUNCTION IF EXISTS prevent_approved_document_deletion() CASCADE;
DROP FUNCTION IF EXISTS validate_user_email_domain() CASCADE;
DROP FUNCTION IF EXISTS cascade_org_deactivation() CASCADE;
DROP FUNCTION IF EXISTS validate_audit_chain_on_insert() CASCADE;
DROP FUNCTION IF EXISTS prevent_audit_log_modification() CASCADE;
```

### Rollback 003_stored_procedures.sql
```sql
DROP FUNCTION IF EXISTS verify_audit_chain(INTEGER, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS get_org_statistics(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_audit_logs(INTEGER, BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS get_document_version_history(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS calculate_tamper_score(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS bulk_create_users(INTEGER, JSONB) CASCADE;
```

### Rollback 002_partition_audit_logs.sql
```sql
-- Restore from backup
DROP TABLE IF EXISTS "AuditLogs" CASCADE;
CREATE TABLE "AuditLogs" AS SELECT * FROM "AuditLogs_backup";
DROP TABLE IF EXISTS "AuditLogs_backup";
```

### Rollback 001_add_indexes.sql
```sql
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_org_id;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_org_role;
DROP INDEX IF EXISTS idx_organizations_name;
DROP INDEX IF EXISTS idx_organizations_domain;
DROP INDEX IF EXISTS idx_organizations_is_active;
DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_audit_logs_org_id;
DROP INDEX IF EXISTS idx_audit_logs_doc_id;
DROP INDEX IF EXISTS idx_audit_logs_timestamp;
DROP INDEX IF EXISTS idx_audit_logs_action;
DROP INDEX IF EXISTS idx_audit_logs_org_timestamp;
DROP INDEX IF EXISTS idx_audit_logs_user_timestamp;
DROP INDEX IF EXISTS idx_audit_logs_prev_hash;
DROP INDEX IF EXISTS idx_document_workflows_doc_id;
DROP INDEX IF EXISTS idx_document_workflows_org_id;
DROP INDEX IF EXISTS idx_document_workflows_status;
DROP INDEX IF EXISTS idx_document_workflows_assigned_to;
DROP INDEX IF EXISTS idx_document_workflows_org_status;
DROP INDEX IF EXISTS idx_user_roles_user_id;
DROP INDEX IF EXISTS idx_user_roles_role_id;
```

---

## Evidence for ADT Project Submission

### Required Screenshots/Documentation:

1. **Migration Execution Output**
   - Screenshot of successful migration runs
   - PostgreSQL output showing indexes/partitions/functions/triggers created

2. **EXPLAIN ANALYZE Results**
   - Before/after performance comparison
   - Show index usage in execution plans

3. **Index Usage Statistics**
   ```sql
   SELECT * FROM pg_stat_user_indexes ORDER BY idx_scan DESC LIMIT 10;
   ```

4. **Partition Verification**
   - Show partition list and record distribution
   - Demonstrate partition pruning in EXPLAIN ANALYZE

5. **Stored Procedure Execution**
   - Test results from verify_audit_chain()
   - Organization statistics output

6. **Trigger Behavior**
   - Demonstrate auto-update timestamp
   - Show audit log immutability error

7. **Materialized View Performance**
   - Query response times before/after
   - Refresh execution time

---

## Maintenance Schedule

### Daily
- No maintenance required (automatic via triggers)

### Weekly
- Refresh materialized views (if needed for real-time dashboards)
  ```sql
  SELECT * FROM refresh_all_materialized_views();
  ```

### Monthly
- Create next month's audit log partition
  ```sql
  SELECT create_monthly_audit_partition();
  ```
- Analyze table statistics
  ```sql
  ANALYZE "Users";
  ANALYZE "Organizations";
  ANALYZE "AuditLogs";
  ANALYZE "DocumentWorkflows";
  ```

### Quarterly
- Review and drop old partitions (keep 12 months)
  ```sql
  SELECT drop_old_audit_partitions(12);
  ```

---

## Troubleshooting

### Issue: Indexes not being used
**Solution:** Run ANALYZE to update statistics
```sql
ANALYZE "AuditLogs";
```

### Issue: Partition creation fails
**Solution:** Check date range doesn't overlap existing partitions
```sql
SELECT tablename, pg_get_expr(relpartbound, oid, true) 
FROM pg_class 
WHERE relname LIKE 'AuditLogs_%';
```

### Issue: Materialized view out of date
**Solution:** Manually refresh
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_organization_statistics;
```

### Issue: Trigger causing performance issues
**Solution:** Temporarily disable trigger
```sql
ALTER TABLE "AuditLogs" DISABLE TRIGGER trigger_validate_chain;
-- Perform operations
ALTER TABLE "AuditLogs" ENABLE TRIGGER trigger_validate_chain;
```

---

**Migration Completed:** 2025-01-18  
**Database Version:** PostgreSQL 14+  
**Project:** PapDocAuthX v2  
**Author:** Lovepreet Singh
