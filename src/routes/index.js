import { Router } from "express";
import authRoutes from "./authRoutes.js";
import orgRoutes from "./orgRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/orgs", orgRoutes);

export default router;
