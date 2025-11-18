import { Router } from "express";
import { documentController } from "../controllers/documentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/upload-version",
  authMiddleware,
  checkRole(["admin", "user"]),
  documentController.uploadVersion
);

export default router;
