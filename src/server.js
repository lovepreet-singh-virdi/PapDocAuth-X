import app from "./app.js";
import { connectMongo } from "./config/dbMongo.js";
import { connectPostgres, sequelize } from "./config/dbPostgres.js";
import { env } from "./config/env.js";

// SQL models
import "./models/sql/index.js";

// Mongo models
import "./models/mongo/index.js";

const startServer = async () => {
  await connectMongo();
  await connectPostgres();

  // Sync SQL tables (dev only)
  await sequelize.sync({ alter: true });
  console.log("SQL tables synchronized");

  app.listen(env.port, () => {
    console.log(`${env.appName} v${env.appVersion} server running on port ${env.port}`);
  });
};
startServer();
