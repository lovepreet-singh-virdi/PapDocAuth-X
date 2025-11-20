import { Router } from "express";
import { orgController } from "../controllers/orgController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";
import { validateOrganizationCreation, validateUserRegistration, validateIdParam, validatePagination } from "../middleware/validationMiddleware.js";
import { USER_ROLES } from "../constants/enums.js";

const router = Router();

// SUPERADMIN ONLY ROUTES

// Get all organizations (superadmin only)
router.get(
  "/",
  authMiddleware,
  checkRole([USER_ROLES.SUPERADMIN]),
  validatePagination,
  orgController.getAllOrgs
);

// Get organization admins (superadmin only)
router.get(
  "/:orgId/admins",
  authMiddleware,
  checkRole([USER_ROLES.SUPERADMIN]),
  validateIdParam('orgId'),
  validatePagination,
  orgController.getOrgAdmins
);

// Get all users in organization (admin/superadmin)
router.get(
  "/:orgId/users",
  authMiddleware,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN]),
  validateIdParam('orgId'),
  validatePagination,
  orgController.getOrgUsers
);

// Create organization
router.post(
  "/",
  authMiddleware,
  checkRole([USER_ROLES.SUPERADMIN]),
  validateOrganizationCreation,
  orgController.createOrg
);

// Create organization admin
router.post(
  "/:orgId/admins",
  authMiddleware,
  checkRole([USER_ROLES.SUPERADMIN]),
  validateIdParam('orgId'),
  validateUserRegistration,
  orgController.createOrgAdmin
);

// Create organization verifier (admin can create in their org, superadmin in any org)
router.post(
  "/:orgId/users",
  authMiddleware,
  checkRole([USER_ROLES.ADMIN, USER_ROLES.SUPERADMIN]),
  validateIdParam('orgId'),
  validateUserRegistration,
  orgController.createOrgVerifier
);

export default router;
