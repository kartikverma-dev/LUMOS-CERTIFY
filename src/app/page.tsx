import Link from 'next/link';
import {
  ScanLine,
  ArrowRight,
  Download,
  ExternalLink,
} from 'lucide-react';
import { getDashboardStats, getBatches, getAllCertificates, getTemplates } from '@/lib/db';
import { getSystemKeyPair } from '@/lib/crypto';
import BadgeStatus from '@/components/BadgeStatus';
import TemplateCanvas from '@/components/TemplateCanvas';

export const revalidate = 0;

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const batches = await getBatches();
  const certificates = await getAllCertificates();
  const templates = await getTemplates();
  const { keyFingerprint } = getSystemKeyPair();

  const recentBatches = batches.slice(0, 4);
  const recentCertificates = certificates.slice(0, 6);
  const featuredTemplate = templates[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-24">
      {/* 1. HERO SECTION (Inspired by luxury automotive showcase) */}
      <section className="relative pt-4 sm:pt-8 space-y-12">
        {/* Top Meta Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] font-mono text-zinc-400 border-b border-white/10 pb-6 items-center">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E2F952] animate-pulse" />
            <span>CRYPTOGRAPHIC PROTOCOL v1.0</span>
          </div>
          <div className="md:text-center text-zinc-400">
            <span>Ed25519 Asymmetric Signature Engine</span>
          </div>
          <div className="md:text-right text-zinc-400 flex items-center md:justify-end gap-2">
            <span>Authority Fingerprint:</span>
            <span className="text-[#E2F952] font-semibold">{keyFingerprint.slice(0, 8)}...</span>
          </div>
        </div>

        {/* Hero Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-mono tracking-widest text-[#E2F952] uppercase">
                001 / PRESTIGE CERTIFICATION PLATFORM
              </span>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold text-white tracking-tighter leading-[1.05]">
                Issue the luxury.<br />
                <span className="text-zinc-400">Anchor the proof.</span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
              Every digital certificate carries an immutable, tamper-evident cryptographic signature.
              Verification never relies on query payloads — resolving exclusively to the append-only server registry.
            </p>

            {/* Segmented Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/batches/new"
                className="btn-volt inline-flex items-center gap-2.5 px-6 py-3.5 text-xs font-bold tracking-wide"
              >
                <span>Issue New Batch</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[2.8]" />
              </Link>

              <Link
                href="/verify"
                className="btn-glass inline-flex items-center gap-2.5 px-6 py-3.5 text-xs font-semibold tracking-wide"
              >
                <ScanLine className="h-4 w-4 text-[#E2F952]" />
                <span>Verify QR Code</span>
              </Link>

              <Link
                href="/templates"
                className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#E2F952] px-3 py-3 transition-colors"
              >
                <span>Browse Templates</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Showcase Visual (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-zinc-900 to-black p-4 shadow-2xl group hover:border-[#E2F952]/40 transition-all duration-500">
              {/* Subtle neon volt spotlight */}
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[#E2F952]/10 blur-3xl pointer-events-none" />

              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
                {featuredTemplate && <TemplateCanvas template={featuredTemplate} />}
              </div>

              {/* Showcase Footer Pill */}
              <div className="mt-4 flex items-center justify-between text-xs px-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#E2F952]" />
                  <span className="font-semibold text-white text-xs">{featuredTemplate?.name}</span>
                </div>
                <Link
                  href={`/templates/${featuredTemplate?.id}`}
                  className="text-[11px] font-mono text-[#E2F952] hover:underline flex items-center gap-1"
                >
                  <span>Inspect Layout</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. EDITORIAL DOCTRINE (Inspired by "— ABOUT US" section) */}
      <section className="border-t border-white/10 pt-16 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[2px] bg-[#E2F952]" />
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            THE TRUST PRINCIPLE
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white tracking-tight leading-snug">
              From high-volume credential batches to tamper-evident institutional awards, LUMOS-CERTIFY delivers mathematical finality and verifiable prestige.
            </h2>
          </div>

          <div className="lg:col-span-5 space-y-4 text-xs sm:text-sm text-zinc-400 leading-relaxed lg:border-l lg:border-white/10 lg:pl-8">
            <p>
              A certificate is only trustworthy if verification is <strong className="text-white font-semibold">cryptographic</strong>, not just a casual database lookup.
            </p>
            <p>
              Every certificate carries an Ed25519 asymmetric signature anchor. Even if an ID is guessed or duplicated, verification fails unless the signature matches the canonical payload in the append-only registry.
            </p>
          </div>
        </div>
      </section>

      {/* 3. LUXURY NUMERIC METRICS (Inspired by "450 HP / 280 KM/H" stats) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-y border-white/10 py-12">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            01 / TOTAL ISSUANCE
          </span>
          <div className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
            {stats.totalIssued}
          </div>
          <p className="text-xs text-zinc-400">Cryptographically Signed</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#E2F952]">
            02 / ACTIVE CREDENTIALS
          </span>
          <div className="text-3xl sm:text-5xl font-display font-extrabold text-[#E2F952] tracking-tight">
            {stats.activeCertificates}
          </div>
          <p className="text-xs text-zinc-400">Tamper-Validated Proofs</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            03 / REVOKED
          </span>
          <div className="text-3xl sm:text-5xl font-display font-extrabold text-rose-400 tracking-tight">
            {stats.revokedCertificates}
          </div>
          <p className="text-xs text-zinc-400">Audited Withdrawals</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            04 / BATCH REGISTRY
          </span>
          <div className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
            {stats.totalBatches}
          </div>
          <p className="text-xs text-zinc-400">SHA-256 Manifest Roots</p>
        </div>
      </section>

      {/* 4. TEMPLATE COLLECTION SHOWCASE (Inspired by car brand cards) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-5 h-[2px] bg-[#E2F952]" />
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                CURATED PRESETS
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              Prestige Certificate Collection
            </h2>
          </div>

          <Link
            href="/templates"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#E2F952] hover:underline"
          >
            <span>Explore All Templates</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.slice(0, 3).map((tpl, i) => (
            <div
              key={tpl.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 ${
                i === 0
                  ? 'border-[#E2F952]/40 bg-gradient-to-b from-zinc-900 via-black to-black shadow-xl shadow-[#E2F952]/5'
                  : 'border-white/10 bg-zinc-950/60 hover:border-white/20'
              }`}
            >
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
                  <TemplateCanvas template={tpl} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display font-bold text-sm text-white">{tpl.name}</h3>
                    {i === 0 && (
                      <span className="rounded-full bg-[#E2F952] px-2 py-0.5 text-[9px] font-bold text-black uppercase">
                        Flagship
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">{tpl.description}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500">
                  {tpl.placeholders.length} Placeholders
                </span>
                <Link
                  href={`/templates/${tpl.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#E2F952] hover:underline"
                >
                  <span>Design</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. RECENT BATCHES & CERTIFICATES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Batches (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-[2px] bg-[#E2F952]" />
              <h2 className="text-base font-display font-bold text-white">Recent Batches</h2>
            </div>
            <Link href="/batches" className="text-xs font-mono text-[#E2F952] hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentBatches.map((batch) => (
              <div
                key={batch.id}
                className="rounded-2xl border border-white/10 bg-[#101010] p-4 hover:border-white/20 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/batches/${batch.id}`}
                      className="font-display font-bold text-sm text-white hover:text-[#E2F952] transition-colors line-clamp-1"
                    >
                      {batch.name}
                    </Link>
                    <p className="text-xs font-mono text-zinc-500 mt-0.5">{batch.id}</p>
                  </div>
                  <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-mono text-zinc-300">
                    {batch.total_certificates} certs
                  </span>
                </div>

                <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between pt-1 border-t border-white/5">
                  <span>Manifest Hash:</span>
                  <span className="text-[#E2F952]">{batch.manifest_hash.slice(0, 10)}...</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/batches/${batch.id}`}
                    className="flex-1 text-center py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-colors"
                  >
                    Inspect Batch
                  </Link>
                  <a
                    href={`/api/batches/${batch.id}/zip`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E2F952]/10 hover:bg-[#E2F952]/20 text-[#E2F952] border border-[#E2F952]/30 text-xs font-semibold transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>ZIP</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-[2px] bg-[#E2F952]" />
              <h2 className="text-base font-display font-bold text-white">Registered Certificates</h2>
            </div>
            <Link href="/certificates" className="text-xs font-mono text-[#E2F952] hover:underline">
              Registry
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#101010] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-black/40 text-zinc-400 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="px-4 py-3.5">Certificate ID</th>
                    <th className="px-4 py-3.5">Recipient</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-300">
                  {recentCertificates.map((cert) => (
                    <tr key={cert.cert_id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-[#E2F952]">
                        {cert.cert_id}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white">{cert.recipient_name}</div>
                        <div className="text-[11px] text-zinc-500 font-mono line-clamp-1">{cert.credential}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <BadgeStatus status={cert.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/verify/${cert.cert_id}?sig=${encodeURIComponent(cert.signature)}`}
                            className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 text-[11px] text-white transition-colors"
                          >
                            <ExternalLink className="h-3 w-3 text-[#E2F952]" />
                            <span>Verify</span>
                          </Link>
                          <a
                            href={`/api/certificates/${cert.cert_id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 text-[11px] text-white transition-colors"
                          >
                            <Download className="h-3 w-3 text-[#E2F952]" />
                            <span>PDF</span>
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
      </section>

      {/* 6. IMMUTABLE TRUST CARD (Inspired by "Superior Customer Service" card) */}
      <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-zinc-950 via-[#111111] to-black p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E2F952]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#E2F952]">
              LEGAL & INSTITUTIONAL CERTAINTY
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Cryptographic Integrity.<br />Zero Compromises.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
              Every certificate contains an Ed25519 digital signature and canonical hash. Issuance records are appended to an immutable monotonic ledger and can be independently verified offline using standard OpenSSL tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:justify-end gap-3">
            <Link
              href="/audit"
              className="btn-volt inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold"
            >
              <span>Inspect Audit Trail</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/verify"
              className="btn-glass inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-semibold"
            >
              <ScanLine className="h-4 w-4 text-[#E2F952]" />
              <span>Verify Any QR</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
