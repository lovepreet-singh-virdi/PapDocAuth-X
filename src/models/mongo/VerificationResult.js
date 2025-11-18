import mongoose from "mongoose";

const VerificationResultSchema = new mongoose.Schema(
  {
    docId: { type: String, required: true },
    result: { type: String, required: true }, // verified, failed, tampered
    checkedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("VerificationResult", VerificationResultSchema);
