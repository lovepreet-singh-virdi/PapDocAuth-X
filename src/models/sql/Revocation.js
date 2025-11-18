import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sql.js";

export const Revocation = sequelize.define(
  "Revocation",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    docId: { type: DataTypes.STRING, allowNull: false },
    version: { type: DataTypes.INTEGER, allowNull: false },

    reason: { type: DataTypes.TEXT },
    revokedByUserId: { type: DataTypes.INTEGER },

    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  },
  { timestamps: true }
);
