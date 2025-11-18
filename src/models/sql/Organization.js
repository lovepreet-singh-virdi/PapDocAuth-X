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
      unique: true,
    },

    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    type: {
      type: DataTypes.STRING, // "university" | "company"
      allowNull: false,
      defaultValue: "organization",
    },
  },
  {
    sequelize,
    modelName: "Organization",
    tableName: "organizations",

    hooks: {
      beforeValidate: (org) => {
        if (org.name && !org.slug) {
          org.slug = org.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");
        }

        if (!org.type) {
          org.type = "organization";
        }
      },
    },
  }
);
