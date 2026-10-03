import Link from 'next/link';
import { PlusCircle, Download, ExternalLink } from 'lucide-react';
import { getBatches } from '@/lib/db';

export const revalidate = 0;

export default async function BatchesPage() {
  const batches = await getBatches();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <span>REGISTRY</span>
            <span>•</span>
            <span>BATCH AUDIT ARCHIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
            Issuance Batches
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Historical batches signed with Ed25519 and sealed with cryptographic batch manifest hashes.
          </p>
        </div>

        <Link
          href="/batches/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4 stroke-[2.5]" />
          <span>Issue New Batch</span>
        </Link>
      </div>

      {/* Batches Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="px-5 py-3.5">Batch Identifier</th>
                <th className="px-5 py-3.5">Batch Name</th>
                <th className="px-5 py-3.5">Template</th>
                <th className="px-5 py-3.5">Certificates</th>
                <th className="px-5 py-3.5">Batch Manifest Hash</th>
                <th className="px-5 py-3.5">Issued At</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-amber-300">
                    <Link href={`/batches/${batch.id}`} className="hover:underline">
                      {batch.id}
                    </Link>
                  </td>
                  <td className="px-5 py-4 font-medium text-slate-100 max-w-[220px]">
                    <Link href={`/batches/${batch.id}`} className="hover:text-amber-300 transition-colors">
                      {batch.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {batch.template_name}
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-200">
                    <span className="rounded bg-slate-800 px-2 py-0.5 border border-slate-700">
                      {batch.total_certificates}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-cyan-400 text-[11px]">
                    <span title={batch.manifest_hash}>
                      {batch.manifest_hash.slice(0, 14)}...
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 text-[11px]">
                    {new Date(batch.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/batches/${batch.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3 text-cyan-400" />
                        <span>Inspect</span>
                      </Link>
                      <a
                        href={`/api/batches/${batch.id}/zip`}
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1.5 text-xs font-medium transition-colors"
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
