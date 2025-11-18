import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sql.js";

export const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    publicKey: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: "Users" }
);
