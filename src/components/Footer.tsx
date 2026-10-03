import Link from 'next/link';
import { Shield, GitBranch, Key, CheckCircle2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex flex-col items-center md:items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-200">LUMOS-CERTIFY</span>
            <span className="text-slate-600">•</span>
            <span className="italic text-amber-400 font-serif">&ldquo;Let there be proof.&rdquo;</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Verifiable digital certificate issuance platform with Ed25519 tamper-evident signatures.
          </p>
        </div>

        {/* Cryptographic Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1 border border-slate-800 text-slate-300">
            <Key className="h-3.5 w-3.5 text-amber-400" />
            <span>Ed25519 (RFC 8032)</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1 border border-slate-800 text-slate-300">
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span>SHA-256 Manifest</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1 border border-slate-800 text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Append-Only Registry</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 text-slate-400">
          <Link href="/audit" className="hover:text-slate-200 transition-colors">
            Audit Trail
          </Link>
          <Link href="/verify" className="hover:text-slate-200 transition-colors">
            Public Verify
          </Link>
          <a
            href="https://github.com/kartikverma-dev/LUMOS-CERTIFY"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
