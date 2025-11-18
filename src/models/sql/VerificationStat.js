import { DataTypes } from "sequelize";
import { sequelize } from "../../config/sql.js";

export const VerificationStat = sequelize.define(
  "VerificationStat",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    docId: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },

    totalVerifications: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0 
    },

    avgTamperScore: { 
      type: DataTypes.FLOAT, 
      defaultValue: 0 
    },

    lastVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "VerificationStats",
  }
);
