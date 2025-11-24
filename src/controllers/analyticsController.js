
import { analyticsService } from "../services/analyticsService.js";
import { USER_ROLES } from "../constants/enums.js";

export const analyticsController = {
  userSummary: async (req, res, next) => {
    try {
      const { id, userId } = req.user;
      // Support both id and userId for compatibility
      const actualUserId = id || userId;
      if (!actualUserId) {
        return res.status(400).json({ success: false, error: 'User ID missing in request' });
      }
      const result = await analyticsService.userSummary(actualUserId);
      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  summary: async (req, res, next) => {
    try {
      const { role, orgId } = req.user;

      // Superadmin gets global analytics
      if (role === USER_ROLES.SUPERADMIN) {
        const result = await analyticsService.summary();
        return res.json({ success: true, data: result });
      }

      // Admin gets org-scoped analytics
      if (role === USER_ROLES.ADMIN) {
        const result = await analyticsService.orgSummary(orgId);
        return res.json({ success: true, data: result });
      }

      // Other roles not authorized
      return res.status(403).json({
        success: false,
        error: "Only admin and superadmin can access analytics"
      });
    } catch (err) {
      next(err);
    }
  }
  ,
  publicSummary: async (req, res, next) => {
    try {
      // Return only non-sensitive aggregated metrics suitable for public landing page
      const result = await analyticsService.publicSummary();
      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
};
