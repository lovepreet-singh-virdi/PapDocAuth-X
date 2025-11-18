import { Router } from "express";
import { workflowController } from "../controllers/workflowController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/change-state", authMiddleware, workflowController.changeState);

export default router;
