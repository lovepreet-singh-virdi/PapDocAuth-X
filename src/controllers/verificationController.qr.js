import { verifyDocumentVersionHash } from "../services/verificationService.qr.js";

export const verificationController = {
  // ...existing code...

  qrCheck: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const orgId = req.user.orgId;
      const { docId, versionHash } = req.body;

      if (!docId || !versionHash) {
        return res.status(400).json({
          success: false,
          error: "docId and versionHash are required"
        });
      }

      const result = await verifyDocumentVersionHash({
        userId,
        orgId,
        docId,
        versionHash
      });

      res.json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }
};
