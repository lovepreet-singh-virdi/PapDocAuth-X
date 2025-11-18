import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sql.js";

export const Role = sequelize.define(
  "Role",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, unique: true, allowNull: false }
  },
  {
    tableName: "Roles"
  }
);
