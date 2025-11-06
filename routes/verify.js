import express from "express";
import multer from "multer";
import { extractText } from "../utils/ocrUtil.js";
import { generateSHA256 } from "../utils/hashUtil.js";
import Document from "../models/document.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
    try {
        console.log("Uploaded file:", req.file);
        const verifiedBy = req.body.verifiedBy || "anonymous";

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        const text = await extractText(req.file.path);
        const hash = generateSHA256(text);
        const match = await Document.findOne({ textHash: hash });
        if (match) {
            const now = new Date();
            const updated = await Document.findOneAndUpdate(
                { textHash: hash },
                { $set: { lastVerifiedBy: verifiedBy, lastVerifiedAt: now } },
                { new: true, projection: { _id: 0, textHash: 1, lastVerifiedBy: 1, lastVerifiedAt: 1 } }
            );
            return res.json({
                status: "Authentic Document",
                hash: updated?.textHash || hash,
                lastVerifiedBy: updated?.lastVerifiedBy || verifiedBy,
                lastVerifiedAt: updated?.lastVerifiedAt || now
            });
        }
        return res.json({
            status: "Modified / Unknown Document"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Verification Error" });
    }
});

export default router;
