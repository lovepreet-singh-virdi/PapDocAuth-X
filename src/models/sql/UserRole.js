import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sql.js";

export const UserRole = sequelize.define(
  "UserRole",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    roleId: { type: DataTypes.INTEGER, allowNull: false }
  },
  {
    tableName: "UserRoles"
  }
);
