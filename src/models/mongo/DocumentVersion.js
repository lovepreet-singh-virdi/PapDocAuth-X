import mongoose from "mongoose";

const DocumentVersionSchema = new mongoose.Schema(
  {
    docId: { type: String, required: true },

    versionNumber: { type: Number, required: true },

    // full-document hash
    versionHash: { type: String, required: true },

    // hash of hashParts → content integrity
    merkleRoot: { type: String, required: true },

    metadata: {
      fileType: { type: String },
      pageCount: { type: Number },
      sizeInKB: { type: Number },
      mimeType: { type: String }
    }
  },
  { timestamps: true }
);

export default mongoose.model("DocumentVersion", DocumentVersionSchema);
