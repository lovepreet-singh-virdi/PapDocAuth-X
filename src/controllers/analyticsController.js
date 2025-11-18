import { analyticsService } from "../services/analyticsService.js";

export const analyticsController = {
  summary: async (req, res, next) => {
    try {
      // Superadmin only
      if (req.user.role !== "superadmin") {
        return res.status(403).json({
          success: false,
          error: "Only superadmin can access analytics"
        });
      }

      const result = await analyticsService.summary();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
};
