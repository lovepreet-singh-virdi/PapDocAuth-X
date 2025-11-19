import mongoose from "mongoose";

const HashPartSchema = new mongoose.Schema(
  {
    docId: { type: String, required: true },
    versionNumber: { type: Number, required: true },

    textHash: { type: String, default: "" },
    imageHash: { type: String, default: "" },
    signatureHash: { type: String, default: "" },
    stampHash: { type: String, default: "" },

    ownerOrgId: { type: Number, required: true },
    createdByUserId: { type: Number, required: true },
  },
  { timestamps: true }
);

export const HashPart = mongoose.model("HashPart", HashPartSchema);
