import fs from 'node:fs';
import path from 'node:path';
import {
  Certificate,
  CertificateTemplate,
  Batch,
  IssuanceLogEntry,
} from './types';
import {
  createCanonicalPayload,
  hashCanonicalPayload,
  signCanonicalPayload,
  calculateBatchManifestHash,
} from './crypto';

interface DatabaseSchema {
  templates: CertificateTemplate[];
  batches: Batch[];
  certificates: Certificate[];
  issuanceLog: IssuanceLogEntry[];
  nextSequenceId: number;
}

const DEFAULT_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'template-voltaire-volt',
    name: 'Voltaire Obsidian & Electric Volt',
    description: 'Hyper-luxury obsidian design with high-voltage neon yellow accents, bold display typography, and tamper-evident QR seal.',
    width: 1056,
    height: 816,
    backgroundStyle: 'voltaire-volt',
    placeholders: [
      {
        id: 'v-inst',
        key: 'issuer_name',
        label: 'Issuing Authority',
        x: 50,
        y: 16,
        fontSize: 20,
        fontFamily: 'sans',
        fontWeight: 'bold',
        color: '#E2F952',
        textAlign: 'center',
        required: true,
        sampleValue: 'LUMOS AUTONOMOUS PROTOCOL',
      },
      {
        id: 'v-title',
        key: 'certificate_title',
        label: 'Accreditation Title',
        x: 50,
        y: 25,
        fontSize: 13,
        fontFamily: 'mono',
        fontWeight: 'normal',
        color: '#71717A',
        textAlign: 'center',
        required: false,
        sampleValue: 'CRYPTOGRAPHIC CERTIFICATE OF DISTINCTION',
      },
      {
        id: 'v-name',
        key: 'name',
        label: 'Recipient Name',
        x: 50,
        y: 38,
        fontSize: 38,
        fontFamily: 'sans',
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        required: true,
        sampleValue: 'Asha Verma',
      },
      {
        id: 'v-for',
        key: 'purpose_text',
        label: 'Conferral Statement',
        x: 50,
        y: 48,
        fontSize: 13,
        fontFamily: 'sans',
        fontWeight: 'normal',
        color: '#A1A1AA',
        textAlign: 'center',
        required: false,
        sampleValue: 'for rigorous completion and verifiable technical mastery in',
      },
      {
        id: 'v-cred',
        key: 'credential',
        label: 'Conferred Credential',
        x: 50,
        y: 57,
        fontSize: 26,
        fontFamily: 'sans',
        fontWeight: 'bold',
        color: '#E2F952',
        textAlign: 'center',
        required: true,
        sampleValue: 'Advanced Cryptographic Systems & Zero-Knowledge Architecture',
      },
      {
        id: 'v-date',
        key: 'issue_date',
        label: 'Issuance Date',
        x: 25,
        y: 78,
        fontSize: 12,
        fontFamily: 'mono',
        fontWeight: 'normal',
        color: '#71717A',
        textAlign: 'center',
        required: true,
        sampleValue: '2026-10-02',
      },
      {
        id: 'v-id',
        key: 'cert_id',
        label: 'Certificate Identifier',
        x: 50,
        y: 88,
        fontSize: 13,
        fontFamily: 'mono',
        fontWeight: 'bold',
        color: '#E2F952',
        textAlign: 'center',
        required: false,
        sampleValue: 'CERT-2026-000001',
      },
    ],
    qrConfig: {
      x: 82,
      y: 72,
      size: 110,
      darkColor: '#000000',
      lightColor: '#E2F952',
      includeLabel: true,
      label: 'TAMPER PROOF',
    },
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'template-executive-gold',
    name: 'Executive Distinction (Gold & Navy)',
    description: 'Prestigious corporate & executive certificate with gold geometric borders, serif typography, and cryptographic QR seal.',
    width: 1056,
    height: 816,
    backgroundStyle: 'executive-gold',
    placeholders: [
      {
        id: 'p-inst',
        key: 'issuer_name',
        label: 'Issuing Institution',
        x: 50,
        y: 18,
        fontSize: 22,
        fontFamily: 'serif',
        fontWeight: 'bold',
        color: '#D4AF37', // Gold
        textAlign: 'center',
        required: true,
        sampleValue: 'LUMOS ACADEMY OF ADVANCED COMPUTING',
      },
      {
        id: 'p-subtitle',
        key: 'certificate_title',
        label: 'Certificate Subtitle',
        x: 50,
        y: 26,
        fontSize: 14,
        fontFamily: 'sans',
        fontWeight: 'normal',
        color: '#94A3B8',
        textAlign: 'center',
        required: false,
        sampleValue: 'THIS CERTIFICATE OF ACHIEVEMENT IS PROUDLY CONFERRED UPON',
      },
      {
        id: 'p-name',
        key: 'name',
        label: 'Recipient Name',
        x: 50,
        y: 38,
        fontSize: 34,
        fontFamily: 'serif',
        fontWeight: 'bold',
        color: '#F8FAFC', // White
        textAlign: 'center',
        required: true,
        sampleValue: 'Asha Verma',
      },
      {
        id: 'p-for',
        key: 'purpose_text',
        label: 'Conferral Text',
        x: 50,
        y: 47,
        fontSize: 14,
        fontFamily: 'sans',
        fontWeight: 'normal',
        color: '#CBD5E1',
        textAlign: 'center',
        required: false,
        sampleValue: 'for outstanding mastery and verifiable completion of the professional curriculum in',
      },
      {
        id: 'p-cred',
        key: 'credential',
        label: 'Credential / Specialization',
        x: 50,
        y: 56,
        fontSize: 26,
        fontFamily: 'serif',
        fontWeight: 'bold',
        color: '#F59E0B', // Amber
        textAlign: 'center',
        required: true,
        sampleValue: 'Advanced Data Analysis & Statistical Modeling',
      },
      {
        id: 'p-date',
        key: 'issue_date',
        label: 'Date of Issuance',
        x: 25,
        y: 78,
        fontSize: 13,
        fontFamily: 'sans',
        fontWeight: 'normal',
        color: '#94A3B8',
        textAlign: 'center',
        required: true,
        sampleValue: '2026-09-14',
      },
      {
        id: 'p-id',
        key: 'cert_id',
        label: 'Certificate Identifier',
        x: 50,
        y: 88,
        fontSize: 12,
        fontFamily: 'mono',
        fontWeight: 'bold',
        color: '#64748B',
        textAlign: 'center',
        required: false,
        sampleValue: 'CERT-2026-000001',
      },
    ],
    qrConfig: {
      x: 82,
      y: 72,
      size: 110,
      darkColor: '#0F172A',
      lightColor: '#FFFFFF',
      includeLabel: true,
      label: 'SCAN TO VERIFY',
    },
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'template-tech-blue',
    name: 'Cybersecurity & Tech Honors (Obsidian & Cyan)',
    description: 'High-tech cryptographic design with obsidian background, cyan gridlines, and tamper-evident digital signature block.',
    width: 1056,
    height: 816,
    backgroundStyle: 'tech-blue',
    placeholders: [
      {
        id: 't-inst',
        key: 'issuer_name',
        label: 'Issuing Organization',
        x: 50,
        y: 16,
        fontSize: 20,
        fontFamily: 'mono',
        fontWeight: 'bold',
        color: '#38BDF8',
        textAlign: 'center',
        required: true,
        sampleValue: 'CYBER DEFENSE INSTITUTE',
      },
      {
        id: 't-title',
        key: 'certificate_title',
        label: 'Title',
        x: 50,
        y: 25,
        fontSize: 15,
        fontFamily: 'sans',
        fontWeight: 'normal',
        color: '#64748B',
        textAlign: 'center',
        required: false,
        sampleValue: 'VERIFIED CRYPTOGRAPHIC CERTIFICATION OF COMPETENCY',
      },
      {
        id: 't-name',
        key: 'name',
        label: 'Recipient Name',
        x: 50,
        y: 38,
        fontSize: 36,
        fontFamily: 'sans',
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        required: true,
        sampleValue: 'Rohan Iyer',
      },
      {
        id: 't-desc',
        key: 'purpose_text',
        label: 'Accreditation Statement',
        x: 50,
        y: 48,
        fontSize: 14,
        fontFamily: 'sans',
        fontWeight: 'normal',
        color: '#94A3B8',
        textAlign: 'center',
        required: false,
        sampleValue: 'has successfully demonstrated rigorous mastery in applied security protocols for',
      },
      {
        id: 't-cred',
        key: 'credential',
        label: 'Certification Title',
        x: 50,
        y: 57,
        fontSize: 26,
        fontFamily: 'sans',
        fontWeight: 'bold',
        color: '#06B6D4',
        textAlign: 'center',
        required: true,
        sampleValue: 'Advanced Cryptographic Security Engineer',
      },
      {
        id: 't-date',
        key: 'issue_date',
        label: 'Issue Date',
        x: 25,
        y: 78,
        fontSize: 13,
        fontFamily: 'mono',
        fontWeight: 'normal',
        color: '#94A3B8',
        textAlign: 'center',
        required: true,
        sampleValue: '2026-09-14',
      },
      {
        id: 't-id',
        key: 'cert_id',
        label: 'Certificate ID',
        x: 50,
        y: 88,
        fontSize: 13,
        fontFamily: 'mono',
        fontWeight: 'bold',
        color: '#0EA5E9',
        textAlign: 'center',
        required: false,
        sampleValue: 'CERT-2026-000002',
      },
    ],
    qrConfig: {
      x: 82,
      y: 72,
      size: 110,
      darkColor: '#082F49',
      lightColor: '#E0F2FE',
      includeLabel: true,
      label: 'VERIFY SIGNATURE',
    },
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'template-classic-crimson',
    name: 'Classic Academic Diploma (Ivory & Burgundy)',
    description: 'Timeless ivory parchment aesthetic with vintage burgundy ornamental border and engraved serif typography.',
    width: 1056,
    height: 816,
    backgroundStyle: 'classic-crimson',
    placeholders: [
      {
        id: 'c-inst',
        key: 'issuer_name',
        label: 'University / Academy',
        x: 50,
        y: 16,
        fontSize: 22,
        fontFamily: 'serif',
        fontWeight: 'bold',
        color: '#881337',
        textAlign: 'center',
        required: true,
        sampleValue: 'INSTITUTE OF HIGHER STUDIES',
      },
      {
        id: 'c-title',
        key: 'certificate_title',
        label: 'Diploma Title',
        x: 50,
        y: 25,
        fontSize: 14,
        fontFamily: 'serif',
        fontWeight: 'normal',
        color: '#4B5563',
        textAlign: 'center',
        required: false,
        sampleValue: 'BE IT KNOWN TO ALL PERSONS PRESENT THAT',
      },
      {
        id: 'c-name',
        key: 'name',
        label: 'Candidate Name',
        x: 50,
        y: 38,
        fontSize: 34,
        fontFamily: 'serif',
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        required: true,
        sampleValue: 'Elena Rostova',
      },
      {
        id: 'c-desc',
        key: 'purpose_text',
        label: 'Degree Statement',
        x: 50,
        y: 48,
        fontSize: 14,
        fontFamily: 'serif',
        fontWeight: 'normal',
        color: '#374151',
        textAlign: 'center',
        required: false,
        sampleValue: 'has fulfilled with distinction all the academic requirements for the graduation in',
      },
      {
        id: 'c-cred',
        key: 'credential',
        label: 'Awarded Degree',
        x: 50,
        y: 57,
        fontSize: 26,
        fontFamily: 'serif',
        fontWeight: 'bold',
        color: '#9F1239',
        textAlign: 'center',
        required: true,
        sampleValue: 'Cybersecurity Architecture & Systems',
      },
      {
        id: 'c-date',
        key: 'issue_date',
        label: 'Date of Graduation',
        x: 25,
        y: 78,
        fontSize: 13,
        fontFamily: 'serif',
        fontWeight: 'normal',
        color: '#4B5563',
        textAlign: 'center',
        required: true,
        sampleValue: '2026-09-20',
      },
      {
        id: 'c-id',
        key: 'cert_id',
        label: 'Diploma ID',
        x: 50,
        y: 88,
        fontSize: 12,
        fontFamily: 'mono',
        fontWeight: 'bold',
        color: '#4B5563',
        textAlign: 'center',
        required: false,
        sampleValue: 'CERT-2026-000003',
      },
    ],
    qrConfig: {
      x: 82,
      y: 72,
      size: 110,
      darkColor: '#4C0519',
      lightColor: '#FFF1F2',
      includeLabel: true,
      label: 'ACADEMIC VERIFICATION',
    },
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
  },
];

