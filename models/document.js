import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  filename: String,
  textHash: String,
  ocrExtract: String,
  uploadDate: { type: Date, default: Date.now },
});

export default mongoose.model("Document", documentSchema);
