import { Router } from "express";
import { qrController } from "../controllers/qrController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";

const router = Router();

// Only admin and superadmin can generate QR codes
router.get(
  "/generate/:docId",
  authMiddleware,
  checkRole(["admin", "superadmin"]),
  qrController.generate
);

export default router;
