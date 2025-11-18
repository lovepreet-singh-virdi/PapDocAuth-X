import { Document } from "../models/mongo/Document.js";
import { DocumentVersion } from "../models/mongo/DocumentVersion.js";

export const publicVerifyController = {
  verify: async (req, res, next) => {
    try {
      const { docId, versionHash } = req.query;

      if (!docId || !versionHash) {
        return res.status(400).json({
          success: false,
          error: "docId and versionHash are required"
        });
      }

      const doc = await Document.findOne({ docId });
      if (!doc) {
        return res.status(404).json({
          success: false,
          error: "Document not found"
        });
      }

      const version = await DocumentVersion.findOne({
        docId,
        versionHash
      });

      if (!version) {
        return res.json({
          success: true,
          isAuthenticCryptographically: false,
          isApprovedByAuthority: false,
          isRevoked: false,
          workflowStatus: "UNKNOWN"
        });
      }

      const isRevoked = version.workflowStatus === "REVOKED";

      res.json({
        success: true,
        docId,
        versionNumber: version.versionNumber,
        isAuthenticCryptographically: true,
        isApprovedByAuthority: version.workflowStatus === "APPROVED",
        isRevoked,
        workflowStatus: version.workflowStatus
      });
    } catch (err) {
      next(err);
    }
  }
};
