-- Stored procedures for common database operations
-- Created based on ADT project requirements

-- Function to verify audit log chain integrity
CREATE OR REPLACE FUNCTION verify_audit_chain(p_org_id INTEGER, p_doc_id VARCHAR)
RETURNS TABLE(is_valid BOOLEAN, message TEXT) AS $$
DECLARE
    v_broken_count INTEGER := 0;
BEGIN
    -- Check for broken hash chains
    SELECT COUNT(*) INTO v_broken_count
    FROM "AuditLogs" a1
    LEFT JOIN "AuditLogs" a2 ON a1."prevHash" = a2."currentHash"
    WHERE a1."prevHash" IS NOT NULL 
      AND a1."prevHash" != '0'
      AND a2."currentHash" IS NULL
      AND (p_org_id IS NULL OR a1."orgId" = p_org_id)
      AND (p_doc_id IS NULL OR a1."docId" = p_doc_id);
    
    IF v_broken_count = 0 THEN
        RETURN QUERY SELECT TRUE, 'Audit chain is valid'::TEXT;
    ELSE
        RETURN QUERY SELECT FALSE, ('Found ' || v_broken_count || ' broken chain links')::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get organization statistics
CREATE OR REPLACE FUNCTION get_org_stats(p_org_id INTEGER)
RETURNS TABLE(
    total_users BIGINT,
    total_documents BIGINT,
    total_audit_logs BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM "Users" WHERE "orgId" = p_org_id),
        (SELECT COUNT(DISTINCT "docId") FROM "AuditLogs" WHERE "orgId" = p_org_id),
        (SELECT COUNT(*) FROM "AuditLogs" WHERE "orgId" = p_org_id);
END;
$$ LANGUAGE plpgsql;

-- Function to get document version history
CREATE OR REPLACE FUNCTION get_document_history(p_doc_id VARCHAR)
RETURNS TABLE(
    action VARCHAR,
    performed_by VARCHAR,
    timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.action,
        u.fullName,
        a.timestamp
    FROM "AuditLogs" a
    LEFT JOIN "Users" u ON a."userId" = u.id
    WHERE a."docId" = p_doc_id
    ORDER BY a.timestamp ASC;
END;
$$ LANGUAGE plpgsql;
