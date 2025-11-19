import express from "express";
import cors from "cors";
import morgan from "morgan";

import { errorHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";
import { env } from "./config/env.js";

const app = express();

// Middleware
app.use(cors({
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: `${env.appName || 'PapDocAuthX'} v${env.appVersion || '2'} backend is running.` 
  });
});

// Mount all routes (currently empty routes/index.js)
app.use("/api", routes);

// Error handler (keep always at end)
app.use(errorHandler);

export default app;
