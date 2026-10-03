import Link from 'next/link';
import { PlusCircle, ArrowRight, Layers } from 'lucide-react';
import { getTemplates } from '@/lib/db';
import TemplateCanvas from '@/components/TemplateCanvas';

export const revalidate = 0;

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <span>MODULE 4.1</span>
            <span>•</span>
            <span>LAYOUT & PLACEHOLDER ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
            Certificate Templates
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Design certificate backgrounds, drag placeholder coordinates, and anchor cryptographic QR blocks.
          </p>
        </div>

        <Link
          href="/templates/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4 stroke-[2.5]" />
          <span>Create New Template</span>
        </Link>
      </div>

      {/* Templates Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden hover:border-slate-700 transition-all shadow-lg group"
          >
            {/* Visual Canvas Thumbnail Preview */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800/80">
              <TemplateCanvas template={tpl} />
            </div>

            {/* Template Info & Metadata */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                    {tpl.name}
                  </h3>
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {tpl.width}×{tpl.height}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {tpl.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-amber-400" />
                    <span>Placeholders:</span>
                  </span>
                  <span className="font-mono text-slate-200">
                    {tpl.placeholders.length} fields ({tpl.placeholders.filter((p) => p.required).length} required)
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Link
                    href={`/templates/${tpl.id}`}
                    className="flex-1 text-center py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    Edit Layout & Coordinates
                  </Link>
                  <Link
                    href={`/batches/new`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-2 text-xs font-semibold transition-colors"
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
