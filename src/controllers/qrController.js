import { generateQrPayload, generateQrImage } from "../services/qrService.js";

export const qrController = {
  generate: async (req, res, next) => {
    try {
      const { docId } = req.params;

      const payload = await generateQrPayload(docId);
      if (!payload) {
        return res.status(404).json({
          success: false,
          error: "Document or approved version not found"
        });
      }

      const qrDataUrl = await generateQrImage(payload);
      const qrValue = `papdocauthx://${payload.docId}/${payload.versionHash}`;

      res.json({
        success: true,
        docId,
        qrValue,
        versionHash: payload.versionHash,
        qrDataUrl,       // base64 image
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });
    } catch (err) {
      next(err);
    }
  }
};