function getDatabaseFilePath(): string {
  // Use project data dir or /tmp in serverless environments
  const dir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, 'lumos_certify.json');
  } catch {
    // Fallback to /tmp if current working dir is read-only
    const tmpDir = '/tmp';
    return path.join(tmpDir, 'lumos_certify.json');
  }
}

let memoryDb: DatabaseSchema | null = null;

function seedInitialData(): DatabaseSchema {
  const seedBatchId = 'BATCH-2026-001';
  const seedBatchName = 'Cohort Alpha - Data Science & Security Fall 2026';
  const seedIssuer = 'Lumos Certify Authority';

  // Seed Certificate 1: Verified
  const cert1Payload = createCanonicalPayload({
    cert_id: 'CERT-2026-000001',
    recipient_name: 'Asha Verma',
    credential: 'Advanced Data Analysis',
    issue_date: '2026-09-14',
    batch_id: seedBatchId,
  });
  const cert1Hash = hashCanonicalPayload(cert1Payload);
  const cert1Sig = signCanonicalPayload(cert1Payload);

  // Seed Certificate 2: Verified
  const cert2Payload = createCanonicalPayload({
    cert_id: 'CERT-2026-000002',
    recipient_name: 'Rohan Iyer',
    credential: 'Advanced Data Analysis',
    issue_date: '2026-09-14',
    batch_id: seedBatchId,
  });
  const cert2Hash = hashCanonicalPayload(cert2Payload);
  const cert2Sig = signCanonicalPayload(cert2Payload);

  // Seed Certificate 3: Revoked (to demonstrate unambiguous Revoked state)
  const cert3Payload = createCanonicalPayload({
    cert_id: 'CERT-2026-000003',
    recipient_name: 'Devin Marcus',
    credential: 'Advanced Data Analysis',
    issue_date: '2026-09-14',
    batch_id: seedBatchId,
  });
  const cert3Hash = hashCanonicalPayload(cert3Payload);
  const cert3Sig = signCanonicalPayload(cert3Payload);

  const manifestHash = calculateBatchManifestHash(seedBatchId, [cert1Hash, cert2Hash, cert3Hash]);

  const cert1: Certificate = {
    cert_id: 'CERT-2026-000001',
    batch_id: seedBatchId,
    template_id: 'template-executive-gold',
    recipient_name: 'Asha Verma',
    recipient_email: 'asha@example.com',
    credential: 'Advanced Data Analysis',
    issue_date: '2026-09-14',
    issuer_name: seedIssuer,
    custom_fields: {},
    signature: cert1Sig,
    canonical_hash: cert1Hash,
    status: 'ACTIVE',
    created_at: '2026-09-14T09:00:00Z',
  };

  const cert2: Certificate = {
    cert_id: 'CERT-2026-000002',
    batch_id: seedBatchId,
    template_id: 'template-executive-gold',
    recipient_name: 'Rohan Iyer',
    recipient_email: 'rohan@example.com',
    credential: 'Advanced Data Analysis',
    issue_date: '2026-09-14',
    issuer_name: seedIssuer,
    custom_fields: {},
    signature: cert2Sig,
    canonical_hash: cert2Hash,
    status: 'ACTIVE',
    created_at: '2026-09-14T09:00:00Z',
  };

  const cert3: Certificate = {
    cert_id: 'CERT-2026-000003',
    batch_id: seedBatchId,
    template_id: 'template-executive-gold',
    recipient_name: 'Devin Marcus',
    recipient_email: 'devin@example.com',
    credential: 'Advanced Data Analysis',
    issue_date: '2026-09-14',
    issuer_name: seedIssuer,
    custom_fields: {},
    signature: cert3Sig,
    canonical_hash: cert3Hash,
    status: 'REVOKED',
    revocation: {
      revoked_at: '2026-09-25T14:30:00Z',
      reason: 'Academic integrity violation identified during post-issuance review (Course Policy §4.2).',
      revoked_by: 'Academic Review Committee',
    },
    created_at: '2026-09-14T09:00:00Z',
  };

  const batch: Batch = {
    id: seedBatchId,
    name: seedBatchName,
    template_id: 'template-executive-gold',
    template_name: 'Executive Distinction (Gold & Navy)',
    issuer_name: seedIssuer,
    total_certificates: 3,
    manifest_hash: manifestHash,
    created_at: '2026-09-14T09:00:00Z',
    status: 'COMPLETED',
  };

  const issuanceLog: IssuanceLogEntry[] = [
    {
      sequence_id: 1,
      cert_id: 'CERT-2026-000001',
      batch_id: seedBatchId,
      event_type: 'ISSUED',
      canonical_hash: cert1Hash,
      signature: cert1Sig,
      issuer: seedIssuer,
      timestamp: '2026-09-14T09:00:00Z',
      details: { recipient_name: 'Asha Verma', credential: 'Advanced Data Analysis' },
    },
    {
      sequence_id: 2,
      cert_id: 'CERT-2026-000002',
      batch_id: seedBatchId,
      event_type: 'ISSUED',
      canonical_hash: cert2Hash,
      signature: cert2Sig,
      issuer: seedIssuer,
      timestamp: '2026-09-14T09:00:01Z',
      details: { recipient_name: 'Rohan Iyer', credential: 'Advanced Data Analysis' },
    },
    {
      sequence_id: 3,
      cert_id: 'CERT-2026-000003',
      batch_id: seedBatchId,
      event_type: 'ISSUED',
      canonical_hash: cert3Hash,
      signature: cert3Sig,
      issuer: seedIssuer,
      timestamp: '2026-09-14T09:00:02Z',
      details: { recipient_name: 'Devin Marcus', credential: 'Advanced Data Analysis' },
    },
    {
      sequence_id: 4,
      cert_id: 'CERT-2026-000003',
      batch_id: seedBatchId,
      event_type: 'REVOKED',
      canonical_hash: cert3Hash,
      issuer: 'Academic Review Committee',
      timestamp: '2026-09-25T14:30:00Z',
      details: {
        reason: 'Academic integrity violation identified during post-issuance review (Course Policy §4.2).',
      },
    },
  ];

  return {
    templates: DEFAULT_TEMPLATES,
    batches: [batch],
    certificates: [cert1, cert2, cert3],
    issuanceLog,
    nextSequenceId: 5,
  };
}

