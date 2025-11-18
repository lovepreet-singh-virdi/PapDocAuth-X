import { Router } from "express";

import authRoutes from "./authRoutes.js";
import orgRoutes from "./orgRoutes.js";
import documentRoutes from "./documentRoutes.js";
import verificationRoutes from "./verificationRoutes.js";
import qrRoutes from "./qrRoutes.js";
import publicVerifyRoutes from "./publicVerifyRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/orgs", orgRoutes);
router.use("/documents", documentRoutes);
router.use("/verification", verificationRoutes);
router.use("/qr", qrRoutes);
router.use("/public", publicVerifyRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
