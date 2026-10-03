import { verifyCertificate } from '@/lib/verify';
import VerificationClient from './VerificationClient';

export const revalidate = 0;

export default async function CertificateVerifyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sig?: string }>;
}) {
  const { id } = await params;
  const { sig } = await searchParams;

  const result = await verifyCertificate(id, sig);

  return <VerificationClient result={result} queriedId={id} />;
}
