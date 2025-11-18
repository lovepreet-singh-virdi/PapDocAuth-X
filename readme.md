# PapDocAuthX+ Backend  
### Privacy-First Multi‑Modal Document Authentication System  
**Node.js • Express • PostgreSQL (Sequelize) • MongoDB (Mongoose) • JWT Auth • Zero‑Knowledge Architecture**

PapDocAuthX+ is a next‑generation document authentication backend designed for **privacy‑first verification**, **tamper detection**, and **enterprise‑grade auditability**.  
It merges **post‑OCR cryptography**, **multi‑modal Merkle hashing**, **document version‑chains**, **RBAC**, and **polyglot data persistence** into one modern verification engine.

This repository contains the full backend implementation powering the PapDocAuthX+ platform.

---

# 🚀 Key Features

## 🔐 Authentication & Authorization
- JWT‑based secure login  
- Role‑based access control (RBAC)  
- Multi‑role user assignments  
- Bcrypt password hashing  
- SQL‑backed user accounts, roles, workflows, revocations  

## 📄 Zero‑Knowledge Document Verification (ZKV)
✔ **Document NEVER leaves the user’s device**  
✔ All extraction—OCR, ROI detection, hashing—runs client‑side  
✔ Backend receives ONLY cryptographic fingerprints (Merkle root + metadata)

This eliminates privacy risks, storage liabilities, and prevents sensitive information from ever reaching the server.

### Client-side extracted proofs include:
- OCR text hash  
- Full document image hash  
- Signature ROI hash  
- Stamp/seal ROI hash  
- Combined into a **Merkle Tree** → **Single root hash**  

---

# 🧠 Multi‑Modal Integrity Engine (MMIE)
Most systems hash only text — PapDocAuthX+ is **multi‑modal forensic level**.

The backend expects hashes for these four modalities:

1. **Full OCR Text Hash**  
2. **Full Document Image Hash**  
3. **Signature Region of Interest (ROI) Hash**  
4. **Stamp/Seal ROI Hash**

All are validated as part of a **Merkle root**, providing extremely strong tamper detection.

---

# 🔗 Blockchain‑Inspired Version Chain (MongoDB)
Each document version is cryptographically chained:

```
{
  version: 3,
  prevHash: "abc123",
  currHash: "xyz789",
  timestamp: "...",
  editor: "UserID"
}
```

Functions like a blockchain **without the cost or complexity of Web3**.  
Detects:
- Unauthorized edits  
- Conflicting versions  
- Forged resubmissions  

---

# 🛡️ Cryptographically Linked Audit Logs (PostgreSQL)
Every action (upload, verify, revoke) is hashed + chained:

```
Event #1 → h1
Event #2 → SHA256(h1 + event2Data) = h2
Event #3 → SHA256(h2 + event3Data) = h3
```

Provides a **tamper‑evident audit trail** suitable for enterprise and compliance.

---

# 🔬 Document DNA Fingerprint
A unique identifier generated from:
- Layout hash (structure of text, elements, spacing)
- Modality vector (image + ROI embeddings)
- Merkle root

Detects:
- Template reuse fraud  
- Mass‑produced fake degrees  
- Minor text edits that still maintain same layout  

---

# 📊 Tamper Score Engine
The backend verifies fingerprint components and returns a **tamper percentage score**:

| Modality | Weight |
|---------|--------|
| Text similarity | 40% |
| Image SSIM/perceptual diff | 30% |
| Signature matching | 15% |
| Stamp pattern recognition | 15% |

Return example:
```
{
  "score": 68,
  "risk": "High Tampering Likely"
}
```

---

# 🧱 Polyglot Persistence (PostgreSQL + MongoDB)
**MongoDB** → Document DNA, Merkle trees, versions, hash parts, verification results  
**PostgreSQL** → Users, Roles, Workflow, Revocations, Audit logs, Verification stats  

This achieves optimum performance + flexibility.

---

# 📱 QR‑Based Trustless Verification
QR code embeds:
- documentId  
- version  
- Merkle root  

Verification steps:
1. User scans QR  
2. Browser computes all hashes locally  
3. Compares with QR’s Merkle root  
4. Result → **Valid / Tampered**  

Works **offline**, with no need to trust the server.

---

# 📁 Folder Structure
```
/papdocauthx-backend
│── config/               # DB configs (PostgreSQL + MongoDB)
│── models/               # SQL + Mongo models
│── controllers/          # Route controllers
│── routes/               # API endpoints
│── middleware/           # Auth & role checks
│── services/             # Hashing, versioning, seeding
│── seed/seedService.js   # Hybrid DB seeder
│── utils/                # Crypto helpers
│── server.js
│── package.json
```

---

# ⚙️ Environment Variables
```
PORT=5000

# PostgreSQL
SQL_DIALECT=postgres
SQL_HOST=localhost
SQL_PORT=5432
SQL_USER=postgres
SQL_PASS=yourpassword
SQL_DB=papdocauthx

# MongoDB
MONGO_URI=mongodb://localhost:27017/papdocauthx

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES=1d
```

---

# 🛠️ Running the Project

### Install dependencies:
```bash
npm install
```

### Development:
```bash
npm run dev
```

### Production:
```bash
npm start
```

### Seed Both Databases:
```bash
node seed/seedService.js
```

---

# 🔗 Major API Endpoints

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Users
- CRUD users
- Role assignment

### Documents
- Upload metadata
- Verify (multi‑modal)
- Fetch versions

### Workflow / Revocations
- Approval workflows
- Document revocation
- Revocation history

---

# 🏆 Why PapDocAuthX+ Is Unique (Compared to Real-World Systems)
**No existing platform** combines ALL these features:

| Feature | Existing Systems | PapDocAuthX+ |
|--------|------------------|--------------|
| True zero‑knowledge | ❌ | ✅ |
| Multi‑modal Merkle hashing | ❌ | ✅ |
| Document DNA | ❌ | ✅ |
| Tamper score % | ❌ | ✅ |
| Offline trustless QR verification | 🔸 partial | ✅ |
| Version chain + audit hash chain | ❌ | ✅ |
| No blockchain | ❌ many depend on chain | ✅ |
| Polyglot DB | 🔸 rarely | ✅ |

Closest competitors (MIT Blockcerts, DigiLocker, Qryptal, DocuSign) support **3–4 features**, but PapDocAuthX+ integrates **all 8**.

---

# 🌍 Real‑World Use Cases
- Fake degree detection  
- Validating scanned documents (even after rescans/printing)  
- HR & employer verification  
- University transcript validation  
- Government certificate integrity  
- Zero‑knowledge identity proofs  

---

# 👨‍💻 Developer
**Lovepreet Singh Virdi**  
Master of Applied Computing, University of Windsor  

---

# 📜 License
MIT — free to use, modify, and extend.
