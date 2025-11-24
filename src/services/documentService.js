import crypto from "crypto";
import mongoose from "mongoose";
import { Document } from "../models/mongo/Document.js";
import { DocumentVersion } from "../models/mongo/DocumentVersion.js";
import { HashPart } from "../models/mongo/HashPart.js";
import { addAuditEntry } from "./auditService.js";

/**
 * Compute Merkle Root from the 4 multimodal hashes
 * Filters out empty hashes before computing
 */
// Use shared Merkle root logic from hashingService.js
import { computeMerkleRoot } from "./hashingService.js";

/**
 * Compute version hash = SHA256(previousVersionHash + merkleRoot)
 */
function computeVersionHash(prevHash, merkleRoot) {
    const base = prevHash ? prevHash + merkleRoot : merkleRoot;
    return crypto.createHash("sha256").update(base).digest("hex");
}

/**
 * Get all documents for an organization
 * Superadmin can see all, Admin/User see their org only
 */

export async function getAllDocuments({ orgId, role, limit, offset, search }) {
    let filter = role === 'superadmin' ? {} : { ownerOrgId: orgId };
    // Add search support (by docId or type, case-insensitive)
    if (search && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        filter = {
            ...filter,
            $or: [
                { docId: regex },
                { type: regex }
            ]
        };
    }
    // Pagination
    const queryLimit = typeof limit !== 'undefined' ? parseInt(limit) : 10;
    const queryOffset = typeof offset !== 'undefined' ? parseInt(offset) : 0;
    const total = await Document.countDocuments(filter);
    const documents = await Document.find(filter)
        .sort({ createdAt: -1 })
        .skip(queryOffset)
        .limit(queryLimit)
        .lean();

    // Get latest version info for each document
    const enrichedDocs = await Promise.all(
        documents.map(async (doc) => {
            const latestVersion = await DocumentVersion.findOne({
                docId: doc.docId,
                versionNumber: doc.currentVersion
            }).lean();
            return {
                ...doc,
                latestVersionStatus: latestVersion?.workflowStatus || 'UNKNOWN',
                latestVersionHash: latestVersion?.versionHash,
                createdBy: latestVersion?.createdByUserId
            };
        })
    );
    return { items: enrichedDocs, total };
}

/**
 * Get document details with all versions
 */
export async function getDocumentDetails({ docId, orgId, role }) {
    const doc = await Document.findOne({ docId }).lean();
    
    if (!doc) {
        throw new Error('Document not found');
    }
    
    // Check access rights
    if (role !== 'superadmin' && doc.ownerOrgId !== orgId) {
        throw new Error('Access denied to this document');
    }
    
    // Get all versions
    const versions = await DocumentVersion.find({ docId })
        .sort({ versionNumber: -1 })
        .lean();
    
    // Get hash parts for latest version
    const latestHashParts = await HashPart.findOne({
        docId,
        versionNumber: doc.currentVersion
    }).lean();
    
    return {
        ...doc,
        versions,
        latestHashParts
    };
}

/**
 * Get all versions for a document
 */
export async function getDocumentVersions({ docId, orgId, role }) {
    const doc = await Document.findOne({ docId }).lean();
    
    if (!doc) {
        throw new Error('Document not found');
    }
    
    // Check access rights
    if (role !== 'superadmin' && doc.ownerOrgId !== orgId) {
        throw new Error('Access denied to this document');
    }
    
    const versions = await DocumentVersion.find({ docId })
        .sort({ versionNumber: -1 })
        .lean();
    
    // Get hash parts for each version
    const versionsWithHashes = await Promise.all(
        versions.map(async (version) => {
            const hashParts = await HashPart.findOne({
                docId,
                versionNumber: version.versionNumber
            }).lean();
            
            return {
                ...version,
                hashes: hashParts ? {
                    textHash: hashParts.textHash,
                    imageHash: hashParts.imageHash,
                    signatureHash: hashParts.signatureHash,
                    stampHash: hashParts.stampHash
                } : null
            };
        })
    );
    
    return versionsWithHashes;
}

/**
 * Create new document version + hash parts + update root document
 * Note: Uses transactions if replica set is available, otherwise falls back to sequential operations
 */
