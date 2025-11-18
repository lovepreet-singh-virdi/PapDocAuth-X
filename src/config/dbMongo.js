import mongoose from "mongoose";
import { env } from "./env.js";

export const connectMongo = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("🔗 MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};
