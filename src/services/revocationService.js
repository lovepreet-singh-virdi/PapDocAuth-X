import { DocumentVersion } from "../models/mongo/DocumentVersion.js";
import { Document } from "../models/mongo/Document.js";

/**
 * Revoke a document version. Returns updated version document.
 * Ensures only existing version is updated and returns the changed object.
 */
export async function revokeDocumentVersion({ userId, orgId, documentId, version, reason }) {
	// Find the version
	const ver = await DocumentVersion.findOne({ docId: documentId, versionNumber: version });
	if (!ver) {
		const e = new Error('Document version not found');
		e.status = 404;
		throw e;
	}

	// Only allow revocation by users from same org or superadmin path should have been enforced by middleware
	// Update workflowStatus
	if (ver.workflowStatus === 'REVOKED') {
		return { alreadyRevoked: true, version: ver };
	}

	ver.workflowStatus = 'REVOKED';
	await ver.save();

	// Optionally mark the parent Document as having revoked versions (we won't change currentVersion here)
	await Document.updateOne({ docId: documentId }, { $addToSet: { versionHashChain: ver.versionHash } }).catch(() => {});

	return { success: true, version: ver, reason };
}

export async function getDocumentRevocationStatus({ documentId, orgId }) {
	// Return a summary of revoked versions for the document
	const revoked = await DocumentVersion.find({ docId: documentId, workflowStatus: 'REVOKED' }).sort({ versionNumber: -1 }).lean();
	const all = await DocumentVersion.find({ docId: documentId }).sort({ versionNumber: -1 }).lean();
	return { revokedCount: revoked.length, revokedVersions: revoked, latestVersion: all[0] || null };
}

