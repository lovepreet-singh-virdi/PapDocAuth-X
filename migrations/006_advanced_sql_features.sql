-- ============================================================================
-- Migration 006: Advanced SQL Features
-- ============================================================================
-- Purpose: Demonstrate window functions, recursive CTEs, and advanced analytics
-- Author: Lovepreet Singh
-- Date: 2025-11-19
-- Database: PostgreSQL 14+
-- ============================================================================

-- ============================================================================
-- SECTION 1: WINDOW FUNCTIONS
-- ============================================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_user_activity_ranking(INTEGER);
DROP FUNCTION IF EXISTS get_document_verification_trends();
DROP FUNCTION IF EXISTS get_organization_growth_metrics();

-- -----------------------------------------------------------------------------
-- Function 1: User Activity Ranking with Window Functions
-- -----------------------------------------------------------------------------
-- Demonstrates: ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD()
-- Use Case: Identify top performers, detect inactive users, analyze trends
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_activity_ranking(p_org_id INTEGER DEFAULT NULL)
RETURNS TABLE (
    user_id INTEGER,
    full_name VARCHAR,
    org_name VARCHAR,
    total_actions BIGINT,
    row_num BIGINT,              -- Sequential ranking (no gaps)
    rank_position BIGINT,        -- Ranking with gaps for ties
    dense_rank_position BIGINT,  -- Ranking without gaps
    actions_vs_previous BIGINT,  -- Difference from previous user
    actions_vs_next BIGINT,      -- Difference from next user
    percentile_rank DOUBLE PRECISION  -- Percentile (0.0 to 1.0)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH user_activity AS (
        SELECT 
            u.id::INTEGER AS user_id,
            u."fullName" AS full_name,
            o.name AS org_name,
            COUNT(a.id) AS total_actions
        FROM users u
        LEFT JOIN organizations o ON u."orgId" = o.id
        LEFT JOIN audit_logs a ON u.id = a."userId"
        WHERE 
            (p_org_id IS NULL OR u."orgId" = p_org_id)
            AND u.role != 'superadmin'  -- Exclude superadmins from ranking
        GROUP BY u.id, u."fullName", o.name
    )
    SELECT 
        ua.user_id,
        ua.full_name,
        ua.org_name,
        ua.total_actions,
        ROW_NUMBER() OVER (ORDER BY ua.total_actions DESC) AS row_num,
        RANK() OVER (ORDER BY ua.total_actions DESC) AS rank_position,
        DENSE_RANK() OVER (ORDER BY ua.total_actions DESC) AS dense_rank_position,
        ua.total_actions - LAG(ua.total_actions, 1, 0) OVER (ORDER BY ua.total_actions DESC) AS actions_vs_previous,
        ua.total_actions - LEAD(ua.total_actions, 1, 0) OVER (ORDER BY ua.total_actions DESC) AS actions_vs_next,
        PERCENT_RANK() OVER (ORDER BY ua.total_actions) AS percentile_rank
    FROM user_activity ua
    ORDER BY ua.total_actions DESC;
END;
$$;

COMMENT ON FUNCTION get_user_activity_ranking IS 'Returns user activity rankings using window functions (ROW_NUMBER, RANK, LAG, LEAD, PERCENT_RANK)';

-- -----------------------------------------------------------------------------
-- Function 2: Document Verification Trends with Moving Averages
-- -----------------------------------------------------------------------------
-- Demonstrates: Window functions with ROWS BETWEEN for rolling calculations
-- Use Case: Detect verification spikes, identify trends over time
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_document_verification_trends()
RETURNS TABLE (
    verification_date DATE,
    daily_verifications BIGINT,
    running_total NUMERIC,
    moving_avg_7day NUMERIC(10,2),
    moving_avg_30day NUMERIC(10,2),
    max_verifications_to_date BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH daily_counts AS (
        SELECT 
            DATE(timestamp) AS verification_date,
            COUNT(*) AS daily_verifications
        FROM audit_logs
        WHERE action = 'VERIFY_DOCUMENT'
        GROUP BY DATE(timestamp)
    )
    SELECT 
        dc.verification_date,
        dc.daily_verifications,
        SUM(dc.daily_verifications) OVER (ORDER BY dc.verification_date) AS running_total,
        AVG(dc.daily_verifications) OVER (
            ORDER BY dc.verification_date 
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        )::NUMERIC(10,2) AS moving_avg_7day,
        AVG(dc.daily_verifications) OVER (
            ORDER BY dc.verification_date 
            ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
        )::NUMERIC(10,2) AS moving_avg_30day,
        MAX(dc.daily_verifications) OVER (ORDER BY dc.verification_date) AS max_verifications_to_date
    FROM daily_counts dc
    ORDER BY dc.verification_date DESC;
END;
$$;

COMMENT ON FUNCTION get_document_verification_trends IS 'Returns verification trends with 7-day and 30-day moving averages';

-- ============================================================================
-- SECTION 2: RECURSIVE CTEs
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Function 3: Organization Hierarchy Traversal (Recursive CTE)
-- -----------------------------------------------------------------------------
-- Demonstrates: Recursive Common Table Expressions
-- Use Case: Navigate organization hierarchies, department trees
-- -----------------------------------------------------------------------------
-- Note: Current schema doesn't have parent_org_id, so we'll create a sample structure

-- Create a sample organizational hierarchy table
CREATE TABLE IF NOT EXISTS org_hierarchy (
    org_id INTEGER PRIMARY KEY,
    parent_org_id INTEGER REFERENCES org_hierarchy(org_id),
    org_name VARCHAR(255) NOT NULL,
    level_type VARCHAR(50)  -- ROOT, DIVISION, DEPARTMENT, TEAM
);

-- Insert sample hierarchy
INSERT INTO org_hierarchy (org_id, parent_org_id, org_name, level_type) VALUES
    (1, NULL, 'Global Corporation', 'ROOT'),
    (2, 1, 'North America Division', 'DIVISION'),
    (3, 1, 'Europe Division', 'DIVISION'),
    (4, 2, 'Engineering Department', 'DEPARTMENT'),
    (5, 2, 'Sales Department', 'DEPARTMENT'),
    (6, 4, 'Backend Team', 'TEAM'),
    (7, 4, 'Frontend Team', 'TEAM'),
    (8, 3, 'Marketing Department', 'DEPARTMENT')
ON CONFLICT (org_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Recursive CTE Function: Get all descendants of an organization
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_org_descendants(p_org_id INTEGER)
RETURNS TABLE (
    org_id INTEGER,
    org_name VARCHAR,
    level_type VARCHAR,
    depth INTEGER,
    path TEXT  -- Hierarchical path (e.g., "Global Corp > NA Division > Engineering")
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE org_tree AS (
        -- Base case: Starting organization
        SELECT 
            oh.org_id,
            oh.org_name,
            oh.level_type,
            0 AS depth,
            oh.org_name::TEXT AS path
        FROM org_hierarchy oh
        WHERE oh.org_id = p_org_id
        
        UNION ALL
        
        -- Recursive case: Children of current level
        SELECT 
            oh.org_id,
            oh.org_name,
            oh.level_type,
            ot.depth + 1,
            (ot.path || ' > ' || oh.org_name)::TEXT
        FROM org_hierarchy oh
        INNER JOIN org_tree ot ON oh.parent_org_id = ot.org_id
    )
    SELECT * FROM org_tree ORDER BY depth, org_name;
END;
$$;

COMMENT ON FUNCTION get_org_descendants IS 'Recursively retrieves all descendant organizations using CTE';

-- -----------------------------------------------------------------------------
-- Recursive CTE Function: Audit Chain Verification with Recursion
-- -----------------------------------------------------------------------------
-- Demonstrates: Recursive validation of hash chains
-- Use Case: Verify entire audit chain integrity from root to leaf
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION verify_audit_chain_recursive(p_doc_id VARCHAR DEFAULT NULL)
RETURNS TABLE (
    audit_id INTEGER,
    action VARCHAR,
    audit_timestamp TIMESTAMPTZ,
    chain_depth INTEGER,
    is_hash_valid BOOLEAN,
    hash_path TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE audit_chain AS (
        -- Base case: First audit log (no previous hash)
        SELECT 
            a.id::INTEGER AS audit_id,
            a.action,
            a.timestamp AS audit_timestamp,
            1 AS chain_depth,
            (a."prevAuditHash" IS NULL OR a."prevAuditHash" = '') AS is_hash_valid,
            a."auditHash"::TEXT AS hash_path
        FROM audit_logs a
        WHERE 
            (p_doc_id IS NULL OR a."docId" = p_doc_id)
            AND (a."prevAuditHash" IS NULL OR a."prevAuditHash" = '')
        
        UNION ALL
        
        -- Recursive case: Next audit logs in the chain
        SELECT 
            a.id::INTEGER,
            a.action,
            a.timestamp AS audit_timestamp,
            ac.chain_depth + 1,
            (a."prevAuditHash" = ac.hash_path::VARCHAR) AS is_hash_valid,
            a."auditHash"::TEXT
        FROM audit_logs a
        INNER JOIN audit_chain ac ON a."prevAuditHash" = ac.hash_path::VARCHAR
        WHERE p_doc_id IS NULL OR a."docId" = p_doc_id
    )
    SELECT * FROM audit_chain ORDER BY chain_depth;
END;
$$;

COMMENT ON FUNCTION verify_audit_chain_recursive IS 'Recursively verifies audit chain integrity using CTE';

-- ============================================================================
-- SECTION 3: ADVANCED ANALYTICS WITH WINDOW FUNCTIONS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Function 4: Organization Growth Metrics with NTH_VALUE and FIRST_VALUE
-- -----------------------------------------------------------------------------
-- Demonstrates: FIRST_VALUE(), LAST_VALUE(), NTH_VALUE()
-- Use Case: Compare current metrics to first/last/specific historical values
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_organization_growth_metrics()
RETURNS TABLE (
    org_id INTEGER,
    org_name VARCHAR,
    metric_month DATE,
    monthly_documents INTEGER,
    first_month_docs INTEGER,      -- Documents in first month
    last_month_docs INTEGER,        -- Documents in most recent month
    growth_vs_first_month NUMERIC(10,2),  -- % growth from first month
    month_rank INTEGER              -- Ranking of this month's performance
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH monthly_org_docs AS (
        SELECT 
            o.id::INTEGER AS org_id,
            o.name AS org_name,
            DATE_TRUNC('month', a.timestamp)::DATE AS metric_month,
            COUNT(DISTINCT a."docId")::INTEGER AS monthly_documents
        FROM organizations o
        LEFT JOIN audit_logs a ON o.id = a."orgId"
        WHERE a.action = 'UPLOAD_VERSION'
        GROUP BY o.id, o.name, DATE_TRUNC('month', a.timestamp)
    )
    SELECT 
        mod.org_id,
        mod.org_name,
        mod.metric_month,
        mod.monthly_documents,
        FIRST_VALUE(mod.monthly_documents) OVER (
            PARTITION BY mod.org_id 
            ORDER BY mod.metric_month
        )::INTEGER AS first_month_docs,
        LAST_VALUE(mod.monthly_documents) OVER (
            PARTITION BY mod.org_id 
            ORDER BY mod.metric_month
            ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
        )::INTEGER AS last_month_docs,
        CASE 
            WHEN FIRST_VALUE(mod.monthly_documents) OVER (
                PARTITION BY mod.org_id ORDER BY mod.metric_month
            ) = 0 THEN 0
            ELSE (
                (mod.monthly_documents::NUMERIC - FIRST_VALUE(mod.monthly_documents) OVER (
                    PARTITION BY mod.org_id ORDER BY mod.metric_month
                )) / FIRST_VALUE(mod.monthly_documents) OVER (
                    PARTITION BY mod.org_id ORDER BY mod.metric_month
                ) * 100
            )::NUMERIC(10,2)
        END AS growth_vs_first_month,
        RANK() OVER (PARTITION BY mod.org_id ORDER BY mod.monthly_documents DESC)::INTEGER AS month_rank
    FROM monthly_org_docs mod
    ORDER BY mod.org_id, mod.metric_month DESC;
END;
$$;

COMMENT ON FUNCTION get_organization_growth_metrics IS 'Calculates organization growth using FIRST_VALUE, LAST_VALUE window functions';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test window functions
SELECT * FROM get_user_activity_ranking() LIMIT 10;

-- Test verification trends
SELECT * FROM get_document_verification_trends() LIMIT 30;

-- Test recursive CTE (organization hierarchy)
SELECT * FROM get_org_descendants(1);

-- Test recursive audit chain verification
SELECT * FROM verify_audit_chain_recursive();

-- Test growth metrics
SELECT * FROM get_organization_growth_metrics() LIMIT 20;

-- ============================================================================
-- ROLLBACK SCRIPT
-- ============================================================================
/*
DROP FUNCTION IF EXISTS get_user_activity_ranking(INTEGER);
DROP FUNCTION IF EXISTS get_document_verification_trends();
DROP FUNCTION IF EXISTS get_org_descendants(INTEGER);
DROP FUNCTION IF EXISTS verify_audit_chain_recursive(VARCHAR);
DROP FUNCTION IF EXISTS get_organization_growth_metrics();
DROP TABLE IF EXISTS org_hierarchy CASCADE;
*/
