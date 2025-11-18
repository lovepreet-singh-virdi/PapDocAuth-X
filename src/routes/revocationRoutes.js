import { Router } from "express";
import { revocationController } from "../controllers/revocationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/revoke",
    authMiddleware,
    checkRole("admin"),
    revocationController.revoke
);
router.get("/status/:docId", revocationController.status);

export default router;
