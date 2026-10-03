# LUMOS-CERTIFY 🛡️✨

**Verifiable QR-Code Certificate Issuance Platform**  
*“Let there be proof.”*

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Ed25519](https://img.shields.io/badge/Cryptography-Ed25519%20%28RFC%208032%29-amber)](https://en.wikipedia.org/wiki/EdDSA#Ed25519)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 1. Overview

**LUMOS-CERTIFY** is an end-to-end platform for issuing high-resolution, cryptographically signed digital certificates in bulk. Every certificate carries a unique tamper-evident QR code embedding an **Ed25519 asymmetric digital signature anchor**.

### The Core Security Principle
> **Verification is cryptographic, not just a lookup.**  
> The verification page **never trusts data from the QR payload itself**. The QR code's sole role is to *address* the certificate record and provide the signature anchor; certificate details are rendered exclusively from the authoritative, append-only registry.

---

## 2. System Architecture

```
┌──────────────────┐   ┌──────────────────────┐   ┌────────────────────────┐
│ Template Designer│──▶│    Template Store    │──▶│ Vector / PDF Renderer  │
│ (canvas / JSON)  │   │    (layout JSON)     │   │  (pdf-lib + QR code)   │
└──────────────────┘   └──────────────────────┘   └───────────┬────────────┘
                                                              │
┌──────────────────┐   ┌──────────────────────┐   ┌───────────▼────────────┐
│    CSV Upload    │──▶│ Strict Column Check  │──▶│     Issuance Engine    │
│ (bulk recipients)│   │  & Duplicate Filter  │   │  • cert_id generation  │
└──────────────────┘   └──────────────────────┘   │  • Ed25519 digital sig │
                                                  │  • SHA-256 Manifest    │
                                                  │  • Append-Only Ledger  │
                                                  └───────────┬────────────┘
                                                              │
                     ┌────────────────────────────────────────┼────────────────────────────────────────┐
                     ▼                                        ▼                                        ▼
             ┌───────────────┐                        ┌───────────────┐                        ┌───────────────┐
             │ Public Verify │                        │  PDF & ZIP    │                        │ Institutional │
             │ API & Web UI  │                        │ Delivery Pack │                        │  Audit Trail  │
             └───────────────┘                        └───────────────┘                        └───────────────┘
```

---

## 3. Key Modules

### 3.1 🎨 Visual Template Designer (`/templates`)
- **Drag-and-Drop / Precision Coordinates**: Configure placeholders (`{{name}}`, `{{credential}}`, `{{issue_date}}`, `{{cert_id}}`, `{{issuer_name}}`).
- **Cryptographic QR Anchor**: Configurable position, dimensions, colors, and security labels.
- **Built-in Presets**:
  - *Executive Distinction* (Royal Navy & Gold borders)
  - *Cybersecurity & Tech Honors* (Obsidian base, cyan matrix)
  - *Classic Academic Diploma* (Ivory parchment, vintage burgundy)
- **JSON Specification Export**: Export full layout JSON as defined in the platform blueprint.

### 3.2 📄 CSV Ingestion & Validation Engine (`/batches/new`)
- **Template Placeholder Matching**: Strict column validation against the active template before generation begins.
- **Zero-Tolerance Error Reporting**: Exact line numbers for missing values or malformed dates — nothing is silently skipped.
- **Duplicate Prevention**: Composite key checks `(email + credential)` within the batch.
- **Sample Generation**: One-click download of sample CSV tailored to the chosen template.

```csv
name,credential,issue_date,email
Asha Verma,Advanced Data Analysis,2026-09-14,asha@example.com
Rohan Iyer,Advanced Data Analysis,2026-09-14,rohan@example.com
```

### 3.3 🔐 Cryptographic Issuance Core (`src/lib/crypto.ts`)
- **Unique Identifier**: Sequential, canonical ID formatted as `CERT-YYYY-NNNNNN`.
- **Deterministic Serialization**: Canonical JSON sorting prevents signature ambiguity.
- **Ed25519 Signatures (RFC 8032)**: Asymmetric digital signatures ensure authenticity and prevent guessing or forgery.
- **Batch Manifest Hash**: SHA-256 root digest covering all certificate hashes in a batch.
- **Append-Only Issuance Log**: Immutable monotonic sequence history recording every issue and revoke event.

### 3.4 🔍 Public Verification Portal (`/verify` & `/verify/[id]`)
Three unambiguous terminal states:

| State | Status Meaning | Public Display |
|---|---|---|
| ✅ **Verified** | ID + signature match authoritative registry | Displays recipient name, credential, issue date, issuer, and official PDF download. |
| 🚫 **Revoked** | Certificate was issued but officially withdrawn | Displays revocation timestamp, authorized signoff, and mandatory audit reason. |
| ❓ **Not Found** | ID or signature does not match registry or is forged | Clean tamper-evident error; zero database leakage to prevent enumeration attacks. |

- **Built-in Camera & Image QR Scanner**: Instantly scan printed certificates using webcam/phone camera or file drop.

### 3.5 📜 Institutional Audit Trail (`/audit`)
- **Authority Key Inspection**: View active Ed25519 Public Key and SHA-256 fingerprint.
- **Downloadable PEM Key**: Third parties can perform **100% offline verification** using standard OpenSSL tools without relying on LUMOS-CERTIFY servers.
- **Append-Only History**: Chronological event logs with SHA-256 record hashes.

---

## 4. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/verify?id={cert_id}&sig={signature}` | Public cryptographic verification API (rate-limited). |
| `GET` | `/api/batches` | List all issuance batches. |
| `POST` | `/api/batches` | Ingest validated CSV rows, sign, and create a new batch. |
| `GET` | `/api/batches/:id` | Fetch batch details and certificates. |
| `GET` | `/api/batches/:id/zip` | Download complete ZIP bundle (`.pdf` files + `batch-manifest.json` + `summary.csv`). |
| `GET` | `/api/certificates/:id/pdf` | Stream official PDF certificate with embedded QR. |
| `POST` | `/api/certificates/:id/revoke` | Revoke certificate with mandatory audit reason. |
| `GET` | `/api/templates` | List certificate layout templates. |
| `POST` | `/api/templates` | Save / update certificate layout template. |
| `GET` | `/api/audit` | Fetch append-only audit trail and public key information. |

---

## 5. Getting Started (Local Development)

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm 9+

### 1. Clone & Install
```bash
git clone https://github.com/kartikverma-dev/LUMOS-CERTIFY.git
cd LUMOS-CERTIFY
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the LUMOS-CERTIFY platform.

---

## 6. Deployment (Vercel)

LUMOS-CERTIFY is built on Next.js 15 (App Router) and is configured for seamless deployment to Vercel:

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete LUMOS-CERTIFY platform implementation"
   git push origin main
   ```
2. In your Vercel Dashboard, import `kartikverma-dev/LUMOS-CERTIFY`.
3. *(Optional)* Configure Environment Variables:
   - `LUMOS_ED25519_PRIVATE_KEY`: Custom PEM private key for production issuance.
   - `LUMOS_ED25519_PUBLIC_KEY`: Custom PEM public key.
   - `NEXT_PUBLIC_APP_URL`: Your custom production domain (e.g. `https://lumos-certify.vercel.app`).
4. Deploy! Vercel will build and host the application and serverless endpoints automatically.

---

## 7. Independent Offline Verification

To verify any certificate record offline without connecting to the server:

```bash
# 1. Construct canonical JSON string:
CANONICAL='{"batch_id":"BATCH-2026-001","cert_id":"CERT-2026-000001","credential":"Advanced Data Analysis","issue_date":"2026-09-14","recipient_name":"Asha Verma"}'

# 2. Verify with OpenSSL and the public key from /audit:
openssl pkeyutl -verify -pubin -inkey lumos_ed25519_public_key.pem -sigfile <(base64 -d <<< "$SIGNATURE") <<< "$CANONICAL"
```

---

*LUMOS-CERTIFY — "Let there be proof."*
