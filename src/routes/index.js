import { Router } from "express";

import authRoutes from "./authRoutes.js";
import orgRoutes from "./orgRoutes.js";
import documentRoutes from "./documentRoutes.js";
import verificationRoutes from "./verificationRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/orgs", orgRoutes);
router.use("/documents", documentRoutes);
router.use("/verification", verificationRoutes);

export default router;
