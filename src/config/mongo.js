import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectMongo() {
  try {
    await mongoose.connect(env.MONGO_URI, {
      dbName: "papdocauthx"
    });
    console.log("[MongoDB] Connected");
  } catch (err) {
    console.error("[MongoDB] Connection Error:", err.message);
    process.exit(1);
  }
}
