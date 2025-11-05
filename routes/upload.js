import express from "express";
import multer from "multer";
import { extractText } from "../utils/ocrUtil.js";
import { generateSHA256 } from "../utils/hashUtil.js";
import Document from "../models/document.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
    try {
        const text = await extractText(req.file.path);
        const hash = generateSHA256(text);
        const doc = new Document({ filename: req.file.originalname, textHash: hash, ocrExtract: text });
        await doc.save();
        res.json({ message: "File uploaded & hashed", hash });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
