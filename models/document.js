import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  filename: String,
  textHash: String,
  ocrExtract: String,
  uploadDate: { type: Date, default: Date.now },
  lastVerifiedBy: { type: String },
  lastVerifiedAt: { type: Date },
});

export default mongoose.model("Document", documentSchema);