function loadDb(): DatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  const filePath = getDatabaseFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      // Ensure default templates exist & merge any newly added defaults
      if (!parsed.templates || parsed.templates.length === 0) {
        parsed.templates = [...DEFAULT_TEMPLATES];
      } else {
        for (const defTpl of DEFAULT_TEMPLATES) {
          if (!parsed.templates.some((t: CertificateTemplate) => t.id === defTpl.id)) {
            parsed.templates.unshift(defTpl);
          }
        }
      }
      memoryDb = parsed;
      return memoryDb!;
    }
  } catch (err) {
    console.warn('Could not read existing database file, initializing seed data:', err);
  }

  memoryDb = seedInitialData();
  saveDb(memoryDb);
  return memoryDb;
}

function saveDb(data: DatabaseSchema): void {
  memoryDb = data;
  try {
    const filePath = getDatabaseFilePath();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('Warning: Could not write database to disk (in-memory mode):', err);
  }
}

// ----------------- Public Database Operations -----------------

export async function getTemplates(): Promise<CertificateTemplate[]> {
  const db = loadDb();
  return db.templates;
}

export async function getTemplateById(id: string): Promise<CertificateTemplate | null> {
  const db = loadDb();
  return db.templates.find((t) => t.id === id) || null;
}

export async function saveTemplate(template: CertificateTemplate): Promise<CertificateTemplate> {
  const db = loadDb();
  const existingIdx = db.templates.findIndex((t) => t.id === template.id);
  if (existingIdx >= 0) {
    db.templates[existingIdx] = {
      ...template,
      updatedAt: new Date().toISOString(),
    };
  } else {
    db.templates.push(template);
  }
  saveDb(db);
  return template;
}

