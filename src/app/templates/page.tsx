import Link from 'next/link';
import { PlusCircle, ArrowRight, Layers } from 'lucide-react';
import { getTemplates } from '@/lib/db';
import TemplateCanvas from '@/components/TemplateCanvas';

export const revalidate = 0;

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-[2px] bg-[#E2F952]" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#E2F952]">
              MODULE 4.1 • LAYOUT DESIGN ENGINE
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
            Certificate Templates
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl">
            Design certificate backgrounds, drag placeholder coordinates, and anchor cryptographic QR blocks.
          </p>
        </div>

        <Link
          href="/templates/new"
          className="btn-volt inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4 stroke-[2.5]" />
          <span>Create New Template</span>
        </Link>
      </div>

      {/* Templates Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((tpl, i) => (
          <div
            key={tpl.id}
            className={`flex flex-col justify-between rounded-3xl border overflow-hidden transition-all duration-300 shadow-xl group ${
              i === 0
                ? 'border-[#E2F952]/40 bg-[#111111]'
                : 'border-white/10 bg-[#111111] hover:border-white/20'
            }`}
          >
            {/* Visual Canvas Thumbnail Preview */}
            <div className="p-4 bg-black border-b border-white/10">
              <TemplateCanvas template={tpl} />
            </div>

            {/* Template Info & Metadata */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base text-white group-hover:text-[#E2F952] transition-colors">
                    {tpl.name}
                  </h3>
                  <span className="font-mono text-[10px] text-zinc-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                    {tpl.width}×{tpl.height}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {tpl.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#E2F952]" />
                    <span>Placeholders:</span>
                  </span>
                  <span className="font-mono text-white">
                    {tpl.placeholders.length} fields ({tpl.placeholders.filter((p) => p.required).length} required)
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/templates/${tpl.id}`}
                    className="btn-glass flex-1 text-center py-2.5 text-xs font-semibold"
                  >
                    Edit Layout
                  </Link>
                  <Link
                    href={`/batches/new`}
                    className="inline-flex items-center justify-center gap-1 rounded-full bg-[#E2F952]/10 hover:bg-[#E2F952]/20 text-[#E2F952] border border-[#E2F952]/30 px-4 py-2.5 text-xs font-bold transition-colors"
                    title="Issue batch using this template"
                  >
                    <span>Use</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
