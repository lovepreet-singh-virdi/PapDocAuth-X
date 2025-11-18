import { Router } from "express";
import { verificationController } from "../controllers/verificationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/verify",
    authMiddleware,
    checkRole("verifier"),
    verificationController.verify
);

export default router;
