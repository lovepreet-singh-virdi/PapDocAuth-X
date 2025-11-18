import { uploadDocumentVersion } from "../services/documentService.js";

export const documentController = {
    uploadVersion: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const orgId = req.user.orgId;


            const { docId, type, metadata, hashes } = req.body;

            if (!docId || !type || !metadata || !hashes) {
                return res.status(400).json({
                    error: "docId, type, metadata and hashes are required",
                });
            }

            const result = await uploadDocumentVersion({
                docId,
                type,
                metadata,
                hashes,
                orgId,
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
