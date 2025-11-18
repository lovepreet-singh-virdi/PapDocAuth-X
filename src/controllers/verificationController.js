import { verifyDocument } from "../services/verificationService.js";

export const verificationController = {
  cryptoCheck: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const orgId = req.user.orgId;

      const { docId, hashes } = req.body;

      if (!docId || !hashes) {
        return res.status(400).json({
          success: false,
          error: "docId and hashes are required"
        });
      }

      const result = await verifyDocument({
        userId,
        orgId,
        docId,
        hashes
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
