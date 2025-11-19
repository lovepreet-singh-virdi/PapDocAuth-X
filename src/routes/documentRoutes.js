import { Router } from "express";
import { documentController } from "../controllers/documentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";

const router = Router();

// Get all documents (org-filtered)
router.get(
  "/",
  authMiddleware,
  checkRole(["admin", "superadmin"]),
  documentController.getAllDocuments
);

// Get document details
router.get(
  "/:docId",
  authMiddleware,
  checkRole(["admin", "superadmin"]),
  documentController.getDetails
);

// Get document versions
router.get(
  "/:docId/versions",
  authMiddleware,
  checkRole(["admin", "superadmin"]),
  documentController.getVersions
);

// Admin & Superadmin can upload versions
router.post(
  "/upload-version",
  authMiddleware,
  checkRole(["admin", "superadmin"]),
  documentController.uploadVersion
);

export default router;
