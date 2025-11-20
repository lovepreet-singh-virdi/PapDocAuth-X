import { Router } from "express";

import authRoutes from "./authRoutes.js";
import orgRoutes from "./orgRoutes.js";
import documentRoutes from "./documentRoutes.js";
import verificationRoutes from "./verificationRoutes.js";
import qrRoutes from "./qrRoutes.js";
import publicVerifyRoutes from "./publicVerifyRoutes.js";
import revocationRoutes from "./revocationRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import auditRoutes from "./auditRoutes.js";
import workflowRoutes from "./workflowRoutes.js";
import metadataRoutes from "./metadataRoutes.js";
import accessRequestRoutes from "./accessRequestRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/orgs", orgRoutes);
router.use("/documents", documentRoutes);
router.use("/verification", verificationRoutes);
router.use("/qr", qrRoutes);
router.use("/public", publicVerifyRoutes);
router.use("/revocation", revocationRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/audit", auditRoutes);
router.use("/workflow", workflowRoutes);
router.use("/metadata", metadataRoutes);
router.use("/access-requests", accessRequestRoutes);

export default router;
