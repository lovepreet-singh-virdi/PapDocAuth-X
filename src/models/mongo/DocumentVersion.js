import mongoose from "mongoose";

const DocumentVersionSchema = new mongoose.Schema(
  {
    docId: { type: String, required: true }, // matches Document.docId

    versionNumber: { type: Number, required: true },

    merkleRoot: { type: String, required: true },

    prevVersionHash: { type: String, default: null },

    versionHash: { type: String, required: true },

    workflowStatus: {
      type: String,
      enum: ["APPROVED", "PENDING", "REVOKED"],
      default: "APPROVED",
    },

    createdByUserId: { type: Number, required: true }, // SQL User ID

    ownerOrgId: { type: Number, required: true }, // SQL Org ID
  },
  { timestamps: true }
);

export const DocumentVersion = mongoose.model(
  "DocumentVersion",
  DocumentVersionSchema
);
