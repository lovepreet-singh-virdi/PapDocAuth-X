import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    docId: { type: String, required: true, unique: true },

    type: { type: String, required: true }, // degree, offer_letter, etc.

    ownerOrgId: { type: Number, required: true }, // SQL organization ID

    currentVersion: { type: Number, default: 0 },

    metadata: {
      fileType: String,
      pageCount: Number,
      sizeInKB: Number,
      mimeType: String,
    },

    versionHashChain: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

export const Document = mongoose.model("Document", DocumentSchema);
