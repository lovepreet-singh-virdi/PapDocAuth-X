-- Materialized views for dashboard analytics
-- Based on ADT performance optimization lectures

-- Organization statistics view
CREATE MATERIALIZED VIEW mv_org_stats AS
SELECT 
    o.id,
    o.name,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT a."docId") as total_documents,
    COUNT(a.id) as total_audit_logs,
    MAX(a.timestamp) as last_activity
FROM organizations o
LEFT JOIN users u ON u."orgId" = o.id
LEFT JOIN audit_logs a ON a."orgId" = o.id
GROUP BY o.id, o.name;

CREATE UNIQUE INDEX idx_mv_org_stats_id ON mv_org_stats(id);

-- Document activity view
CREATE MATERIALIZED VIEW mv_document_activity AS
SELECT 
    "docId",
    "orgId",
    COUNT(*) as action_count,
    MAX(timestamp) as last_action,
    MIN(timestamp) as first_action
FROM audit_logs
WHERE "docId" IS NOT NULL
GROUP BY "docId", "orgId";

CREATE UNIQUE INDEX idx_mv_doc_activity_doc ON mv_document_activity("docId");

-- User activity view
CREATE MATERIALIZED VIEW mv_user_activity AS
SELECT 
    u.id,
    u."fullName",
    u."orgId",
    COUNT(a.id) as total_actions,
    COUNT(DISTINCT a."docId") as documents_handled,
    MAX(a.timestamp) as last_action
FROM users u
LEFT JOIN audit_logs a ON a."userId" = u.id
GROUP BY u.id, u."fullName", u."orgId";

CREATE UNIQUE INDEX idx_mv_user_activity_id ON mv_user_activity(id);

-- Function to refresh all views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_org_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_document_activity;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_activity;
END;
$$ LANGUAGE plpgsql;
