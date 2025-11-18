import QRCode from "qrcode";
import  DocumentVersion from "../models/mongo/DocumentVersion.js";
import { env } from "../config/env.js";

export async function generateQRCode(docId) {
  const version = await DocumentVersion.findOne({ docId })
    .sort({ versionNumber: -1 });

  if (!version) throw new Error("Document not found");

  const payload = {
    docId,
    version: version.versionNumber,
    merkleRoot: version.merkleRoot,
    url: `${env.FRONTEND_URL}/verify/${docId}`
  };

  return await QRCode.toDataURL(JSON.stringify(payload));
}
