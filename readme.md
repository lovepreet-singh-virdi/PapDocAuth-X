# 🧾 PapDocAuth-X  
### Intelligent Document Authentication using OCR and MongoDB Atlas  

PapDocAuth-X is a secure backend application that authenticates document images using **Optical Character Recognition (Tesseract.js)** and **cryptographic hashing (SHA-256)**.  
The project integrates **Node.js**, **Express**, and **MongoDB Atlas** to create a scalable, cloud-hosted verification service.

---

## 📘 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
- [Sample MongoDB Document](#sample-mongodb-document)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Future Enhancements](#future-enhancements)
- [Contributors](#contributors)
- [References](#references)
- [License](#license)

---

## 🧩 Overview
As digital document usage increases, so does the risk of forgery or tampering.  
PapDocAuth-X provides a reliable solution by extracting text from uploaded document images, generating **SHA-256 hashes**, and storing them securely in a **MongoDB Atlas** database.  

When a document is re-uploaded, the system re-hashes its content and verifies it against existing records — ensuring data integrity and authenticity.

---

## 🚀 Features
- Upload and extract text from scanned document images using **Tesseract.js**
- Generate **SHA-256** hash values for data integrity
- Store documents, extracted text, and hashes in **MongoDB Atlas**
- Verify documents by comparing newly generated hashes
- Built-in **error handling and validation**
- Modular and easily extendable backend structure
- Future-ready for **React UI and QR verification integration**

---

## 🧠 System Architecture
```
User → React UI → Express API → OCR (Tesseract.js) → SHA-256 Hash → MongoDB Atlas → Verification Response
```

**Components:**
- **Frontend (React)**: Upload UI (to be integrated)
- **Backend (Node.js + Express)**: Core processing layer
- **OCR Engine (Tesseract.js)**: Extracts text from image files
- **Database (MongoDB Atlas)**: Stores metadata, extracted text, and SHA-256 hashes

---

## 🛠️ Tech Stack
| Component | Technology |
|------------|-------------|
| Backend Framework | Node.js + Express |
| Database | MongoDB Atlas (Cloud NoSQL) |
| OCR Engine | Tesseract.js |
| Hashing Algorithm | Node Crypto (SHA-256) |
| File Uploads | Multer |
| Environment Variables | dotenv |
| Testing Tool | Postman |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/PapDocAuthX.git
cd PapDocAuthX
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Create Environment File
Create a `.env` file in the root directory and add:
```bash
PORT=4000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/PapDocAuthX
```

### 4️⃣ Start the Server
```bash
npm start
```

The server runs at: **http://localhost:4000**

---

## 📡 API Endpoints

### **1. Upload Document**
**Method:** `POST`  
**Route:** `/upload`  
**Description:** Uploads an image, extracts text using OCR, generates SHA-256 hash, and stores metadata in MongoDB.

**Request (form-data):**
| Key  | Type | Description                        |
| ---- | ---- | ---------------------------------- |
| file | File | Document image (.png, .jpg, .jpeg) |

**Response Example**
```json
{
  "message": "File uploaded successfully",
  "filename": "aadhaar.png",
  "textHash": "a9f7e23...",
  "uploadDate": "2025-11-05T19:03:00Z"
}
```

---

### **2. Verify Document**
**Method:** `POST`  
**Route:** `/verify`  
**Description:** Re-uploads a document, re-generates hash, and verifies authenticity.

**Request (form-data):**
| Key  | Type | Description                        |
| ---- | ---- | ---------------------------------- |
| file | File | Document image (.png, .jpg, .jpeg) |

**Response Example**
```json
{
  "message": "Verification successful",
  "match": true,
  "storedHash": "a9f7e23...",
  "verifiedAt": "2025-11-05T19:10:00Z"
}
```

---

## 🧮 Sample MongoDB Document
```json
{
  "_id": "672a1bde903d9f9e2cf8a123",
  "filename": "aadhaar.png",
  "ocrExtract": "Government of India...",
  "textHash": "a9f7e23...",
  "uploadDate": "2025-11-05T19:03:00Z"
}
```

---

## 🧪 Testing
- Use **Postman** to test `/upload` and `/verify` APIs.
- Confirm data persistence in **MongoDB Atlas**.
- Example test scenarios:
  - Upload same file → Hash should match.
  - Upload modified image → Hash should differ.

---

## 🔐 Security Considerations
- Sensitive credentials stored in `.env` (not committed)
- File validation using Multer middleware
- Error handling for unsupported or corrupted files
- Planned **JWT-based authentication** for authorized API access

---

## 🌱 Future Enhancements
- Build **React.js UI** for upload and verification
- Integrate **QR code verification** for document hashes
- Support for **PDFs, signatures, and multi-modal content**
- Add **audit logs** to track verification events
- Host backend on **Render** or **Vercel** with CI/CD pipeline

---

## 👥 Contributors
| Name                     |
| **Lovepreet Singh Virdi** |
| **Tusharbir Singh Mutty** |
| **Chirag**                |      |
| **Nishchay**              |

---

## 📚 References
1. **MongoDB Atlas Documentation** – *Get Started with Atlas*  
   🔗 [https://www.mongodb.com/docs/atlas/getting-started/](https://www.mongodb.com/docs/atlas/getting-started/)

2. **Tesseract.js** – *Pure JavaScript OCR for 100+ Languages*  
   🔗 [https://tesseract.projectnaptha.com/](https://tesseract.projectnaptha.com/)

3. **NIST Secure Hash Standard (FIPS PUB 180-4)** – *SHA-256 Algorithm*  
   🔗 [https://csrc.nist.gov/publications/detail/fips/180/4/final](https://csrc.nist.gov/publications/detail/fips/180/4/final)

4. **Tesseract OCR Engine** – *Official Documentation*  
   🔗 [https://tesseract-ocr.github.io/](https://tesseract-ocr.github.io/)

5. **MongoDB Manual** – *Data Modeling and Indexing Concepts*  
   🔗 [https://www.mongodb.com/docs/manual/core/data-modeling-introduction/](https://www.mongodb.com/docs/manual/core/data-modeling-introduction/)

6. **Chen, Z. et al. (2023)** – *Image Hashing Techniques for Document Verification.* IEEE Access  
   🔗 [https://ieeexplore.ieee.org/document/10034598](https://ieeexplore.ieee.org/document/10034598)

7. **Mitra, P. et al. (2022)** – *OCR and Deep Learning for Secure Document Authentication.* Springer LNCS  
   🔗 [https://link.springer.com/chapter/10.1007/978-3-030-98737-6_24](https://link.springer.com/chapter/10.1007/978-3-030-98737-6_24)

8. **Node.js Crypto Module** – *Hash and HMAC APIs*  
   🔗 [https://nodejs.org/api/crypto.html](https://nodejs.org/api/crypto.html)

---

## 📜 License
This project is created for academic use under **University of Windsor – COMP 8157 (Advanced Database Topics)**.  
© 2025 **PapDocAuth-X Team**. All rights reserved.

---

**Maintained by:** [Lovepreet Singh Virdi](https://www.linkedin.com/in/lovepreetsinghvirdi)