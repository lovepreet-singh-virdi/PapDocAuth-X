import { changeWorkflowState } from "../services/workflowService.js";

export const workflowController = {
  changeState: async (req, res) => {
    try {
      const { userId } = req.user;
      const { docId, toState, reason } = req.body;

      const result = await changeWorkflowState({
        docId,
        userId,
        toState,
        reason
      });

      res.json({ message: "State updated", result });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