export async function getBatches(): Promise<Batch[]> {
  const db = loadDb();
  return [...db.batches].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getBatchById(id: string): Promise<Batch | null> {
  const db = loadDb();
  return db.batches.find((b) => b.id === id) || null;
}

export async function getCertificatesByBatchId(batchId: string): Promise<Certificate[]> {
  const db = loadDb();
  return db.certificates.filter((c) => c.batch_id === batchId);
}

export async function getCertificateById(certId: string): Promise<Certificate | null> {
  const db = loadDb();
  const normalized = certId.trim().toUpperCase();
  return db.certificates.find((c) => c.cert_id.toUpperCase() === normalized) || null;
}

export async function getAllCertificates(): Promise<Certificate[]> {
  const db = loadDb();
  return [...db.certificates].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getIssuanceLog(): Promise<IssuanceLogEntry[]> {
  const db = loadDb();
  return [...db.issuanceLog].sort((a, b) => b.sequence_id - a.sequence_id);
}

export async function getNextCertificateIndex(): Promise<number> {
  const db = loadDb();
  return db.certificates.length + 1;
}

/**
 * Persists a new batch of certificates and appends to the immutable issuance log.
 */
export async function createBatchWithCertificates(
  batch: Batch,
  certificates: Certificate[]
): Promise<{ batch: Batch; certificates: Certificate[] }> {
  const db = loadDb();

  db.batches.push(batch);

  let seq = db.nextSequenceId;
  const newLogEntries: IssuanceLogEntry[] = [];

  for (const cert of certificates) {
    db.certificates.push(cert);

    newLogEntries.push({
      sequence_id: seq++,
      cert_id: cert.cert_id,
      batch_id: cert.batch_id,
      event_type: 'ISSUED',
      canonical_hash: cert.canonical_hash,
      signature: cert.signature,
      issuer: cert.issuer_name,
      timestamp: cert.created_at,
      details: {
        recipient_name: cert.recipient_name,
        recipient_email: cert.recipient_email,
        credential: cert.credential,
      },
    });
  }

  db.nextSequenceId = seq;
  db.issuanceLog.push(...newLogEntries);

  saveDb(db);
  return { batch, certificates };
}

/**
 * Revokes a certificate in the registry and records an immutable revocation entry in the issuance log.
 */
export async function revokeCertificate(
  certId: string,
  reason: string,
  revokedBy: string = 'System Administrator'
): Promise<Certificate | null> {
  const db = loadDb();
  const cert = db.certificates.find((c) => c.cert_id.toUpperCase() === certId.trim().toUpperCase());

  if (!cert) {
    return null;
  }

  if (cert.status === 'REVOKED') {
    return cert; // Already revoked
  }

  const timestamp = new Date().toISOString();
  cert.status = 'REVOKED';
  cert.revocation = {
    revoked_at: timestamp,
    reason: reason.trim(),
    revoked_by: revokedBy.trim(),
  };

  // Append to immutable issuance log
  db.issuanceLog.push({
    sequence_id: db.nextSequenceId++,
    cert_id: cert.cert_id,
    batch_id: cert.batch_id,
    event_type: 'REVOKED',
    canonical_hash: cert.canonical_hash,
    issuer: revokedBy,
    timestamp,
    details: {
      reason: reason.trim(),
      previous_status: 'ACTIVE',
    },
  });

  saveDb(db);
  return cert;
}

/**
 * System-wide statistics for dashboard
 */
export async function getDashboardStats(): Promise<{
  totalIssued: number;
  activeCertificates: number;
  revokedCertificates: number;
  totalBatches: number;
  totalTemplates: number;
}> {
  const db = loadDb();
  const totalIssued = db.certificates.length;
  const revoked = db.certificates.filter((c) => c.status === 'REVOKED').length;
  const active = totalIssued - revoked;

  return {
    totalIssued,
    activeCertificates: active,
    revokedCertificates: revoked,
    totalBatches: db.batches.length,
    totalTemplates: db.templates.length,
  };
}
