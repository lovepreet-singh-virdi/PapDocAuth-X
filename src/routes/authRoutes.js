import { Router } from "express";
import { authController } from "../controllers/authController.js";

const router = Router();

// POST /api/auth/register-superadmin
router.post("/register-superadmin", authController.registerSuperadmin);

// POST /api/auth/login
router.post("/login", authController.login);

export default router;
