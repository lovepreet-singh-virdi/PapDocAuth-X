-- Add indexes to improve query performance
-- Based on ADT course Week 8 lecture on database optimization

-- Users table indexes
CREATE INDEX idx_users_email ON "Users"(email);
CREATE INDEX idx_users_org_id ON "Users"("orgId");
CREATE INDEX idx_users_role ON "Users"(role);

-- Organizations table indexes  
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_organizations_name ON "Organizations" USING GIN (name gin_trgm_ops);
CREATE INDEX idx_organizations_domain ON "Organizations"(domain);
CREATE INDEX idx_organizations_is_active ON "Organizations"("isActive");

-- Audit logs indexes (most queries filter by these)
CREATE INDEX idx_audit_logs_user_id ON "AuditLogs"("userId");
CREATE INDEX idx_audit_logs_org_id ON "AuditLogs"("orgId");
CREATE INDEX idx_audit_logs_doc_id ON "AuditLogs"("docId");
CREATE INDEX idx_audit_logs_timestamp ON "AuditLogs"(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON "AuditLogs"(action);

-- Composite indexes for common queries
CREATE INDEX idx_audit_logs_org_timestamp ON "AuditLogs"("orgId", timestamp DESC);
CREATE INDEX idx_audit_logs_user_timestamp ON "AuditLogs"("userId", timestamp DESC);

-- Hash index for prevHash lookups (faster for equality)
CREATE INDEX idx_audit_logs_prev_hash ON "AuditLogs" USING HASH ("prevHash");

-- Document workflows indexes
CREATE INDEX idx_document_workflows_doc_id ON "DocumentWorkflows"("docId");
CREATE INDEX idx_document_workflows_org_id ON "DocumentWorkflows"("orgId");
CREATE INDEX idx_document_workflows_status ON "DocumentWorkflows"(status);
CREATE INDEX idx_document_workflows_org_status ON "DocumentWorkflows"("orgId", status);

-- User roles indexes
CREATE INDEX idx_user_roles_user_id ON "UserRoles"("userId");
CREATE INDEX idx_user_roles_role_id ON "UserRoles"("roleId");

-- Update table statistics
ANALYZE "Users";
ANALYZE "Organizations";
ANALYZE "AuditLogs";
ANALYZE "DocumentWorkflows";
