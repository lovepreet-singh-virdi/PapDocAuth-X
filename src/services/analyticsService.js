import { sqlAnalyticsService } from "./sqlAnalyticsService.js";
import { mongoAnalyticsService } from "./mongoAnalyticsService.js";

export const analyticsService = {
  summary: async () => {
    const [
      totalUsers,
      usersByRole,
      usersByOrg,
      totalDocs,
      docsByOrg,
      versionCounts,
      revoked,
      active
    ] = await Promise.all([
      sqlAnalyticsService.totalUsers(),
      sqlAnalyticsService.usersByRole(),
      sqlAnalyticsService.usersByOrganization(),
      mongoAnalyticsService.totalDocuments(),
      mongoAnalyticsService.docsByOrg(),
      mongoAnalyticsService.versionCounts(),
      mongoAnalyticsService.revokedDocuments(),
      mongoAnalyticsService.activeDocuments()
    ]);

    return {
      sql: {
        totalUsers,
        usersByRole,
        usersByOrg
      },
      mongo: {
        totalDocs,
        docsByOrg,
        versionCounts,
        active,
        revoked
      }
    };
  }
};
