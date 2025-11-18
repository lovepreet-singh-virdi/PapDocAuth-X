import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    docId: { type: String, required: true, unique: true },

    // relational reference to SQL users
    ownerUserId: { type: Number, required: true },

    type: { type: String, required: true },  // degree, transcript, id-card, etc.

    currentVersion: { type: Number, default: 1 },

    metadata: {
      fileType: { type: String },
      pageCount: { type: Number },
      sizeInKB: { type: Number },
      mimeType: { type: String }
    },

    currentState: {
      type: String,
      default: "UPLOADED"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Document", DocumentSchema);
