'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ScanLine,
  Search,
  Key,
  ArrowRight,
} from 'lucide-react';
import QrScannerModal from '@/components/QrScannerModal';

export default function VerifyPortalPage() {
  const router = useRouter();
  const [certId, setCertId] = useState('');
  const [signature, setSignature] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) {
      setErrorMsg('Please enter a Certificate Identifier (e.g. CERT-2026-000001).');
      return;
    }

    const cleanId = certId.trim().toUpperCase();
    const cleanSig = signature.trim();

    const targetUrl = cleanSig
      ? `/verify/${encodeURIComponent(cleanId)}?sig=${encodeURIComponent(cleanSig)}`
      : `/verify/${encodeURIComponent(cleanId)}`;

    router.push(targetUrl);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Public Cryptographic Verification Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
          Verify a Certificate
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Scan the QR code printed on the physical or digital certificate, or manually enter the Certificate ID and signature below.
        </p>
      </div>

      {/* Main Verification Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Option 1: Live QR Scanner */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl hover:border-amber-500/40 transition-all">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ScanLine className="h-6 w-6 stroke-[2.2]" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              Scan Certificate QR
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use your device&apos;s camera or upload a certificate image to extract the cryptographic anchor and verify against the registry immediately.
            </p>
          </div>

          <button
            onClick={() => setScannerOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
          >
            <ScanLine className="h-4 w-4 stroke-[2.5]" />
            <span>Launch QR Scanner</span>
          </button>
        </div>

        {/* Option 2: Manual Credentials Input */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Key className="h-6 w-6 stroke-[2.2]" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              Manual ID & Signature
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verify using the certificate&apos;s unique sequential ID and Ed25519 cryptographic signature.
            </p>
          </div>

          <form onSubmit={handleManualVerify} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase font-mono mb-1">
                Certificate ID *
              </label>
              <input
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="e.g. CERT-2026-000001"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase font-mono mb-1">
                Cryptographic Signature (Optional)
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="sig parameter from QR"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-400">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-3 text-xs font-semibold text-slate-100 transition-all"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Verify Records</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </button>
          </form>
        </div>
      </div>

      {/* Quick Test Demo Links */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
        <span className="text-xs font-semibold text-slate-300">
          Try Demonstration Verification States:
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => {
              setCertId('CERT-2026-000001');
              router.push('/verify/CERT-2026-000001');
            }}
            className="rounded-lg bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 text-emerald-300 hover:bg-emerald-900/40 transition-colors"
          >
            ✅ Test State 1: Verified (CERT-2026-000001)
          </button>
          <button
            onClick={() => {
              setCertId('CERT-2026-000003');
              router.push('/verify/CERT-2026-000003');
            }}
            className="rounded-lg bg-rose-950/40 border border-rose-500/30 px-3 py-1.5 text-rose-300 hover:bg-rose-900/40 transition-colors"
          >
            🚫 Test State 2: Revoked (CERT-2026-000003)
          </button>
          <button
            onClick={() => {
              router.push('/verify/CERT-9999-000000?sig=invalid_sig');
            }}
            className="rounded-lg bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 text-amber-300 hover:bg-amber-900/40 transition-colors"
          >
            ❓ Test State 3: Not Found / Invalid Sig
          </button>
        </div>
      </div>

      {/* Scanner modal */}
      {scannerOpen && <QrScannerModal onClose={() => setScannerOpen(false)} />}
    </div>
  );
}
