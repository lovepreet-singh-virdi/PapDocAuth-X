import { Sequelize } from "sequelize";
import { env } from "./env.js";

export const sequelize = new Sequelize(
  env.postgres.database,
  env.postgres.user,
  env.postgres.password,
  {
    host: env.postgres.host,
    port: env.postgres.port,
    dialect: "postgres",
    logging: false, // disable SQL logs; you can turn on later for debugging
  }
);

export const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected");
  } catch (err) {
    console.error("PostgreSQL connection error:", err);
    process.exit(1);
  }
};
