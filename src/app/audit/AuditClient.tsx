'use client';

import { useState } from 'react';
import {
  ScrollText,
  Key,
  Copy,
  Check,
  Download,
  Terminal,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { IssuanceLogEntry } from '@/lib/types';

interface AuditClientProps {
  issuanceLog: IssuanceLogEntry[];
  publicKeyPem: string;
  keyFingerprint: string;
}

export default function AuditClient({
  issuanceLog,
  publicKeyPem,
  keyFingerprint,
}: AuditClientProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const [expandedSeq, setExpandedSeq] = useState<number | null>(null);

  const copyPublicKey = () => {
    navigator.clipboard.writeText(publicKeyPem);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const copyFingerprint = () => {
    navigator.clipboard.writeText(keyFingerprint);
    setCopiedFingerprint(true);
    setTimeout(() => setCopiedFingerprint(false), 2000);
  };

  const downloadPublicKey = () => {
    const blob = new Blob([publicKeyPem], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lumos_ed25519_public_key.pem';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-[2px] bg-[#E2F952]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#E2F952]">
            MODULE 4.4 &amp; 6 • IMMUTABLE AUDIT LEDGER
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
          Institutional Audit Trail
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl">
          Append-only cryptographic ledger of all issuance and revocation transactions. Records are permanent and mathematically verifiable.
        </p>
      </div>

      {/* Cryptographic Authority Keys Card */}
      <div className="rounded-3xl border border-white/10 bg-[#111111] p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#E2F952] text-black flex items-center justify-center">
              <Key className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">
                Institutional Authority Keypair (Ed25519)
              </h2>
              <p className="text-xs font-mono text-zinc-400">RFC 8032 Edwards-curve Digital Signature Anchor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyPublicKey}
              type="button"
              className="btn-glass px-4 py-2 text-xs font-semibold inline-flex items-center gap-2"
            >
              {copiedKey ? <Check className="h-3.5 w-3.5 text-[#E2F952]" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
              <span>Copy Public Key</span>
            </button>
            <button
              onClick={downloadPublicKey}
              type="button"
              className="btn-volt px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Download PEM</span>
            </button>
          </div>
        </div>

        {/* Key Fingerprint Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="rounded-2xl bg-black p-5 border border-white/10 space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-zinc-500">Public Key Fingerprint (SHA-256)</span>
            <div className="flex items-center justify-between">
              <code className="text-xs font-mono text-[#E2F952] break-all select-all">{keyFingerprint}</code>
              <button onClick={copyFingerprint} className="p-1 text-zinc-400 hover:text-white ml-2">
                {copiedFingerprint ? <Check className="h-3.5 w-3.5 text-[#E2F952]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-black p-5 border border-white/10 space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-zinc-500">Trust Standard</span>
            <p className="text-xs text-zinc-300">
              Deterministic Canonical Record Serialization + Asymmetric Signing.
            </p>
          </div>
        </div>
      </div>

      {/* Append-Only Ledger Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-[#E2F952]" />
            <h2 className="text-base font-display font-bold text-white">
              Append-Only Ledger ({issuanceLog.length} Records)
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            Strict Monotonic Sequence Ordering
          </span>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111111] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-black/50 text-zinc-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="px-5 py-3.5">Seq #</th>
                  <th className="px-5 py-3.5">Event</th>
                  <th className="px-5 py-3.5">Certificate ID</th>
                  <th className="px-5 py-3.5">Batch</th>
                  <th className="px-5 py-3.5">Authority / Issuer</th>
                  <th className="px-5 py-3.5">Canonical SHA-256 Hash</th>
                  <th className="px-5 py-3.5">Timestamp (UTC)</th>
                  <th className="px-5 py-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300 font-mono text-[11px]">
                {issuanceLog.map((entry) => {
                  const isExpanded = expandedSeq === entry.sequence_id;
                  return (
                    <tr key={entry.sequence_id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 text-zinc-500 font-bold">
                        #{entry.sequence_id}
                      </td>
                      <td className="px-5 py-4">
                        {entry.event_type === 'ISSUED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#E2F952]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#E2F952] border border-[#E2F952]/30">
                            ISSUED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                            REVOKED
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-bold text-white font-sans">
                        {entry.cert_id}
                      </td>
                      <td className="px-5 py-4 text-zinc-400">
                        {entry.batch_id}
                      </td>
                      <td className="px-5 py-4 text-zinc-300 font-sans">
                        {entry.issuer}
                      </td>
                      <td className="px-5 py-4 text-[#E2F952]">
                        <span title={entry.canonical_hash}>
                          {entry.canonical_hash.slice(0, 12)}...
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 text-[10px]">
                        {new Date(entry.timestamp).toISOString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setExpandedSeq(isExpanded ? null : entry.sequence_id)}
                          className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 text-[10px] text-zinc-300 hover:text-white"
                        >
                          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Offline Verification Reference */}
      <div className="rounded-3xl border border-white/10 bg-[#111111] p-8 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-white font-display font-bold text-base">
          <Terminal className="h-5 w-5 text-[#E2F952]" />
          <span>Independent Offline Verification Guide (Blueprint §6)</span>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Because LUMOS-CERTIFY relies on standard asymmetric Ed25519 (RFC 8032), any recipient or verifier can verify certificates completely offline without trusting or connecting to any web server.
        </p>
        <div className="rounded-2xl bg-black p-5 border border-white/10 text-[11px] font-mono text-[#E2F952] overflow-x-auto whitespace-pre">
{`# 1. Canonical record representation:
CANONICAL='{"batch_id":"BATCH-...","cert_id":"CERT-...","credential":"...","issue_date":"...","recipient_name":"..."}'

# 2. Verify signature with OpenSSL:
openssl pkeyutl -verify -pubin -inkey lumos_ed25519_public_key.pem -sigfile signature.bin <<< "$CANONICAL"`}
        </div>
      </div>
    </div>
  );
}
