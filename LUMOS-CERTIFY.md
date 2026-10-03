# LUMOS-CERTIFY

**Verifiable QR-Code Certificate Issuance Platform**

*Project Blueprint — v1.0, 2026-10-02*

---

## 1. Overview

LUMOS-CERTIFY is a system for issuing digital certificates in bulk that can be independently
verified by anyone, anywhere, via a QR code printed on the certificate.

A certificate is only trustworthy if verification is **cryptographic**, not just a lookup.
The core design principle of LUMOS-CERTIFY: **every certificate carries a signed,
tamper-evident identity**, and verification never trusts data from the QR payload itself.

---

## 2. Goals & Non-Goals

### Goals
- Upload a custom certificate template (PDF/PNG background) with drag-and-drop placeholders.
- Upload a CSV file to issue certificates in bulk.
- Each rendered certificate contains a unique QR code linking to a public verify page.
- Verification returns one of three unambiguous states: **Verified / Revoked / Not Found**.
- Full issuance audit trail suitable for legal/institutional weight.

### Non-Goals (v1)
- Blockchain anchoring (optional future phase).
- Third-party identity verification of recipients (the platform trusts the issuer).

---

## 3. System Architecture

```
┌──────────────┐   ┌──────────────────┐   ┌─────────────────┐
│  Template     │──▶│  Template Store  │──▶│  Renderer        │
│  Designer     │   │  (layout JSON)   │   │  (PDF + QR)      │
└──────────────┘   └──────────────────┘   └────────┬────────┘
                                                    │
┌──────────────┐   ┌──────────────────┐   ┌────────▼────────┐
│  CSV Upload   │──▶│  Validation &    │──▶│  Batch Queue     │
│  (recipients) │   │  Row Checker     │   │  (worker)        │
└──────────────┘   └──────────────────┘   └────────┬────────┘
                                                    │
                              ┌─────────────────────▼─────────────┐
                              │  Issuance Core                    │
                              │  • cert_id generation             │
                              │  • Ed25519 / HMAC-SHA256 signing  │
                              │  • revocation registry            │
                              │  • append-only issuance log       │
                              └───────────────┬─────────────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    │                         │                         │
              ┌─────▼─────┐            ┌──────▼──────┐          ┌───────▼──────┐
              │  Storage   │            │  Public     │          │  Delivery    │
              │  (PDFs,    │            │  Verify API │          │  (email,     │
              │  zips)     │            │  + Web Page │          │  zip bundle) │
              └───────────┘            └─────────────┘          └──────────────┘
```

### Suggested Stack
| Layer | Choice |
|---|---|
| App framework | Next.js (Node) **or** FastAPI (Python) |
| Database | PostgreSQL |
| File storage | S3-compatible (rendered PDFs, template backgrounds, zip bundles) |
| Queue / batch jobs | BullMQ (Node) or Celery (Python) |
| Rendering | `qrcode` + `pdf-lib` / `sharp` |
| Signing | Ed25519 preferred; HMAC-SHA256 as lighter alternative |
| Hosting | Any VPS or cloud (verify endpoint should be fast + cached at edge) |

---

## 4. Modules

### 4.1 Template Designer
- Upload a PDF or PNG certificate background.
- Drag placeholders onto the layout: `{{name}}`, `{{course}}`, `{{date}}`, `{{cert_id}}`.
- Position the QR code block (fixed corner recommended — bottom-right is standard).
- Layout saved as JSON: background asset ID, placeholder coordinates, fonts, QR box.

### 4.2 CSV Ingestion
- Dedicated, documented CSV format — one row per recipient.
- Columns are validated **against the active template's placeholders before generation begins**.
- Bad rows are reported with exact row numbers; nothing is silently skipped.
- Duplicate detection (same email + same credential in one batch) is blocked.

**Reference CSV format:**
```csv
name,credential,issue_date,email
Asha Verma,Advanced Data Analysis,2026-09-14,asha@example.com
Rohan Iyer,Advanced Data Analysis,2026-09-14,rohan@example.com
```

### 4.3 QR Code & Verification
- Each certificate gets a unique ID: `CERT-YYYY-NNNNNN` (sequential, non-guessable enough
  when combined with signature).
- QR encodes:
  ```
  https://lumos-certify.example.com/verify/CERT-2026-0001?sig=<signature>
  ```
- The `sig` parameter is the cryptographic anchor. A copied or guessed QR fails verification
  even if the ID exists in the registry.

### 4.4 Issuance Engine
1. Generate `cert_id` per row.
2. Sign the canonical record (cert_id + recipient + credential + issue_date + batch_id).
3. Render PDF with template layout + QR.
4. Store PDF in object storage.
5. Write record to **append-only issuance log** with issuer identity and timestamp.
6. Emit batch manifest hash covering all records in the batch.
7. Deliver: per-recipient email links and/or a single ZIP download.

---

## 5. Verification Page (Public)

Three terminal states, deliberately unambiguous:

| State | Meaning | Display |
|---|---|---|
| ✅ **Verified** | ID + signature match the registry | Show recipient, credential, issue date |
| 🚫 **Revoked** | Certificate was issued but later withdrawn | Show revocation date + issuer note |
| ❓ **Not Found** | ID or signature does not match anything | Generic message — no detail leaks |

**Key rule:** the page renders certificate details **from the server registry only**,
never from URL/QR parameters. The QR's job is to *address* the record, not to *carry* it.

**Hardening:**
- Rate-limit the verify endpoint.
- No registry enumeration endpoint (no "list all certs").
- CAPTCHA after repeated failures.

---

## 6. Trust Model & Security Design

1. **Sign, don't just ID.** A plain sequential ID is forgeable. Every certificate record is
   signed (Ed25519 recommended; HMAC-SHA256 server-side acceptable for closed deployments).
2. **Revocation from day one.** Mistakes happen. "Revoked" must read differently from
   "never existed."
3. **Batch integrity.** Every batch gets a manifest hash + issuer identity + timestamp.
   The audit trail is the product — it is what gives the certificates institutional weight.
4. **Append-only log.** Issuance records are never updated or deleted; corrections happen
   via revocation + reissue, preserving history.
5. **Verification endpoint hygiene.** Rate-limited, un-enumerable, detail-free on failure.

---

## 7. Roadmap

### Phase 1 — Core (this blueprint)
- Template designer, CSV ingestion, QR signing, PDF rendering, verify page, ZIP delivery.

### Phase 2 — Operations
- Email delivery with per-recipient links.
- Bulk revoke via CSV.
- Resend / reissue flow.

### Phase 3 — Extras
- Apple / Google Wallet passes.
- Verification widget embeddable in third-party sites.
- Optional transparency-log anchoring (e.g., append-only public log).

---

## 8. Directory / Naming Conventions (proposal)

```
lumos-certify/
├── app/                  # web app
│   ├── templates/        # template designer
│   ├── batches/          # CSV upload & batch status
│   └── verify/           # public verification page
├── workers/              # rendering & signing queue
├── core/
│   ├── signing.py        # Ed25519 / HMAC signing
│   ├── registry.py       # issuance log + revocation
│   └── render.py         # PDF + QR rendering
└── docs/
    └── LUMOS-CERTIFY.md  # this document
```

---

*LUMOS-CERTIFY — "Let there be proof."*
