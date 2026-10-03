import { notFound } from 'next/navigation';
import { getBatchById, getCertificatesByBatchId } from '@/lib/db';
import BatchDetailClient from './BatchDetailClient';

export const revalidate = 0;

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const batch = await getBatchById(id);

  if (!batch) {
    notFound();
  }

  const certificates = await getCertificatesByBatchId(id);

  return (
    <BatchDetailClient
      initialBatch={batch}
      initialCertificates={certificates}
    />
  );
}
