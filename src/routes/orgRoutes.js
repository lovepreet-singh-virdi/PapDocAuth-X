import { Router } from "express";
import { orgController } from "../controllers/orgController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";
import { validateOrganizationCreation, validateUserRegistration, validateIdParam, validatePagination } from "../middleware/validationMiddleware.js";

const router = Router();

// SUPERADMIN ONLY ROUTES

// Get all organizations (superadmin only)
router.get(
  "/",
  authMiddleware,
  checkRole(["superadmin"]),
  validatePagination,
  orgController.getAllOrgs
);

// Get organization admins (superadmin only)
router.get(
  "/:orgId/admins",
  authMiddleware,
  checkRole(["superadmin"]),
  validateIdParam('orgId'),
  validatePagination,
  orgController.getOrgAdmins
);

// Get all users in organization (admin/superadmin)
router.get(
  "/:orgId/users",
  authMiddleware,
  checkRole(["admin", "superadmin"]),
  validateIdParam('orgId'),
  validatePagination,
  orgController.getOrgUsers
);

// Create organization
router.post(
  "/",
  authMiddleware,
  checkRole(["superadmin"]),
  validateOrganizationCreation,
  orgController.createOrg
);

// Create organization admin
router.post(
  "/:orgId/admins",
  authMiddleware,
  checkRole(["superadmin"]),
  validateIdParam('orgId'),
  validateUserRegistration,
  orgController.createOrgAdmin
);

export default router;
