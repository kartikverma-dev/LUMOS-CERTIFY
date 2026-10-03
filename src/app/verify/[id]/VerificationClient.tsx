'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  AlertTriangle,
  Download,
  Share2,
  CheckCircle2,
  XCircle,
  Key,
  Check,
  ArrowLeft,
  ScanLine,
} from 'lucide-react';
import { VerificationResult } from '@/lib/types';

interface VerificationClientProps {
  result: VerificationResult;
  queriedId: string;
}

export default function VerificationClient({
  result,
  queriedId,
}: VerificationClientProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (result.state === 'VERIFIED') {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E2F952', '#FFFFFF', '#10B981'],
        });
      } catch {
        // Fallback
      }
    }
  }, [result.state]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/verify"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Verification Portal</span>
        </Link>
        <span className="text-[11px] font-mono text-zinc-500">
          Timestamp: {new Date(result.verification_timestamp).toLocaleString()}
        </span>
      </div>

      {/* STATE 1: VERIFIED */}
      {result.state === 'VERIFIED' && (
        <div className="space-y-6">
          {/* Hero Verified Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-[#E2F952]/40 bg-gradient-to-b from-zinc-900 via-black to-black p-8 sm:p-10 text-center shadow-2xl">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-10 h-40 w-40 rounded-full bg-[#E2F952]/10 blur-3xl pointer-events-none" />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#E2F952] text-black shadow-lg shadow-[#E2F952]/20 mb-5 animate-in zoom-in-75 duration-300">
              <CheckCircle2 className="h-9 w-9 stroke-[2.8]" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E2F952]/10 px-3.5 py-1 text-xs font-bold text-[#E2F952] border border-[#E2F952]/30 mb-3">
              <Key className="h-3 w-3 stroke-[2.5]" />
              <span>Ed25519 Cryptographic Proof Confirmed</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Authentic &amp; Verified Credential
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto mt-2 leading-relaxed">
              Authenticated directly against the immutable server registry. The signature is tamper-evident and cryptographically valid.
            </p>
          </div>

          {/* Certificate Credential Dossier */}
          <div className="rounded-3xl border border-white/10 bg-[#111111] p-8 space-y-8 shadow-xl">
            <div className="border-b border-white/10 pb-5">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#E2F952]">
                ACCREDITATION SPECIFICATION
              </span>
              <h2 className="text-2xl font-display font-bold text-white mt-1">
                {result.credential}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-500 uppercase font-mono text-[10px]">Recipient Name</span>
                <p className="text-lg font-display font-bold text-white">{result.recipient_name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 uppercase font-mono text-[10px]">Certificate Identifier</span>
                <p className="text-lg font-mono font-bold text-[#E2F952]">{result.cert_id}</p>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 uppercase font-mono text-[10px]">Date of Issuance</span>
                <p className="text-sm font-semibold text-zinc-200">{result.issue_date}</p>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 uppercase font-mono text-[10px]">Issuing Authority</span>
                <p className="text-sm font-semibold text-zinc-200">{result.issuer_name}</p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <span className="text-zinc-500 uppercase font-mono text-[10px]">Canonical SHA-256 Digest</span>
                <p className="font-mono text-[11px] text-[#E2F952] bg-black p-3 rounded-xl border border-white/10 break-all select-all">
                  {result.canonical_hash}
                </p>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-white/10">
              <a
                href={`/api/certificates/${result.cert_id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-volt w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-3.5 text-xs font-bold"
              >
                <Download className="h-4 w-4 stroke-[2.5]" />
                <span>Download Official Certificate PDF</span>
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="btn-glass w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-4 w-4 text-[#E2F952]" />
                    <span className="text-[#E2F952]">Copied Link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 text-zinc-400" />
                    <span>Share Proof Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: REVOKED */}
      {result.state === 'REVOKED' && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-rose-500/40 bg-gradient-to-b from-rose-950/40 via-black to-black p-8 sm:p-10 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-black shadow-lg shadow-rose-500/20 mb-5 animate-in zoom-in-75 duration-300">
              <XCircle className="h-9 w-9 stroke-[2.8]" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3.5 py-1 text-xs font-bold text-rose-400 border border-rose-500/30 mb-3">
              <ShieldAlert className="h-3 w-3 stroke-[2.5]" />
              <span>Official Registry Revocation Notice</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Certificate Revoked
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto mt-2 leading-relaxed">
              This certificate was originally issued by the institution, but has subsequently been <strong>withdrawn and invalidated</strong>.
            </p>
          </div>

          <div className="rounded-3xl border border-rose-500/20 bg-[#111111] p-8 space-y-6 shadow-xl">
            <div className="rounded-2xl bg-rose-950/30 border border-rose-500/30 p-5 space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-rose-400">
                Mandatory Revocation Audit Reason
              </span>
              <p className="text-sm text-rose-200 font-medium leading-relaxed">
                &ldquo;{result.revocation_reason}&rdquo;
              </p>
              {result.revoked_at && (
                <p className="text-[11px] text-zinc-400 font-mono pt-1">
                  Revoked on: {new Date(result.revoked_at).toLocaleString()}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-500 font-mono text-[10px] uppercase">Certificate ID</span>
                <p className="font-mono text-sm font-bold text-white">{result.cert_id}</p>
              </div>
              <div>
                <span className="text-zinc-500 font-mono text-[10px] uppercase">Originally Awarded To</span>
                <p className="font-bold text-white">{result.recipient_name}</p>
              </div>
              <div>
                <span className="text-zinc-500 font-mono text-[10px] uppercase">Credential</span>
                <p className="font-semibold text-zinc-300">{result.credential}</p>
              </div>
              <div>
                <span className="text-zinc-500 font-mono text-[10px] uppercase">Original Issue Date</span>
                <p className="font-semibold text-zinc-300">{result.issue_date}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black border border-white/10 text-[11px] text-zinc-400 leading-relaxed">
              <strong>Institutional Advisory:</strong> Do not accept this certificate as proof of qualification, achievement, or accreditation.
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: NOT FOUND */}
      {result.state === 'NOT_FOUND' && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black p-8 sm:p-10 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 shadow-lg mb-5 animate-in zoom-in-75 duration-300">
              <AlertTriangle className="h-9 w-9 stroke-[2.4]" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3.5 py-1 text-xs font-bold text-zinc-300 border border-white/10 mb-3">
              <ShieldAlert className="h-3 w-3" />
              <span>Tamper-Evident Security Warning</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
              Certificate Not Found
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto mt-2 leading-relaxed">
              The identifier <code className="font-mono text-[#E2F952] font-semibold">{queriedId}</code> does not match any valid record in the registry, or the cryptographic digital signature failed verification.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111111] p-8 space-y-4 shadow-xl text-xs text-zinc-300 leading-relaxed">
            <h3 className="font-bold text-white text-sm">Security &amp; Tamper Protections:</h3>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>
                <strong>Cryptographic Anchor Rule:</strong> A certificate QR cannot be forged or altered. Even if a valid Certificate ID is guessed, it will fail without the corresponding Ed25519 asymmetric signature.
              </li>
              <li>
                <strong>Zero Detail Leakage:</strong> In accordance with LUMOS-CERTIFY security specifications (§5), invalid attempts reveal zero internal database information.
              </li>
            </ul>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/verify"
                className="btn-volt w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold"
              >
                <ScanLine className="h-4 w-4" />
                <span>Scan Another Certificate</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
