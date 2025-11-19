-- Add indexes to improve query performance
-- Based on ADT course Week 8 lecture on database optimization

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users("orgId");
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Organizations table indexes  
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);

-- Audit logs indexes (most queries filter by these)
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs("userId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs("orgId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_doc_id ON audit_logs("docId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_timestamp ON audit_logs("orgId", timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs("userId", timestamp DESC);

-- Hash index for prevHash lookups (faster for equality)
CREATE INDEX IF NOT EXISTS idx_audit_logs_prev_hash ON audit_logs USING HASH ("prevAuditHash");

-- Document workflows indexes
CREATE INDEX IF NOT EXISTS idx_document_workflows_doc_id ON document_workflow("docId");
CREATE INDEX IF NOT EXISTS idx_document_workflows_status ON document_workflow(status);
CREATE INDEX IF NOT EXISTS idx_document_workflows_doc_status ON document_workflow("docId", status);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles("userId");
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles("roleId");

-- Update table statistics
ANALYZE users;
ANALYZE organizations;
ANALYZE audit_logs;
ANALYZE document_workflow;
