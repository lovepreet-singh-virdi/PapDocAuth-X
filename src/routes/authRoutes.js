import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";
import { validateUserRegistration, validateUserLogin, validatePagination } from "../middleware/validationMiddleware.js";

const router = Router();

// POST /api/auth/register-superadmin
router.post("/register-superadmin", validateUserRegistration, authController.registerSuperadmin);

// POST /api/auth/login
router.post("/login", validateUserLogin, authController.login);

// GET /api/auth/superadmin-status (check if superadmin exists)
router.get("/superadmin-status", authController.checkSuperadminStatus);

// GET /api/auth/users (superadmin only - get all users)
router.get("/users", authMiddleware, checkRole(['superadmin']), validatePagination, authController.getAllUsers);

export default router;
