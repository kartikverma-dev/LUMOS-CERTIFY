import Link from 'next/link';
import { PlusCircle, Download, ExternalLink } from 'lucide-react';
import { getBatches } from '@/lib/db';

export const revalidate = 0;

export default async function BatchesPage() {
  const batches = await getBatches();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-[2px] bg-[#E2F952]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#E2F952]">
              REGISTRY ARCHIVE
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
            Issuance Batches
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">
            Historical batches signed with Ed25519 and sealed with cryptographic SHA-256 batch manifest roots.
          </p>
        </div>

        <Link
          href="/batches/new"
          className="btn-volt inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4 stroke-[2.5]" />
          <span>Issue New Batch</span>
        </Link>
      </div>

      {/* Batches Table */}
      <div className="rounded-3xl border border-white/10 bg-[#111111] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-black/50 text-zinc-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="px-6 py-4">Batch Identifier</th>
                <th className="px-6 py-4">Batch Name</th>
                <th className="px-6 py-4">Template</th>
                <th className="px-6 py-4">Certificates</th>
                <th className="px-6 py-4">Batch Manifest Hash</th>
                <th className="px-6 py-4">Issued At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4.5 font-mono font-bold text-[#E2F952]">
                    <Link href={`/batches/${batch.id}`} className="hover:underline">
                      {batch.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4.5 font-display font-semibold text-white max-w-[220px]">
                    <Link href={`/batches/${batch.id}`} className="hover:text-[#E2F952] transition-colors">
                      {batch.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4.5 text-zinc-400">
                    {batch.template_name}
                  </td>
                  <td className="px-6 py-4.5 font-mono text-white">
                    <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                      {batch.total_certificates}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 font-mono text-[#E2F952] text-[11px]">
                    <span title={batch.manifest_hash}>
                      {batch.manifest_hash.slice(0, 14)}...
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-zinc-400 text-[11px]">
                    {new Date(batch.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/batches/${batch.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 text-xs text-white transition-colors"
                      >
                        <ExternalLink className="h-3 w-3 text-[#E2F952]" />
                        <span>Inspect</span>
                      </Link>
                      <a
                        href={`/api/batches/${batch.id}/zip`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#E2F952]/10 hover:bg-[#E2F952]/20 text-[#E2F952] border border-[#E2F952]/30 px-3 py-1 text-xs font-semibold transition-colors"
                        title="Download ZIP package"
                      >
                        <Download className="h-3 w-3" />
                        <span>ZIP</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
