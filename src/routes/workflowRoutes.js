import { Router } from "express";
import { workflowController } from "../controllers/workflowController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";

const router = Router();

// All workflow routes require admin or superadmin
router.use(authMiddleware);
router.use(checkRole(["admin", "superadmin"]));

// POST /api/workflow/change-state - Change document state
router.post("/change-state", workflowController.changeState);

// GET /api/workflow/:documentId - Get workflow history
router.get("/:documentId", workflowController.getHistory);

export default router;
