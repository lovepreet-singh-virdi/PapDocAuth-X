import {registerDocumentVersion } from "../services/documentService.js";
export const documentController = {
  uploadVersion: async (req, res) => {
    try {
      const { userId } = req.user;
console.log("insideuploadVersion ")
      const {
        docId,
        type,
        metadata,
        hashes
      } = req.body;

      const parsedMetadata = typeof metadata === "string"
        ? JSON.parse(metadata)
        : metadata || {};

      const parsedHashes = typeof hashes === "string"
        ? JSON.parse(hashes)
        : hashes || {};

      const result = await registerDocumentVersion({
        userId,
        docId,
        type,
        metadata: parsedMetadata,
        hashes: parsedHashes
      });

      return res.json({
        message: "Version stored",
        result
      });

    } catch (err) {
      console.error(err);
      return res.status(400).json({ error: err.message });
    }
  }
};
