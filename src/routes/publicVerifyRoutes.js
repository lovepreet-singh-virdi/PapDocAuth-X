import { Router } from "express";
import { publicVerify } from "../controllers/publicVerifyController.js";

const router = Router();
console.log("in public routes");

// POST /verify - accepts hashes from frontend (no file uploads)
router.post("/verify", publicVerify);

export default router;
