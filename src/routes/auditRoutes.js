import { Router } from "express";
import { auditController } from "../controllers/auditController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";

const router = Router();

// All audit routes require authentication
router.use(authMiddleware);

// GET /api/audit/all - Get all audit logs (superadmin only)
router.get(
  "/all",
  checkRole(["superadmin"]),
  auditController.getAll
);

// GET /api/audit/org/:orgId - Get audit logs for organization (admin/superadmin)
router.get(
  "/org/:orgId",
  checkRole(["admin", "superadmin"]),
  auditController.getByOrg
);

// GET /api/audit/document/:docId - Get audit logs for specific document (admin/superadmin)
router.get(
  "/document/:docId",
  checkRole(["admin", "superadmin"]),
  auditController.getByDocument
);

// GET /api/audit/verify/:orgId/:docId - Verify audit chain integrity (admin/superadmin)
router.get(
  "/verify/:orgId/:docId",
  checkRole(["admin", "superadmin"]),
  auditController.verifyChain
);

export default router;
