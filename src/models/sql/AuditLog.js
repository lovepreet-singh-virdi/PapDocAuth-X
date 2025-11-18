import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sql.js";

export const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    docId: { type: DataTypes.STRING, allowNull: false },

    action: { type: DataTypes.STRING, allowNull: false }, // REGISTER / VERIFY / STATE_CHANGE
    status: { type: DataTypes.STRING, defaultValue: "SUCCESS" },

    reason: { type: DataTypes.TEXT },    // optional

    prevAuditHash: { type: DataTypes.TEXT }, 
    auditHash: { type: DataTypes.TEXT, allowNull: false },

    merkleRootAtTime: { type: DataTypes.STRING }
  },
  { timestamps: true }
);
