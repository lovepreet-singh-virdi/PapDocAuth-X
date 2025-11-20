import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/dbPostgres.js";

export class AccessRequest extends Model {}

AccessRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    organization: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },

    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      field: 'reviewedby',
    },

    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reviewedat',
    },

    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'reviewnotes',
    },
  },
  {
    sequelize,
    modelName: "AccessRequest",
    tableName: "access_requests",
    timestamps: true,
  }
);
