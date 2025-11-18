import { Sequelize } from "sequelize";
import { env } from "./env.js";

export const sequelize = new Sequelize(
  env.SQL_DB,
  env.SQL_USER,
  env.SQL_PASS,
  {
    host: env.SQL_HOST,
    port: env.SQL_PORT,
    dialect: env.SQL_DIALECT,
    logging: false
  }
);

export async function connectSQL() {
  try {
    await sequelize.authenticate();
    console.log("[PostgreSQL] Connected");
  } catch (err) {
    console.error("[PostgreSQL] Connection Error:", err.message);
    process.exit(1);
  }
}
