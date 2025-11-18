import { Router } from "express";
import { orgController } from "../controllers/orgController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";

const router = Router();

// SUPERADMIN ONLY ROUTES
router.post(
  "/",
  authMiddleware,
  checkRole(["superadmin"]),
  orgController.createOrg
);

router.post(
  "/:orgId/admins",
  authMiddleware,
  checkRole(["superadmin"]),
  orgController.createOrgAdmin
);

export default router;
