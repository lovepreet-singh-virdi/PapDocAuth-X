import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/dbPostgres.js";
import { User } from "./User.js";
import { Role } from "./Role.js";

export class UserRole extends Model {}

UserRole.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "UserRole",
    tableName: "user_roles"
  }
);

// associations
UserRole.belongsTo(User, { foreignKey: "userId" });
UserRole.belongsTo(Role, { foreignKey: "roleId" });

User.hasMany(UserRole, { foreignKey: "userId" });
Role.hasMany(UserRole, { foreignKey: "roleId" });
