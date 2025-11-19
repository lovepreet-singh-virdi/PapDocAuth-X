import { sqlAnalyticsService } from "./sqlAnalyticsService.js";
import { mongoAnalyticsService } from "./mongoAnalyticsService.js";
import { Document } from "../models/mongo/Document.js";
import { DocumentVersion } from "../models/mongo/DocumentVersion.js";

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
  },

  orgSummary: async (orgId) => {
    // Get org-specific document stats
    const totalDocs = await Document.countDocuments({ ownerOrgId: orgId });
    
    const docsByStatus = await DocumentVersion.aggregate([
      {
        $lookup: {
          from: 'documents',
          localField: 'docId',
          foreignField: 'docId',
          as: 'document'
        }
      },
      { $unwind: '$document' },
      { $match: { 'document.ownerOrgId': orgId } },
      {
        $group: {
          _id: '$workflowStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusMap = docsByStatus.reduce((acc, item) => {
      acc[item._id.toLowerCase()] = item.count;
      return acc;
    }, {});

    // Get documents grouped by day for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const docsByDay = await DocumentVersion.aggregate([
      {
        $lookup: {
          from: 'documents',
          localField: 'docId',
          foreignField: 'docId',
          as: 'document'
        }
      },
      { $unwind: '$document' },
      { $match: { 
        'document.ownerOrgId': orgId,
        createdAt: { $gte: sevenDaysAgo }
      }},
      {
        $group: {
          _id: {
            day: { $dayOfWeek: '$createdAt' },
            status: '$workflowStatus'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.day': 1 } }
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const throughputData = dayNames.map((name, index) => {
      const dayData = docsByDay.filter(d => d._id.day === index + 1);
      return {
        name,
        approved: dayData.find(d => d._id.status === 'APPROVED')?.count || 0,
        pending: dayData.find(d => d._id.status === 'PENDING')?.count || 0,
        revoked: dayData.find(d => d._id.status === 'REVOKED')?.count || 0
      };
    });

    return {
      totalDocuments: totalDocs,
      approved: statusMap.approved || 0,
      pending: statusMap.pending || 0,
      revoked: statusMap.revoked || 0,
      throughputData,
      pieData: [
        { 
          name: 'Approved', 
          value: statusMap.approved || 0, 
          percentage: totalDocs ? Math.round((statusMap.approved || 0) / totalDocs * 100) : 0 
        },
        { 
          name: 'Pending', 
          value: statusMap.pending || 0,
          percentage: totalDocs ? Math.round((statusMap.pending || 0) / totalDocs * 100) : 0
        },
        { 
          name: 'Revoked', 
          value: statusMap.revoked || 0,
          percentage: totalDocs ? Math.round((statusMap.revoked || 0) / totalDocs * 100) : 0
        }
      ]
    };
  }
};
