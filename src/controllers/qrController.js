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

      res.json({
        success: true,
        docId,
        payload,
        qrDataUrl       // base64 image
      });
    } catch (err) {
      next(err);
    }
  }
};
