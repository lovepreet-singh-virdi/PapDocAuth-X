import { Router } from "express";
import { qrController } from "../controllers/qrController.js";

const router = Router();

router.get("/generate/:docId", qrController.generate);

export default router;
