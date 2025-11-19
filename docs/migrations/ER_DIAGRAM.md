# PapDocAuthX - Database Schema ER Diagram

## Entity-Relationship Diagram

```mermaid
erDiagram
    %% PostgreSQL Entities (Relational)
    
    ORGANIZATIONS ||--o{ USERS : "employs"
    ORGANIZATIONS ||--o{ AUDIT_LOGS : "generates"
    ORGANIZATIONS ||--o{ DOCUMENT_WORKFLOWS : "manages"
    
    USERS ||--o{ AUDIT_LOGS : "performs"
    USERS ||--o{ DOCUMENT_WORKFLOWS : "assigned_to"
    USERS }o--o{ ROLES : "has"
    
    USER_ROLES }o--|| USERS : "belongs_to"
    USER_ROLES }o--|| ROLES : "defines"
    
    %% MongoDB Collections (Document Store)
    DOCUMENTS ||--o{ DOCUMENT_VERSIONS : "has_versions"
    DOCUMENT_VERSIONS ||--|| HASH_PARTS : "contains"
    
    %% Cross-Database References (via IDs)
    ORGANIZATIONS ||..o{ DOCUMENTS : "owns (orgId)"
    USERS ||..o{ DOCUMENTS : "uploads (userId)"
    
    ORGANIZATIONS {
        uuid id PK
        varchar name
        varchar domain UK
        varchar type "UNIVERSITY, CORPORATION, GOVERNMENT"
        boolean isVerified
        varchar contactEmail
        text logoUrl
        jsonb metadata
        timestamptz createdAt
        timestamptz updatedAt
    }
    
    USERS {
        uuid id PK
        varchar email UK
        varchar passwordHash
        uuid orgId FK
        varchar fullName
        boolean isVerified
        timestamptz createdAt
        timestamptz updatedAt
    }
    
    ROLES {
        uuid id PK
        varchar name UK "SUPERADMIN, ADMIN, USER"
        text description
        timestamptz createdAt
    }
    
    USER_ROLES {
        uuid userId FK
        uuid roleId FK
        timestamptz assignedAt
        uuid assignedBy FK
    }
    
    AUDIT_LOGS {
        uuid id PK
        uuid userId FK
        uuid orgId FK
        varchar docId "References MongoDB"
        varchar action "UPLOAD, VERIFY, REVOKE"
        timestamptz timestamp
        inet ipAddress
        text userAgent
        varchar prevAuditHash
        varchar auditHash UK "SHA-256 hash chain"
        jsonb metadata
    }
    
    DOCUMENT_WORKFLOWS {
        uuid id PK
        varchar docId "References MongoDB"
        uuid orgId FK
        varchar status "PENDING, APPROVED, REJECTED"
        uuid assignedTo FK
        timestamptz createdAt
        timestamptz updatedAt
    }
    
    DOCUMENTS {
        objectId _id PK
        varchar docId UK "DOC_20241119_ABC123"
        uuid ownerOrgId "References PostgreSQL"
        varchar type "DEGREE, TRANSCRIPT, OFFER_LETTER"
        jsonb metadata
        int currentVersion
        array versionHashChain "Blockchain-inspired chain"
        boolean isRevoked
        timestamptz createdAt
        timestamptz updatedAt
    }
    
    DOCUMENT_VERSIONS {
        objectId _id PK
        varchar docId FK "References Documents"
        int versionNumber
        varchar versionHash UK "SHA-256(prevHash + merkleRoot)"
        varchar prevVersionHash "Links to previous version"
        varchar merkleRoot "Root of 4-hash Merkle tree"
        varchar workflowStatus "APPROVED, REVOKED, PENDING"
        uuid createdByUserId "References PostgreSQL Users"
        uuid ownerOrgId "References PostgreSQL Orgs"
        timestamptz uploadedAt
        uuid revokedBy
        timestamptz revokedAt
        text revocationReason
    }
    
    HASH_PARTS {
        objectId _id PK
        varchar docId "References Documents"
        int versionNumber "References DocumentVersions"
        varchar textHash "SHA-256 of OCR/PDF text"
        varchar imageHash "SHA-256 of rasterized image"
        varchar signatureHash "SHA-256 of signature ROI"
        varchar stampHash "SHA-256 of stamp/seal ROI"
        uuid ownerOrgId
        uuid createdByUserId
        timestamptz createdAt
    }
```

## Database Architecture Overview

### **Polyglot Persistence Strategy**

PapDocAuthX uses a **hybrid PostgreSQL + MongoDB architecture** to optimize for different data access patterns:

#### **PostgreSQL (Relational - ACID Critical)**

- **Users & Authentication** - Strong consistency, ACID transactions
- **Organizations** - Referential integrity, structured queries
- **Audit Logs** - Tamper-proof hash chains, immutability via triggers
- **Roles & Permissions** - RBAC with many-to-many relationships
- **Document Workflows** - State transitions, complex joins

#### **MongoDB (Document Store - Scalability)**
- **Documents** - Flexible metadata schema, rapid iteration
- **Document Versions** - Rapidly growing version history, horizontal scaling
- **Hash Parts** - Multimodal cryptographic hashes (4 types per version)

### **Cross-Database References**

References between PostgreSQL and MongoDB are maintained via **UUID/String identifiers**:

- `Documents.ownerOrgId` → `Organizations.id` (PostgreSQL)
- `DocumentVersions.createdByUserId` → `Users.id` (PostgreSQL)
- `AuditLogs.docId` → `Documents.docId` (MongoDB)

**Note:** No foreign key constraints across databases - maintained via application logic

---

## Key Relationships

(See full diagram in repository)

**Last Updated:** 2025-11-19  
**Author:** Lovepreet Singh  
**Database Versions:** PostgreSQL 18.1, MongoDB 6.x
