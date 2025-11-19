import { Router } from "express";
import { verificationController } from "../controllers/verificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Any authenticated user can verify
router.post(
  "/crypto-check",
  authMiddleware,
  verificationController.cryptoCheck
);

export default router;
