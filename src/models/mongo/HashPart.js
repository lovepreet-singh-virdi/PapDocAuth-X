import mongoose from "mongoose";

const HashPartSchema = new mongoose.Schema(
  {
    versionId: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentVersion", required: true },

    textHash: { type: String, required: true },
    imageHash: { type: String, required: true },
    signatureHash: { type: String, required: true },
    stampHash: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("HashPart", HashPartSchema);
