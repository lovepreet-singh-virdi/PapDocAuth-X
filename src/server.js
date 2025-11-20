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

  // Schema management: We use explicit migrations instead of sequelize.sync
  // to avoid conflicts with materialized views, partitions, and other advanced
  // DB features. For fresh setup, run: node scripts/drop-mv-run-seed-recreate.js
  console.log("Database connections established. Using migrations for schema management.");

  app.listen(env.port, () => {
    console.log(`${env.appName} v${env.appVersion} server running on port ${env.port}`);
  });
};
startServer();
