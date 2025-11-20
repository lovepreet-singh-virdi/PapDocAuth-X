import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/dbPostgres.js";

export class AuditLog extends Model {}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    orgId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    docId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    action: {
      type: DataTypes.ENUM("UPLOAD", "APPROVE", "REVOKE", "CRYPTO_CHECK", "VERIFIED"),
      allowNull: false,
    },

    prevAuditHash: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    auditHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "AuditLog",
    tableName: "audit_logs",
  }
);
