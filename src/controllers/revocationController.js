import { revokeDocument, checkRevocation } from "../services/revocationService.js";

export const revocationController = {
  revoke: async (req, res) => {
    try {
      const { userId } = req.user;
      const { docId, version, reason } = req.body;

      const result = await revokeDocument({
        docId,
        version,
        userId,
        reason
      });

      res.json({ message: "Document revoked", result });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  status: async (req, res) => {
    try {
      const { docId } = req.params;
      const result = await checkRevocation(docId);

      res.json({ revoked: !!result, details: result });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
