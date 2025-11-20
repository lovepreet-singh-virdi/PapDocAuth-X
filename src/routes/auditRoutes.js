import { Router } from "express";
import { auditController } from "../controllers/auditController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";
import { USER_ROLES } from "../constants/enums.js";

const router = Router();

// All audit routes require authentication
router.use(authMiddleware);

// GET /api/audit/all - Get all audit logs (superadmin only)
router.get(
  "/all",
  checkRole([USER_ROLES.SUPERADMIN]),
  auditController.getAll
);

// GET /api/audit/org/:orgId - Get audit logs for organization (admin/superadmin)
router.get(
  "/org/:orgId",
  checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN]),
  auditController.getByOrg
);

// GET /api/audit/document/:docId - Get audit logs for specific document (admin/superadmin)
router.get(
  "/document/:docId",
  checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN]),
  auditController.getByDocument
);

// GET /api/audit/verify/:orgId/:docId - Verify audit chain integrity (admin/superadmin)
router.get(
  "/verify/:orgId/:docId",
  checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN]),
  auditController.verifyChain
);

export default router;
