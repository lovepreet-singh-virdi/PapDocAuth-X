import { 
    uploadDocumentVersion, 
    getAllDocuments, 
    getDocumentDetails, 
    getDocumentVersions 
} from "../services/documentService.js";

export const documentController = {
    // Get all documents (org-filtered)
    getAllDocuments: async (req, res, next) => {
        try {
            const { orgId, role } = req.user;
            
            const documents = await getAllDocuments({ orgId, role });
            
            res.json({
                success: true,
                documents
            });
        } catch (err) {
            next(err);
        }
    },

    // Get document details with all versions
    getDetails: async (req, res, next) => {
        try {
            const { docId } = req.params;
            const { orgId, role } = req.user;
            
            const details = await getDocumentDetails({ docId, orgId, role });
            
            res.json({
                success: true,
                document: details
            });
        } catch (err) {
            next(err);
        }
    },

    // Get all versions for a document
    getVersions: async (req, res, next) => {
        try {
            const { docId } = req.params;
            const { orgId, role } = req.user;
            
            const versions = await getDocumentVersions({ docId, orgId, role });
            
            res.json({
                success: true,
                versions
            });
        } catch (err) {
            next(err);
        }
    },

    uploadVersion: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const userOrgId = req.user.orgId;
            const { role } = req.user;

            const { docId, type, metadata, hashes, targetOrgId } = req.body;

            if (!docId || !type || !metadata || !hashes) {
                return res.status(400).json({
                    error: "docId, type, metadata and hashes are required",
                });
            }

            // Validate metadata file size if present
            if (metadata.fileSize && metadata.fileSize > 5 * 1024 * 1024) {
                return res.status(400).json({
                    error: "File size must be less than 5MB"
                });
            }

            // Determine final orgId:
            // - Admin: must use their own orgId
            // - Superadmin: can specify targetOrgId, or use -1 for system-wide documents
            let finalOrgId;
            if (role === 'superadmin') {
                finalOrgId = targetOrgId || -1; // -1 = system/superadmin document
            } else {
                if (targetOrgId && targetOrgId !== userOrgId) {
                    return res.status(403).json({
                        error: "You can only create documents for your own organization"
                    });
                }
                finalOrgId = userOrgId;
            }

            if (!finalOrgId) {
                return res.status(400).json({
                    error: "Organization ID is required. Admins use their org, Superadmins must provide targetOrgId."
                });
            }

            const result = await uploadDocumentVersion({
                docId,
                type,
                metadata,
                hashes,
                orgId: finalOrgId,
                userId,
            });

            res.status(201).json({
                success: true,
                message: "Document version uploaded",
                ...result,
            });
        } catch (err) {
            next(err);
        }
    },
};
