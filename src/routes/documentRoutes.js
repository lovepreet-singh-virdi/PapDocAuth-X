import { Router } from "express";
import { documentController } from "../controllers/documentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";

const router = Router();

// Admin & Superadmin can upload versions
router.post(
  "/upload-version",
  authMiddleware,
  checkRole(["admin", "superadmin"]),
  documentController.uploadVersion
);

export default router;
