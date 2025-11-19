import QRCode from "qrcode";
import { Document } from "../models/mongo/Document.js";
import { DocumentVersion } from "../models/mongo/DocumentVersion.js";

export async function generateQrPayload(docId) {
  const doc = await Document.findOne({ docId });

  if (!doc) return null;

  const latest = await DocumentVersion.findOne({
    docId,
    workflowStatus: "APPROVED"
  }).sort({ versionNumber: -1 });

  if (!latest) return null;

  // Payload that will be encoded in the QR
  return {
    docId,
    versionNumber: latest.versionNumber,
    versionHash: latest.versionHash,
    approved: true
  };
}

export async function generateQrImage(payload) {
  const jsonString = JSON.stringify(payload);
  return QRCode.toDataURL(jsonString);
}
