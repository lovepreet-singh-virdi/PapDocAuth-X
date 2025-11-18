import { Router } from "express";
import { qrController } from "../controllers/qrController.js";

const router = Router();

// Public QR generation (superadmin or admin can lock it later)
router.get("/generate/:docId", qrController.generate);

export default router;
