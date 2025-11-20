import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/dbPostgres.js";

export class DocumentWorkflow extends Model {}

DocumentWorkflow.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    docId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    versionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("APPROVED", "REVOKED", "PENDING"),
      allowNull: false,
    },

    changedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    changedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "DocumentWorkflow",
    tableName: "document_workflow",
  }
);
