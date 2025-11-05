import express from "express";
import multer from "multer";
import { extractText } from "../utils/ocrUtil.js";
import { generateSHA256 } from "../utils/hashUtil.js";
import Document from "../models/document.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
    try {
        const text = await extractText(req.file.path);
        const hash = generateSHA256(text);
        const match = await Document.findOne({ textHash: hash });
        res.json({
            status: match ? "Authentic Document" : "Modified / Unknown Document",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Verification Error" });
    }
});

export default router;
