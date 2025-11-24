import { sqlAnalyticsService } from "./sqlAnalyticsService.js";
import { Document } from "../models/mongo/Document.js";
import { DocumentVersion } from "../models/mongo/DocumentVersion.js";

export const analyticsService = {
  summary: async () => {
    // Get global document stats across all organizations
    const totalDocs = await Document.countDocuments();

    const docsByStatus = await DocumentVersion.aggregate([
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

    // Get user stats
    const [totalUsers, usersByRole, usersByOrg] = await Promise.all([
      sqlAnalyticsService.totalUsers(),
      sqlAnalyticsService.usersByRole(),
      sqlAnalyticsService.usersByOrganization()
    ]);

    // Get last 5 days throughput data
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const recentDocs = await DocumentVersion.aggregate([
      { $match: { createdAt: { $gte: fiveDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            status: '$workflowStatus'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last5Days = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];

      const dayDocs = recentDocs.filter(d => d._id.date === dateStr);
      last5Days.push({
        name: dayName,
        approved: dayDocs.find(d => d._id.status === 'APPROVED')?.count || 0,
        pending: dayDocs.find(d => d._id.status === 'PENDING')?.count || 0
      });
    }

    return {
      totalDocuments: totalDocs,
      approved: statusMap.approved || 0,
      pending: statusMap.pending || 0,
      revoked: statusMap.revoked || 0,
      totalUsers,
      usersByRole,
      usersByOrg,
      throughputData: last5Days,
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
  },
  userSummary: async (userId) => {
    // Get document stats for a specific user (createdByUserId)
    const totalDocs = await DocumentVersion.countDocuments({ createdByUserId: userId });

    const docsByStatus = await DocumentVersion.aggregate([
      { $match: { createdByUserId: userId } },
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

    // Get last 5 days throughput data for this user
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const recentDocs = await DocumentVersion.aggregate([
      { $match: { createdByUserId: userId, createdAt: { $gte: fiveDaysAgo } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            status: '$workflowStatus'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last5Days = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];
      const dayDocs = recentDocs.filter(d => d._id.date === dateStr);
      last5Days.push({
        name: dayName,
        approved: dayDocs.find(d => d._id.status === 'APPROVED')?.count || 0,
        pending: dayDocs.find(d => d._id.status === 'PENDING')?.count || 0,
        revoked: dayDocs.find(d => d._id.status === 'REVOKED')?.count || 0
      });
    }

    return {
      totalDocuments: totalDocs,
      approved: statusMap.approved || 0,
      pending: statusMap.pending || 0,
      revoked: statusMap.revoked || 0,
      throughputData: last5Days,
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
      {
        $match: {
          'document.ownerOrgId': orgId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
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

    // Get last 5 days for throughput chart
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const recentDocs = await DocumentVersion.aggregate([
      {
        $lookup: {
          from: 'documents',
          localField: 'docId',
          foreignField: 'docId',
          as: 'document'
        }
      },
      { $unwind: '$document' },
      {
        $match: {
          'document.ownerOrgId': orgId,
          createdAt: { $gte: fiveDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            status: '$workflowStatus'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Format for last 5 days throughput
    const last5Days = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];

      const dayDocs = recentDocs.filter(d => d._id.date === dateStr);
      last5Days.push({
        name: dayName,
        approved: dayDocs.find(d => d._id.status === 'APPROVED')?.count || 0,
        pending: dayDocs.find(d => d._id.status === 'PENDING')?.count || 0
      });
    }

    return {
      totalDocuments: totalDocs,
      approved: statusMap.approved || 0,
      pending: statusMap.pending || 0,
      revoked: statusMap.revoked || 0,
      throughputData: last5Days,
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
  ,
  publicSummary: async () => {
    // Minimal, non-sensitive aggregated metrics for public pages
    const totalDocs = await Document.countDocuments();

    const docsByStatus = await DocumentVersion.aggregate([
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

    return {
      totalDocuments: totalDocs,
      approved: statusMap.approved || 0,
      pending: statusMap.pending || 0,
      revoked: statusMap.revoked || 0
    };
  }
};
