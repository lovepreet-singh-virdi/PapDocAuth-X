import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sql.js";

export const Workflow = sequelize.define(
  "Workflow",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    docId: { type: DataTypes.STRING, allowNull: false },

    fromState: {
      type: DataTypes.STRING,
      allowNull: true,        // OK to be null for first workflow entry
    },

    toState: {
      type: DataTypes.STRING,
      allowNull: false,       // MUST have value
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,        // Admin or system actor
    },

    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Workflows",
  }
);
