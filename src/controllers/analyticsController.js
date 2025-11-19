import { analyticsService } from "../services/analyticsService.js";

export const analyticsController = {
  summary: async (req, res, next) => {
    try {
      const { role, orgId } = req.user;

      // Superadmin gets global analytics
      if (role === "superadmin") {
        const result = await analyticsService.summary();
        return res.json({ success: true, data: result });
      }

      // Admin gets org-scoped analytics
      if (role === "admin") {
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
};
