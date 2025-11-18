import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { connectMongo } from "./config/mongo.js";
import { connectSQL } from "./config/sql.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";
import revocationRoutes from "./routes/revocationRoutes.js";
import qrRoutes from "./routes/qrRoutes.js";

//middlewares
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API routes
app.use("/api/auth", authRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/verify", verificationRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/revoke", revocationRoutes);
app.use("/api/qr", qrRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("PapDocAuthX+ backend server running...");
});

async function startServer() {
  await connectMongo();
  await connectSQL();

  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

startServer();
