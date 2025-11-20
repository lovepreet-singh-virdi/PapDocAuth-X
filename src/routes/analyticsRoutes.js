import { Router } from "express";
import { analyticsController } from "../controllers/analyticsController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";

const router = Router();

// Public summary for landing page (non-sensitive aggregated counts)
router.get("/public-summary", analyticsController.publicSummary);

// Admin and superadmin can view detailed analytics
router.get(
  "/summary",
  authMiddleware,
  checkRole(["admin", "superadmin"]),
  analyticsController.summary
);

export default router;
