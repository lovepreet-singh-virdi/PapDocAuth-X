import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sql.js";

export const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    token: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
    revoked: { type: DataTypes.BOOLEAN, defaultValue: false }
  },
  { tableName: "RefreshTokens" }
);
