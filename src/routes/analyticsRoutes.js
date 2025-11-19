import { Router } from "express";
import { analyticsController } from "../controllers/analyticsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";

const router = Router();

// Admin and superadmin can view analytics
router.get(
  "/summary",
  authMiddleware,
  checkRole(["admin", "superadmin"]),
  analyticsController.summary
);

export default router;
