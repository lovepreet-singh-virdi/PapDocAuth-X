import mongoose from "mongoose";

const HashPartSchema = new mongoose.Schema(
  {
    docId: { type: String, required: true },
    versionNumber: { type: Number, required: true },

    textHash: { type: String, required: true },
    imageHash: { type: String, required: true },
    signatureHash: { type: String, required: true },
    stampHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const HashPart = mongoose.model("HashPart", HashPartSchema);
