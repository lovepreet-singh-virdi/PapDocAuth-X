import crypto from "crypto";
import { Document } from "../models/mongo/Document.js";
import { DocumentVersion } from "../models/mongo/DocumentVersion.js";
import { HashPart } from "../models/mongo/HashPart.js";
import { addAuditEntry } from "./auditService.js";

/**
 * Compute Merkle Root from the 4 multimodal hashes
 * Filters out empty hashes before computing
 */
function computeMerkleRoot({ textHash, imageHash, signatureHash, stampHash }) {
    const leaves = [textHash, imageHash, signatureHash, stampHash]
        .filter(h => h && h.trim() !== "") // Filter out empty hashes
        .map(h => crypto.createHash("sha256").update(h).digest("hex"))
        .sort(); // Ensure deterministic ordering

    // If no valid hashes, use the first non-empty one or empty string
    if (leaves.length === 0) {
        return crypto.createHash("sha256").update("").digest("hex");
    }

    const concat = leaves.join("");
    return crypto.createHash("sha256").update(concat).digest("hex");
}

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
export async function getAllDocuments({ orgId, role }) {
    const filter = role === 'superadmin' ? {} : { ownerOrgId: orgId };
    
    const documents = await Document.find(filter)
        .sort({ createdAt: -1 })
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
    
    return enrichedDocs;
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
 */
export async function uploadDocumentVersion({
    orgId,
    userId,
    docId,
    type,
    metadata,
    hashes,
}) {
    // 1. Check if root Document exists
    let doc = await Document.findOne({ docId });

    // If document does not exist → create it
    if (!doc) {
        doc = await Document.create({
            docId,
            ownerOrgId: orgId,
            type,
            metadata,
            currentVersion: 0,
            versionHashChain: [],
        });
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
    const versionRecord = await DocumentVersion.create({
        docId,
        versionNumber,
        merkleRoot,
        prevVersionHash,
        versionHash,
        workflowStatus: "APPROVED",

        createdByUserId: userId,   // required by schema
        ownerOrgId: orgId          // required by schema
    });


    // 6. Save the hash parts
    await HashPart.create({
        docId,
        versionNumber,
        textHash: hashes.textHash,
        imageHash: hashes.imageHash,
        signatureHash: hashes.signatureHash,
        stampHash: hashes.stampHash,

        ownerOrgId: orgId,
        createdByUserId: userId
    });

    // 7. Update Root Document
    doc.currentVersion = versionNumber;
    doc.versionHashChain.push(versionHash);
    await doc.save();

    // 8. Audit Log (SQL)
    await addAuditEntry({
        userId,
        orgId,
        docId,
        versionNumber,
        action: "UPLOAD_VERSION",
        details: `Document version ${versionNumber} uploaded and auto-approved`,
    });

    return {
        versionRecord,
        merkleRoot,
        versionHash,
        versionNumber,
    };
}
