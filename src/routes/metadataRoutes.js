import { Router } from "express";
import { getDocumentTypes } from "../controllers/metadataController.js";

const router = Router();

// Public endpoint - no auth required
router.get("/document-types", getDocumentTypes);

export default router;
