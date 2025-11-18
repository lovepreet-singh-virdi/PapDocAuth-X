
import { User } from "./User.js";
import { Role } from "./Role.js";
import { UserRole } from "./UserRole.js";
import { AuditLog } from "./AuditLog.js";
import { Workflow } from "./Workflow.js";
import { VerificationStat } from "./VerificationStat.js";
import { Revocation } from "./Revocation.js";
import { RefreshToken } from "./RefreshToken.js";


// ============ Associations ============

RefreshToken.belongsTo(User, { foreignKey: "userId" });
User.hasMany(RefreshToken, { foreignKey: "userId" });

// User <-> Role (Many-to-Many)
User.belongsToMany(Role, { through: UserRole, foreignKey: "userId" });
Role.belongsToMany(User, { through: UserRole, foreignKey: "roleId" });

UserRole.belongsTo(User, { foreignKey: "userId" });
UserRole.belongsTo(Role, { foreignKey: "roleId" });


// User -> Audit Logs (One-to-Many)
User.hasMany(AuditLog, { foreignKey: "userId" });
AuditLog.belongsTo(User, { foreignKey: "userId" });

// User -> Workflow (One-to-Many)
User.hasMany(Workflow, { foreignKey: "userId" });
Workflow.belongsTo(User, { foreignKey: "userId" });

// Document (by docId string) referenced indirectly


export {
  User, Role, UserRole,
  AuditLog, Workflow,
  VerificationStat, Revocation,
  RefreshToken
};
