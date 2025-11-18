import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/dbPostgres.js";

export class Organization extends Model {}

Organization.init(
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

    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    type: {
      type: DataTypes.STRING, // e.g., "university", "company"
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Organization",
    tableName: "organizations",
  }
);
