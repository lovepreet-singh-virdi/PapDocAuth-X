import { Router } from "express";
import { documentController } from "../controllers/documentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";
import { validateDocumentUpload, validateDocIdParam, validatePagination } from "../middleware/validationMiddleware.js";

const router = Router();

// Get all documents (org-filtered, read-only for verifiers)
router.get(
  "/",
  authMiddleware,
  checkRole(["admin", "superadmin", "verifier"]),
  validatePagination,
  documentController.getAllDocuments
);

// Get document details (read-only for verifiers)
router.get(
  "/:docId",
  authMiddleware,
  checkRole(["admin", "superadmin", "verifier"]),
  validateDocIdParam,
  documentController.getDetails
);

// Get document versions (read-only for verifiers)
router.get(
  "/:docId/versions",
  authMiddleware,
  checkRole(["admin", "superadmin", "verifier"]),
  validateDocIdParam,
  documentController.getVersions
);

// Admin & Superadmin can upload versions
router.post(
  "/upload-version",
  authMiddleware,
  checkRole(["admin", "superadmin"]),
  validateDocumentUpload,
  documentController.uploadVersion
);

export default router;
