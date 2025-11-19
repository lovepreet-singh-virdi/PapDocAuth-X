import { 
  getAllAuditLogs, 
  getOrgAuditLogs, 
  getDocumentAuditLogs,
  verifyAuditChain 
} from "../services/auditService.js";
import { User } from "../models/sql/User.js";
import { Organization } from "../models/sql/Organization.js";

export const auditController = {
  /**
   * GET /api/audit/all - Get all audit logs (superadmin only)
   */
  getAll: async (req, res, next) => {
    try {
      if (req.user.role !== "superadmin") {
        return res.status(403).json({
          success: false,
          error: "Only superadmin can view all audit logs"
        });
      }

      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;

      const logs = await getAllAuditLogs({ limit, offset });

      // Enrich with user and org data
      const enrichedLogs = await Promise.all(
        logs.map(async (log) => {
          const user = await User.findByPk(log.userId, {
            attributes: ['id', 'fullName', 'email', 'role']
          });
          const org = await Organization.findByPk(log.orgId, {
            attributes: ['id', 'name', 'slug']
          });

          return {
            id: log.id,
            userId: log.userId,
            userName: user?.fullName || 'Unknown',
            userEmail: user?.email || 'Unknown',
            userRole: user?.role || 'Unknown',
            orgId: log.orgId,
            orgName: org?.name || 'Unknown',
            docId: log.docId,
            action: log.action,
            timestamp: log.timestamp,
            auditHash: log.auditHash,
            prevAuditHash: log.prevAuditHash
          };
        })
      );

      res.json({
        success: true,
        logs: enrichedLogs,
        pagination: { limit, offset }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/audit/org/:orgId - Get audit logs for organization (admin/superadmin)
   */
  getByOrg: async (req, res, next) => {
    try {
      const { orgId } = req.params;
      const requestedOrgId = parseInt(orgId);

      // Admin can only view their own org, superadmin can view any
      if (req.user.role === "admin" && req.user.orgId !== requestedOrgId) {
        return res.status(403).json({
          success: false,
          error: "You can only view audit logs for your organization"
        });
      }

      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;

      const logs = await getOrgAuditLogs({ orgId: requestedOrgId, limit, offset });

      // Enrich with user data
      const enrichedLogs = await Promise.all(
        logs.map(async (log) => {
          const user = await User.findByPk(log.userId, {
            attributes: ['id', 'fullName', 'email', 'role']
          });

          return {
            id: log.id,
            userId: log.userId,
            userName: user?.fullName || 'Unknown',
            userEmail: user?.email || 'Unknown',
            userRole: user?.role || 'Unknown',
            docId: log.docId,
            action: log.action,
            timestamp: log.timestamp,
            auditHash: log.auditHash,
            prevAuditHash: log.prevAuditHash
          };
        })
      );

      res.json({
        success: true,
        logs: enrichedLogs,
        pagination: { limit, offset }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/audit/document/:docId - Get audit logs for specific document
   */
  getByDocument: async (req, res, next) => {
    try {
      const { docId } = req.params;
      const limit = parseInt(req.query.limit) || 50;

      const logs = await getDocumentAuditLogs({ docId, limit });

      // Admin can only view documents from their org
      if (req.user.role === "admin" && logs.length > 0) {
        const firstLog = logs[0];
        if (firstLog.orgId !== req.user.orgId) {
          return res.status(403).json({
            success: false,
            error: "You can only view audit logs for your organization's documents"
          });
        }
      }

      // Enrich with user data
      const enrichedLogs = await Promise.all(
        logs.map(async (log) => {
          const user = await User.findByPk(log.userId, {
            attributes: ['id', 'fullName', 'email', 'role']
          });

          return {
            id: log.id,
            userId: log.userId,
            userName: user?.fullName || 'Unknown',
            userEmail: user?.email || 'Unknown',
            userRole: user?.role || 'Unknown',
            action: log.action,
            timestamp: log.timestamp,
            auditHash: log.auditHash,
            prevAuditHash: log.prevAuditHash
          };
        })
      );

      res.json({
        success: true,
        docId,
        logs: enrichedLogs
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/audit/verify/:orgId/:docId - Verify audit chain integrity
   */
  verifyChain: async (req, res, next) => {
    try {
      const { orgId, docId } = req.params;
      const requestedOrgId = parseInt(orgId);

      // Admin can only verify their own org
      if (req.user.role === "admin" && req.user.orgId !== requestedOrgId) {
        return res.status(403).json({
          success: false,
          error: "You can only verify audit chains for your organization"
        });
      }

      const result = await verifyAuditChain({ orgId: requestedOrgId, docId });

      res.json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }
};
