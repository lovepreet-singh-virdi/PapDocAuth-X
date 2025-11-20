import { Router } from "express";
import { revocationController } from "../controllers/revocationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";

const router = Router();

// Revoke a specific document version (admin/superadmin only)
router.post(
	"/revoke",
	authMiddleware,
	checkRole(["admin", "superadmin"]),
	revocationController.revokeVersion
);

// Get revocation status for a document (admin/superadmin)
router.get(
	"/:documentId",
	authMiddleware,
	checkRole(["admin", "superadmin"]),
	revocationController.getStatus
);

export default router;

