import { 
  createAccessRequest, 
  getAllAccessRequests, 
  updateAccessRequestStatus 
} from "../services/accessRequestService.js";

export const accessRequestController = {
  // Public endpoint - anyone can submit
  submitRequest: async (req, res, next) => {
    try {
      const { name, organization, email, message } = req.body;
      
      const request = await createAccessRequest({
        name,
        organization,
        email,
        message,
      });

      res.status(201).json({
        success: true,
        message: "Access request submitted successfully. Our team will contact you within 24-48 hours.",
        requestId: request.id,
      });
    } catch (err) {
      next(err);
    }
  },

  // Superadmin only - view all requests
  getAllRequests: async (req, res, next) => {
    try {
      const { status } = req.query;
      const requests = await getAllAccessRequests(status);

      res.json({
        success: true,
        requests,
      });
    } catch (err) {
      next(err);
    }
  },

  // Superadmin only - approve/reject request
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, reviewNotes } = req.body;
      const reviewedBy = req.user.id;

      const request = await updateAccessRequestStatus({
        id,
        status,
        reviewedBy,
        reviewNotes,
      });

      res.json({
        success: true,
        message: `Request ${status}`,
        request,
      });
    } catch (err) {
      next(err);
    }
  },
};
