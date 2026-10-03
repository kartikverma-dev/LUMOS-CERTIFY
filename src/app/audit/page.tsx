import { getIssuanceLog } from '@/lib/db';
import { getSystemKeyPair } from '@/lib/crypto';
import AuditClient from './AuditClient';

export const revalidate = 0;

export default async function AuditPage() {
  const log = await getIssuanceLog();
  const { publicKey, keyFingerprint } = getSystemKeyPair();

  return (
    <AuditClient
      issuanceLog={log}
      publicKeyPem={publicKey}
      keyFingerprint={keyFingerprint}
    />
  );
}
