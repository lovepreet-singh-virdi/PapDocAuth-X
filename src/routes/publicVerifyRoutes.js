import { Router } from "express";
import { publicVerifyController } from "../controllers/publicVerifyController.js";

const router = Router();

router.get("/verify", publicVerifyController.verify);

export default router;
