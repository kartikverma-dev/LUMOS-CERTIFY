import { NextResponse } from 'next/server';
import { getIssuanceLog } from '@/lib/db';
import { getSystemKeyPair } from '@/lib/crypto';

export async function GET() {
  const log = await getIssuanceLog();
  const { publicKey, keyFingerprint } = getSystemKeyPair();

  return NextResponse.json({
    issuanceLog: log,
    cryptographicIdentity: {
      algorithm: 'Ed25519 (Edwards-curve Digital Signature Algorithm, RFC 8032)',
      hashAlgorithm: 'SHA-256 (FIPS 180-4)',
      publicKeyPem: publicKey,
      keyFingerprint,
      trustModel: 'Asymmetric Cryptographic Anchor with Canonical Payload Hashing',
    },
  });
}
