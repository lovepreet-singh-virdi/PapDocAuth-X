import { Router } from "express";
import { verificationController } from "../controllers/verificationController.qr.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Authenticated QR/manual verification
router.post(
  "/qr-check",
  authMiddleware,
  verificationController.qrCheck
);

export default router;
