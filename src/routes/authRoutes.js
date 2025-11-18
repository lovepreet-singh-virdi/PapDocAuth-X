import { Router } from "express";
import { authController } from "../controllers/authController.js";

const router = Router();
console.log("hello")
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;
