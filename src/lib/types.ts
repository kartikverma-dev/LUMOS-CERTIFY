export interface PlaceholderConfig {
  id: string;
  key: string; // e.g. "name", "credential", "issue_date", "cert_id", "issuer_name"
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  fontSize: number; // in pt / px
  fontFamily: 'serif' | 'sans' | 'mono';
  fontWeight: 'normal' | 'bold' | '600';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  required: boolean;
  sampleValue: string;
}

export interface QrConfig {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number; // size in percentage or px
  darkColor: string;
  lightColor: string;
  includeLabel: boolean;
  label: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  width: number; // 1056 = standard A4 / US Letter landscape at 72/96dpi
  height: number; // 816
  backgroundStyle: 'executive-gold' | 'tech-blue' | 'classic-crimson' | 'modern-emerald' | 'custom';
  customBackgroundData?: string; // base64 or URL
  placeholders: PlaceholderConfig[];
  qrConfig: QrConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateRevocation {
  revoked_at: string;
  reason: string;
  revoked_by: string;
}

export interface Certificate {
  cert_id: string; // e.g. CERT-2026-000001
  batch_id: string;
  template_id: string;
  recipient_name: string;
  recipient_email: string;
  credential: string;
  issue_date: string;
  issuer_name: string;
  custom_fields: Record<string, string>;
  signature: string; // Ed25519 signature
  canonical_hash: string; // SHA-256 of canonical payload
  status: 'ACTIVE' | 'REVOKED';
  revocation?: CertificateRevocation;
  created_at: string;
}

export interface Batch {
  id: string; // e.g. BATCH-2026-001
  name: string;
  template_id: string;
  template_name: string;
  issuer_name: string;
  total_certificates: number;
  manifest_hash: string; // SHA-256 root digest of all cert records
  created_at: string;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED';
}

export interface IssuanceLogEntry {
  sequence_id: number;
  cert_id: string;
  batch_id: string;
  event_type: 'ISSUED' | 'REVOKED';
  canonical_hash: string;
  signature?: string;
  issuer: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export type VerificationState = 'VERIFIED' | 'REVOKED' | 'NOT_FOUND';

export interface VerificationResult {
  state: VerificationState;
  cert_id?: string;
  recipient_name?: string;
  credential?: string;
  issue_date?: string;
  issuer_name?: string;
  batch_id?: string;
  issued_at?: string;
  revoked_at?: string;
  revocation_reason?: string;
  canonical_hash?: string;
  signature?: string;
  signature_valid?: boolean;
  verification_timestamp: string;
  error_message?: string;
}

export interface CsvValidationRow {
  rowNumber: number;
  data: Record<string, string>;
  isValid: boolean;
  errors: string[];
}

export interface CsvValidationResult {
  totalRows: number;
  validRows: CsvValidationRow[];
  invalidRows: CsvValidationRow[];
  duplicateRows: CsvValidationRow[];
  detectedColumns: string[];
  missingRequiredColumns: string[];
  isValid: boolean;
}