export async function uploadDocumentVersion({
    orgId,
    userId,
    docId,
    type,
    metadata,
    hashes,
}) {
    // Check if MongoDB supports transactions (replica set or sharded cluster)
    const supportsTransactions = mongoose.connection.readyState === 1 && 
                                  mongoose.connection.db?.admin()?.serverInfo;
    
    if (supportsTransactions) {
        // Try transaction first
        const session = await mongoose.startSession();
        
        try {
            return await session.withTransaction(async () => {
                return await performDocumentUpload({
                    orgId, userId, docId, type, metadata, hashes, session
                });
            });
        } catch (error) {
            // If transaction fails due to replica set requirement, fall back
            if (error.message?.includes('Transaction numbers are only allowed') || 
                error.message?.includes('replica set')) {
                console.warn('MongoDB transactions not supported, falling back to non-transactional mode');
                return await performDocumentUpload({
                    orgId, userId, docId, type, metadata, hashes, session: null
                });
            }
            throw error;
        } finally {
            session.endSession();
        }
    } else {
        // No transaction support, use sequential operations
        console.warn('MongoDB transactions not supported (standalone mode), using sequential operations');
        return await performDocumentUpload({
            orgId, userId, docId, type, metadata, hashes, session: null
        });
    }
}

/**
 * Internal function to perform document upload operations
 * Works with or without transactions
 */
async function performDocumentUpload({ orgId, userId, docId, type, metadata, hashes, session }) {
    // 1. Check if root Document exists
    const query = { docId };
    let doc = session 
        ? await Document.findOne(query).session(session)
        : await Document.findOne(query);

    // If document does not exist → create it
    if (!doc) {
        const docData = {
            docId,
            ownerOrgId: orgId,
            type,
            metadata,
            currentVersion: 0,
            versionHashChain: [],
        };
        
        if (session) {
            const [createdDoc] = await Document.create([docData], { session });
            doc = createdDoc;
        } else {
            doc = await Document.create(docData);
        }
    }

    // 2. Determine version number
    const versionNumber = (doc.currentVersion || 0) + 1;

    // 3. Compute Merkle Root
    const merkleRoot = computeMerkleRoot(hashes);

    // 4. Compute version hash
    const prevVersionHash =
        versionNumber === 1 ? null : doc.versionHashChain[doc.versionHashChain.length - 1];

    const versionHash = computeVersionHash(prevVersionHash, merkleRoot);

    // 5. Create the DocumentVersion record
    const versionData = {
        docId,
        versionNumber,
        merkleRoot,
        prevVersionHash,
        versionHash,
        workflowStatus: "APPROVED",
        createdByUserId: userId,
        ownerOrgId: orgId
    };
    
    const versionRecord = session
        ? (await DocumentVersion.create([versionData], { session }))[0]
        : await DocumentVersion.create(versionData);

    // 6. Save the hash parts
    const hashPartData = {
        docId,
        versionNumber,
        textHash: hashes.textHash,
        imageHash: hashes.imageHash,
        signatureHash: hashes.signatureHash,
        stampHash: hashes.stampHash,
        ownerOrgId: orgId,
        createdByUserId: userId
    };
    
    if (session) {
        await HashPart.create([hashPartData], { session });
    } else {
        await HashPart.create(hashPartData);
    }

    // 7. Update Root Document
    doc.currentVersion = versionNumber;
    doc.versionHashChain.push(versionHash);
    
    if (session) {
        await doc.save({ session });
    } else {
        await doc.save();
    }

    // 8. Audit Log (SQL) - always outside MongoDB transaction
    try {
        // Use default orgId 0 for superadmin (orgId null/undefined)
        const auditOrgId = orgId == null ? 0 : orgId;
        await addAuditEntry({
            userId,
            orgId: auditOrgId,
            docId,
            versionNumber,
            action: "UPLOAD",
            details: `Document version ${versionNumber} uploaded and auto-approved`,
        });
    } catch (auditError) {
        console.error('Audit log failed (non-critical):', auditError.message);
        // Continue execution - audit failure shouldn't block document upload
    }

    return {
        versionRecord,
        merkleRoot,
        versionHash,
        versionNumber,
    };
}
