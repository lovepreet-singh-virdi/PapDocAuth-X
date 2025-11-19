import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../config/dbPostgres.js";

export class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("superadmin", "admin", "user"),
      allowNull: false,
    },

    orgId: {
      type: DataTypes.INTEGER,
      allowNull: true, // superadmin has no org
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  }
);
