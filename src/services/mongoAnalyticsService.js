import { Document } from "../models/mongo/Document.js";
import { DocumentVersion } from "../models/mongo/DocumentVersion.js";

export const mongoAnalyticsService = {
  totalDocuments: () => Document.countDocuments(),

  docsByOrg: () =>
    Document.aggregate([
      { $group: { _id: "$ownerOrgId", total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]),

  versionCounts: () =>
    DocumentVersion.aggregate([
      {
        $group: {
          _id: "$docId",
          versions: { $sum: 1 },
          latestVersion: { $max: "$versionNumber" }
        }
      },
      { $sort: { versions: -1 } }
    ]),

  revokedDocuments: () =>
    DocumentVersion.countDocuments({ workflowStatus: "REVOKED" }),

  activeDocuments: () =>
    DocumentVersion.countDocuments({ workflowStatus: "APPROVED" })
};
