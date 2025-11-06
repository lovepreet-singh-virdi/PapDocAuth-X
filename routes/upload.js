import express from "express";
import multer from "multer";
import { extractText } from "../utils/ocrUtil.js";
import { generateSHA256 } from "../utils/hashUtil.js";
import Document from "../models/document.js";

const router = express.Router();


// Multer Setup

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

//  Allow only image files
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files (jpg, png, bmp, etc.) are supported for OCR"));
        }
        cb(null, true);
    },
});


// Upload Route

router.post("/", upload.single("file"), async (req, res) => {
    try {
        console.log("Uploaded file:", req.file);

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }


        // OCR Extraction

        const text = await extractText(req.file.path);
        const hash = generateSHA256(text);


        // Save to MongoDB

        const doc = new Document({
            filename: req.file.originalname,
            textHash: hash,
            ocrExtract: text,
        });

        await doc.save();


        // Respond to Client

        res.status(200).json({
            message: "Image uploaded and text hashed successfully",
            file: req.file.originalname,
            hash,
        });

    } catch (error) {
        console.error("Upload Error:", error.message);

        // Handle unsupported file error
        if (error.message.includes("Only image files")) {
            return res.status(400).json({ error: error.message });
        }

        // Handle OCR errors
        if (error.message.includes("Error attempting to read image")) {
            return res.status(400).json({ error: "Error reading image — please use a clear .jpg or .png file" });
        }

        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
