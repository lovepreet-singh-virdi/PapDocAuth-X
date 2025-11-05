import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// import uploadRoute from "./routes/upload.js";
// import verifyRoute from "./routes/verify.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(" DB Error:", err));

app.get("/", (req, res) => res.send("PapDocAuth-X API Running"));
// app.use("/api/upload", uploadRoute);
// app.use("/api/verify", verifyRoute);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
