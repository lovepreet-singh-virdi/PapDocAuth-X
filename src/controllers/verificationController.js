import { verifyDocument } from "../services/verificationService.js";

export const verificationController = {
  verify: async (req, res) => {
    try {
      const { userId } = req.user;

      const { docId, hashes } = req.body;

      const result = await verifyDocument({
        docId,
        userId,
        hashes
      });

      res.json({
        message: "Verification completed",
        result
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
