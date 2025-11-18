import { Router } from "express";
import { analyticsController } from "../controllers/analyticsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/summary", authMiddleware, analyticsController.summary);

export default router;
