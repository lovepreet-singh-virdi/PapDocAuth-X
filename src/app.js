import express from "express";
import cors from "cors";
import morgan from "morgan";

import { errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PapDocAuthX v2 backend is running." });
});

// Mount all routes (currently empty routes/index.js)
app.use("/api", routes);

// Error handler (keep always at end)
app.use(errorHandler);

export default app;
