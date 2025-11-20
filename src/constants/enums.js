/**
 * Application-wide enums and constants
 * These match the database schema exactly
 */

// User Roles (matches SQL User model)
export const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  VERIFIER: 'verifier',
};

// Document Workflow Status (matches MongoDB DocumentVersion model)
export const WORKFLOW_STATUS = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REVOKED: 'REVOKED',
};

// Audit Log Actions (matches SQL AuditLog model)
export const AUDIT_ACTIONS = {
  UPLOAD: 'UPLOAD',
  APPROVE: 'APPROVE',
  REVOKE: 'REVOKE',
  CRYPTO_CHECK: 'CRYPTO_CHECK',
  VERIFIED: 'VERIFIED',
};

// Organization Types (freeform but common values)
export const ORG_TYPES = {
  ENTERPRISE: 'Enterprise',
  GOVERNMENT: 'Government',
  UNIVERSITY: 'University',
  ORGANIZATION: 'organization',
};

export default {
  USER_ROLES,
  WORKFLOW_STATUS,
  AUDIT_ACTIONS,
  ORG_TYPES,
};
