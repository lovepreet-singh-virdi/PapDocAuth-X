import { generateQRCode } from "../services/qrService.js";

export const qrController = {
  generate: async (req, res) => {
    try {
      const { docId } = req.params;
      const qr = await generateQRCode(docId);

      res.json({ qr });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
