import { User } from "./User.js";
import { Organization } from "./Organization.js";
import { AuditLog } from "./AuditLog.js";
import { DocumentWorkflow } from "./DocumentWorkflow.js";
import { Role } from "./Role.js";
import { UserRole } from "./UserRole.js";
import { AccessRequest } from "./AccessRequest.js";


// User belongs to organization
User.belongsTo(Organization, { foreignKey: "orgId", as: "organization" });

// Organization has many users
Organization.hasMany(User, { foreignKey: "orgId", as: "users" });

// AuditLog relationships
AuditLog.belongsTo(User, { foreignKey: "userId", as: "user" });
AuditLog.belongsTo(Organization, { foreignKey: "orgId", as: "organization" });

// User has many audit logs
User.hasMany(AuditLog, { foreignKey: "userId", as: "auditLogs" });

// Organization has many audit logs
Organization.hasMany(AuditLog, { foreignKey: "orgId", as: "auditLogs" });

// Workflow relationships
DocumentWorkflow.belongsTo(User, { foreignKey: "changedByUserId", as: "changedBy" });
User.hasMany(DocumentWorkflow, { foreignKey: "changedByUserId", as: "workflowChanges" });

// AccessRequest relationships
AccessRequest.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });
User.hasMany(AccessRequest, { foreignKey: "reviewedBy", as: "reviewedRequests" });

export {
  User,
  Organization,
  AuditLog,
  DocumentWorkflow, 
  Role, 
  UserRole,
  AccessRequest,
};

