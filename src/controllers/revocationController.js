import { changeWorkflowState } from "../services/workflowService.js";
import { DocumentVersion } from "../models/mongo/DocumentVersion.js";

export const revocationController = {
	// Revoke a document version - now uses workflow service
	revokeVersion: async (req, res, next) => {
		try {
			const { documentId, version, reason } = req.body;
			const userId = req.user.id;
			const orgId = req.user.orgId;

			if (!documentId) {
				return res.status(400).json({ 
					success: false,
					error: "documentId is required" 
				});
			}

			// Use workflow service for consistent state management
			const result = await changeWorkflowState({ 
				userId, 
				orgId, 
				documentId, 
				versionNumber: version,
				state: 'REVOKED',
				reason: reason || 'No reason provided'
			});

			res.json({ 
				success: true, 
				message: 'Document version revoked successfully', 
				...result 
			});
		} catch (err) {
			next(err);
		}
	},

	// Get revocation status for a document
	getStatus: async (req, res, next) => {
		try {
			const { documentId } = req.params;

			if (!documentId) {
				return res.status(400).json({ 
					success: false,
					error: 'documentId is required' 
				});
			}

			// Get all versions and filter revoked ones
			const allVersions = await DocumentVersion.find({ docId: documentId })
				.sort({ versionNumber: -1 })
				.lean();
			
			const revokedVersions = allVersions.filter(v => v.workflowStatus === 'REVOKED');

			res.json({ 
				success: true, 
				documentId,
				totalVersions: allVersions.length,
				revokedCount: revokedVersions.length,
				revokedVersions: revokedVersions.map(v => ({
					versionNumber: v.versionNumber,
					revokedAt: v.revokedAt,
					revokedBy: v.revokedByUserId,
					reason: v.revocationReason
				})),
				latestVersion: allVersions[0] || null
			});
		} catch (err) {
			next(err);
		}
	}
};

