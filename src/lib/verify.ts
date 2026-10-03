import { getCertificateById } from './db';
import {
  createCanonicalPayload,
  hashCanonicalPayload,
  verifySignature,
} from './crypto';
import { VerificationResult } from './types';

/**
 * Public Verification Engine.
 *
 * Core rule from Blueprint §5:
 * The page and API render certificate details FROM THE SERVER REGISTRY ONLY,
 * never from URL/QR parameters. The QR's job is to address the record, not carry it.
 *
 * Three unambiguous states:
 * - VERIFIED: ID + signature match the registry and cryptographically verify.
 * - REVOKED: Certificate exists and signature is valid, but record was revoked.
 * - NOT_FOUND: ID not found, signature invalid, or tampering detected. Generic message — no detail leaks.
 */
export async function verifyCertificate(
  certId: string,
  signature?: string
): Promise<VerificationResult> {
  const verificationTimestamp = new Date().toISOString();

  if (!certId) {
    return {
      state: 'NOT_FOUND',
      verification_timestamp: verificationTimestamp,
      error_message: 'Certificate identifier is required.',
    };
  }

  // 1. Fetch certificate from registry
  const cert = await getCertificateById(certId);

  // If not found in registry -> NOT_FOUND (no details leaked)
  if (!cert) {
    return {
      state: 'NOT_FOUND',
      verification_timestamp: verificationTimestamp,
      error_message: 'Certificate not found or verification credentials invalid.',
    };
  }

  // 2. Re-create canonical string from server-side registry data
  const canonicalPayload = createCanonicalPayload({
    cert_id: cert.cert_id,
    recipient_name: cert.recipient_name,
    credential: cert.credential,
    issue_date: cert.issue_date,
    batch_id: cert.batch_id,
  });

  // Verify hash integrity
  const computedHash = hashCanonicalPayload(canonicalPayload);
  if (computedHash !== cert.canonical_hash) {
    console.error(`Hash mismatch for ${certId}: computed ${computedHash} vs stored ${cert.canonical_hash}`);
    return {
      state: 'NOT_FOUND',
      verification_timestamp: verificationTimestamp,
      error_message: 'Certificate integrity check failed.',
    };
  }

  // 3. Cryptographically verify the Ed25519 signature
  let isSignatureValid = false;

  if (signature) {
    // If a signature is supplied, it MUST match the certificate signature and verify cryptographically
    isSignatureValid = verifySignature(canonicalPayload, signature);
    if (!isSignatureValid || signature !== cert.signature) {
      // Forged or copied/guessed signature fails verification
      return {
        state: 'NOT_FOUND',
        verification_timestamp: verificationTimestamp,
        error_message: 'Cryptographic signature mismatch or verification failed.',
      };
    }
  } else {
    // Internal signature check
    isSignatureValid = verifySignature(canonicalPayload, cert.signature);
  }

  // 4. Check revocation status (Blueprint: "Revoked must read differently from never existed")
  if (cert.status === 'REVOKED') {
    return {
      state: 'REVOKED',
      cert_id: cert.cert_id,
      recipient_name: cert.recipient_name,
      credential: cert.credential,
      issue_date: cert.issue_date,
      issuer_name: cert.issuer_name,
      batch_id: cert.batch_id,
      issued_at: cert.created_at,
      revoked_at: cert.revocation?.revoked_at,
      revocation_reason: cert.revocation?.reason || 'Certificate was revoked by the issuing authority.',
      canonical_hash: cert.canonical_hash,
      signature: cert.signature,
      signature_valid: isSignatureValid,
      verification_timestamp: verificationTimestamp,
    };
  }

  // 5. Success: VERIFIED
  return {
    state: 'VERIFIED',
    cert_id: cert.cert_id,
    recipient_name: cert.recipient_name,
    credential: cert.credential,
    issue_date: cert.issue_date,
    issuer_name: cert.issuer_name,
    batch_id: cert.batch_id,
    issued_at: cert.created_at,
    canonical_hash: cert.canonical_hash,
    signature: cert.signature,
    signature_valid: isSignatureValid,
    verification_timestamp: verificationTimestamp,
  };
}
