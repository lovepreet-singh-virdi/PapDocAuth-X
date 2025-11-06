import express from "express";
import multer from "multer";
import { extractText } from "../utils/ocrUtil.js";
import { generateSHA256 } from "../utils/hashUtil.js";
import Document from "../models/document.js";

const router = express.Router();

//"Multer for image-only verification
const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed for verification"));
        }
        cb(null, true);
    }
});

router.post("/", upload.single("file"), async (req, res) => {
    try {
        console.log("Verifying file:", req.file);

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Extract text from image
        const text = await extractText(req.file.path);
        const hash = generateSHA256(text);

        // Find document in DB by text hash
        const found = await Document.findOne({ textHash: hash });

        if (found) {
            res.status(200).json({
                status: "Authentic Document",
                file: req.file.originalname,
                matchedWith: found.filename
            });
        } else {
            res.status(200).json({
                status: "Modified or Unknown Document",
                file: req.file.originalname
            });
        }

    } catch (error) {
        console.error("Verification Error:", error.message);

        if (error.message.includes("Only image files")) {
            return res.status(400).json({ error: error.message });
        }
        if (error.message.includes("Error attempting to read image")) {
            return res.status(400).json({ error: "Error reading image — please upload a clear JPG or PNG" });
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
