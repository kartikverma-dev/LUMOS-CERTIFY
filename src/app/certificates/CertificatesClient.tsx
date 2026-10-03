'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Download,
  ExternalLink,
  ShieldAlert,
  X,
  Loader2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Certificate } from '@/lib/types';
import BadgeStatus from '@/components/BadgeStatus';

interface CertificatesClientProps {
  initialCertificates: Certificate[];
}

export default function CertificatesClient({
  initialCertificates,
}: CertificatesClientProps) {
  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'REVOKED'>('ALL');

  // Revocation state
  const [revokingCert, setRevokingCert] = useState<Certificate | null>(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [revokedBy, setRevokedBy] = useState('System Administrator');
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const filteredCerts = certificates.filter((cert) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      cert.cert_id.toLowerCase().includes(q) ||
      cert.recipient_name.toLowerCase().includes(q) ||
      cert.recipient_email.toLowerCase().includes(q) ||
      cert.credential.toLowerCase().includes(q) ||
      cert.batch_id.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'ALL' || cert.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRevokeSubmit = async () => {
    if (!revokingCert) return;
    if (!revocationReason.trim()) {
      setRevokeError('A mandatory reason is required for legal and institutional compliance.');
      return;
    }

    setIsRevoking(true);
    setRevokeError(null);

    try {
      const response = await fetch(`/api/certificates/${revokingCert.cert_id}/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: revocationReason.trim(),
          revokedBy: revokedBy.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Revocation failed.');
      }

      setCertificates((prev) =>
        prev.map((c) => (c.cert_id === revokingCert.cert_id ? data.certificate : c))
      );
      setRevokingCert(null);
      setRevocationReason('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Revocation failed.';
      setRevokeError(msg);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-[2px] bg-[#E2F952]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#E2F952]">
            REGISTRY LEDGER
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
          Certificate Registry
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl">
          Search and manage issued certificates, audit canonical signatures, and execute instant revocations.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Cert ID, Recipient Name, Email, or Credential..."
            className="w-full rounded-full border border-white/10 bg-[#111111] pl-11 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:border-[#E2F952] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500 hidden sm:block" />
          <div className="flex rounded-full border border-white/10 bg-[#111111] p-1 text-xs">
            {(['ALL', 'ACTIVE', 'REVOKED'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setStatusFilter(mode)}
                className={`px-4 py-1.5 rounded-full font-semibold transition-all ${
                  statusFilter === mode
                    ? 'bg-[#E2F952] text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {mode === 'ALL' ? 'All' : mode === 'ACTIVE' ? 'Active' : 'Revoked'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/10 bg-[#111111] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-black/50 text-zinc-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="px-6 py-4">Certificate ID</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Credential</th>
                <th className="px-6 py-4">Batch</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {filteredCerts.length > 0 ? (
                filteredCerts.map((cert) => (
                  <tr key={cert.cert_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4.5 font-mono font-bold text-[#E2F952]">
                      {cert.cert_id}
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="font-semibold text-white">{cert.recipient_name}</div>
                      <div className="text-[11px] font-mono text-zinc-400">{cert.recipient_email}</div>
                    </td>
                    <td className="px-6 py-4.5 text-zinc-200 max-w-[220px] truncate">
                      {cert.credential}
                    </td>
                    <td className="px-6 py-4.5 font-mono text-[11px] text-zinc-400">
                      <Link href={`/batches/${cert.batch_id}`} className="hover:text-[#E2F952] underline">
                        {cert.batch_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4.5">
                      <BadgeStatus status={cert.status} />
                    </td>
                    <td className="px-6 py-4.5 font-mono text-zinc-400 text-[11px]">
                      {cert.issue_date}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/verify/${cert.cert_id}?sig=${encodeURIComponent(cert.signature)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 text-[11px] text-white transition-colors"
                          title="Verify on public portal"
                        >
                          <ExternalLink className="h-3 w-3 text-[#E2F952]" />
                          <span>Verify</span>
                        </Link>
                        <a
                          href={`/api/certificates/${cert.cert_id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 text-[11px] text-white transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-3 w-3 text-[#E2F952]" />
                          <span>PDF</span>
                        </a>

                        {cert.status === 'ACTIVE' && (
                          <button
                            onClick={() => setRevokingCert(cert)}
                            className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3 py-1 text-[11px] text-rose-300 transition-colors"
                            title="Revoke certificate"
                          >
                            <ShieldAlert className="h-3 w-3 text-rose-400" />
                            <span>Revoke</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500 text-xs">
                    No certificates match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revocation Modal */}
      {revokingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-rose-500/40 bg-[#111111] p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-rose-400 font-display font-bold text-lg">
                <ShieldAlert className="h-5 w-5" />
                <span>Revoke Certificate: {revokingCert.cert_id}</span>
              </div>
              <button
                onClick={() => setRevokingCert(null)}
                className="rounded-full p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-rose-950/30 border border-rose-800/40 p-4 text-xs text-rose-200 leading-relaxed">
              <strong>Audit Notice:</strong> Revoking a certificate cannot be undone. It is logged in the append-only ledger and marks verification as &quot;REVOKED&quot;.
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                  Recipient &amp; Credential
                </label>
                <div className="rounded-xl bg-black p-3 font-mono text-zinc-200 border border-white/10">
                  {revokingCert.recipient_name} — {revokingCert.credential}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                  Revocation Reason *
                </label>
                <textarea
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  rows={3}
                  placeholder="State the institutional reason for withdrawing this credential..."
                  className="w-full rounded-xl border border-white/10 bg-black p-3 text-white placeholder-zinc-600 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-mono text-[10px] uppercase mb-1">
                  Revoking Authority
                </label>
                <input
                  type="text"
                  value={revokedBy}
                  onChange={(e) => setRevokedBy(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black p-3 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {revokeError && (
              <div className="rounded-xl bg-rose-950/60 border border-rose-500/50 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{revokeError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setRevokingCert(null)}
                className="btn-glass px-5 py-2.5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRevoking}
                onClick={handleRevokeSubmit}
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {isRevoking ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Revoking...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Confirm Revocation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
