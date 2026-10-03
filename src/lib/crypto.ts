import crypto from 'node:crypto';

// In production, keys can be set via LUMOS_ED25519_PRIVATE_KEY and LUMOS_ED25519_PUBLIC_KEY.
// In development, we maintain a persistent keypair.
let cachedKeyPair: { publicKey: string; privateKey: string } | null = null;

// Built-in development Ed25519 Keypair (RFC 8410 PKCS#8 / SPKI)
// Generated for LUMOS-CERTIFY development and demo purposes.
const DEV_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIKU3B6b6l5fIeH2zS6+oK3w1f3NqU+F3r8pM2nB1yZ7T
-----END PRIVATE KEY-----`;

const DEV_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAi43t6iM7v+3mZ1yP4r9K8s5N2pQ3f0B7nO6lQ8x9y0E=
-----END PUBLIC KEY-----`;

export function getSystemKeyPair(): { publicKey: string; privateKey: string; keyFingerprint: string } {
  if (!cachedKeyPair) {
    const envPriv = process.env.LUMOS_ED25519_PRIVATE_KEY;
    const envPub = process.env.LUMOS_ED25519_PUBLIC_KEY;

    if (envPriv && envPub) {
      cachedKeyPair = {
        privateKey: envPriv.replace(/\\n/g, '\n'),
        publicKey: envPub.replace(/\\n/g, '\n'),
      };
    } else {
      // Use standard deterministic key or generate if needed
      try {
        // Validate dev key
        crypto.createPublicKey(DEV_PUBLIC_KEY_PEM);
        crypto.createPrivateKey(DEV_PRIVATE_KEY_PEM);
        cachedKeyPair = {
          privateKey: DEV_PRIVATE_KEY_PEM,
          publicKey: DEV_PUBLIC_KEY_PEM,
        };
      } catch {
        // Fallback: generate fresh pair
        const generated = crypto.generateKeyPairSync('ed25519', {
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        cachedKeyPair = {
          privateKey: generated.privateKey,
          publicKey: generated.publicKey,
        };
      }
    }
  }

  // Calculate SHA-256 fingerprint of the public key
  const fingerprint = crypto
    .createHash('sha256')
    .update(cachedKeyPair.publicKey)
    .digest('hex')
    .slice(0, 32)
    .toUpperCase();

  return {
    ...cachedKeyPair,
    keyFingerprint: fingerprint,
  };
}

/**
 * Creates a deterministic, canonical JSON representation of the certificate record.
 * Key fields are sorted and strictly formatted:
 * { batch_id, cert_id, credential, issue_date, recipient_name }
 */
export function createCanonicalPayload(data: {
  cert_id: string;
  recipient_name: string;
  credential: string;
  issue_date: string;
  batch_id: string;
}): string {
  // Sort keys alphabetically for canonical consistency
  const canonicalObj = {
    batch_id: String(data.batch_id).trim(),
    cert_id: String(data.cert_id).trim(),
    credential: String(data.credential).trim(),
    issue_date: String(data.issue_date).trim(),
    recipient_name: String(data.recipient_name).trim(),
  };

  return JSON.stringify(canonicalObj);
}

/**
 * Computes SHA-256 digest of canonical certificate string.
 */
export function hashCanonicalPayload(canonicalString: string): string {
  return crypto.createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}

/**
 * Signs the canonical payload with Ed25519 private key.
 * Output is URL-safe base64 string.
 */
export function signCanonicalPayload(canonicalString: string, privateKeyPem?: string): string {
  const { privateKey } = getSystemKeyPair();
  const keyToUse = privateKeyPem || privateKey;

  const data = Buffer.from(canonicalString, 'utf8');
  const signatureBuffer = crypto.sign(null, data, crypto.createPrivateKey(keyToUse));

  // Base64URL encoding (RFC 4648 §5) for clean URL parameters
  return signatureBuffer.toString('base64url');
}

/**
 * Cryptographically verifies an Ed25519 signature.
 */
export function verifySignature(
  canonicalString: string,
  signature: string,
  publicKeyPem?: string
): boolean {
  try {
    const { publicKey } = getSystemKeyPair();
    const keyToUse = publicKeyPem || publicKey;

    const data = Buffer.from(canonicalString, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'base64url');

    return crypto.verify(null, data, crypto.createPublicKey(keyToUse), signatureBuffer);
  } catch (err) {
    console.error('Signature verification error:', err);
    return false;
  }
}

/**
 * Calculates a Merkle-like Batch Manifest Hash covering all records in the batch.
 * If certificate hashes: [H1, H2, H3], calculates SHA-256(H1 + H2 + H3 + batch_id)
 */
export function calculateBatchManifestHash(batchId: string, certHashes: string[]): string {
  const sorted = [...certHashes].sort();
  const content = `${batchId}::${sorted.join('::')}`;
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Generates sequential certificate IDs: CERT-YYYY-NNNNNN
 */
export function generateCertificateId(sequenceNumber: number, year: number = new Date().getFullYear()): string {
  const padded = String(sequenceNumber).padStart(6, '0');
  return `CERT-${year}-${padded}`;
}
