import { User } from "./User.js";
import { Organization } from "./Organization.js";
import { AuditLog } from "./AuditLog.js";
import { DocumentWorkflow } from "./DocumentWorkflow.js";
import { Role } from "./Role.js";
import { UserRole } from "./UserRole.js";


// User belongs to organization
User.belongsTo(Organization, { foreignKey: "orgId", as: "organization" });

// Organization has many users
Organization.hasMany(User, { foreignKey: "orgId" });

// AuditLog relationships
AuditLog.belongsTo(User, { foreignKey: "userId" });
AuditLog.belongsTo(Organization, { foreignKey: "orgId" });

// Workflow relationships
DocumentWorkflow.belongsTo(User, { foreignKey: "changedByUserId" });

export {
  User,
  Organization,
  AuditLog,
  DocumentWorkflow, Role, UserRole
};

