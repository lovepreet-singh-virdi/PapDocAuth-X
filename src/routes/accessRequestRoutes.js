import { Router } from "express";
import { accessRequestController } from "../controllers/accessRequestController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkRole } from "../middleware/checkRole.js";
import { body, query } from "express-validator";
import { validate } from "../middleware/validationMiddleware.js";
import { USER_ROLES } from "../constants/enums.js";

const router = Router();

// Public route - submit access request
router.post(
  "/submit",
  [
    body("name")
      .trim()
      .notEmpty().withMessage("Name is required")
      .isLength({ min: 2, max: 255 }).withMessage("Name must be 2-255 characters"),
    
    body("organization")
      .trim()
      .notEmpty().withMessage("Organization name is required")
      .isLength({ min: 2, max: 255 }).withMessage("Organization name must be 2-255 characters"),
    
    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Must be a valid email address")
      .normalizeEmail(),
    
    body("message")
      .optional()
      .trim()
      .isLength({ max: 2000 }).withMessage("Message must not exceed 2000 characters"),
    
    validate,
  ],
  accessRequestController.submitRequest
);

// Superadmin routes
router.get(
  "/",
  authMiddleware,
  checkRole([USER_ROLES.SUPERADMIN]),
  [
    query("status")
      .optional()
      .isIn(["all", "pending", "approved", "rejected"]).withMessage("Invalid status filter"),
    validate,
  ],
  accessRequestController.getAllRequests
);

router.patch(
  "/:id/status",
  authMiddleware,
  checkRole([USER_ROLES.SUPERADMIN]),
  [
    body("status")
      .notEmpty().withMessage("Status is required")
      .isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected"),
    
    body("reviewNotes")
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage("Review notes must not exceed 1000 characters"),
    
    validate,
  ],
  accessRequestController.updateStatus
);

export default router;
