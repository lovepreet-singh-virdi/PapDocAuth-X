import { changeWorkflowState, getWorkflowHistory } from "../services/workflowService.js";

export const workflowController = {
  /**
   * POST /api/workflow/change-state
   * Change document workflow state (admin/superadmin only)
   */
  changeState: async (req, res, next) => {
    try {
      const { documentId, versionNumber, state, reason } = req.body;
      const userId = req.user.id;
      const orgId = req.user.orgId;

      if (!documentId || !state) {
        return res.status(400).json({
          success: false,
          error: "documentId and state are required"
        });
      }

      const result = await changeWorkflowState({
        userId,
        orgId,
        documentId,
        versionNumber,
        state,
        reason
      });

      res.json({
        success: true,
        message: `Document state changed to ${state}`,
        ...result
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/workflow/:documentId
   * Get workflow history for a document (admin/superadmin only)
   */
  getHistory: async (req, res, next) => {
    try {
      const { documentId } = req.params;
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Authentication required"
        });
      }
      
      const orgId = req.user.orgId;
      const role = req.user.role;

      if (!documentId) {
        return res.status(400).json({
          success: false,
          error: "documentId is required"
        });
      }

      const history = await getWorkflowHistory({
        documentId,
        orgId,
        role
      });

      res.json({
        success: true,
        documentId,
        history
      });
    } catch (err) {
      next(err);
    }
  }
};
