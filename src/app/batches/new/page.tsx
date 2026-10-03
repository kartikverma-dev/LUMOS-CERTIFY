'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  AlertTriangle,
  CheckCircle2,
  Download,
  ArrowRight,
  ShieldAlert,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { CertificateTemplate, CsvValidationResult } from '@/lib/types';
import { parseAndValidateCsv, generateSampleCsv } from '@/lib/csv';

export default function NewBatchPage() {
  const router = useRouter();

  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);

  const [csvRawText, setCsvRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);

  const [batchName, setBatchName] = useState<string>('');
  const [issuerName, setIssuerName] = useState<string>('LUMOS Certify Authority');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch templates on load
  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data: CertificateTemplate[]) => {
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplateId(data[0].id);
          setSelectedTemplate(data[0]);
        }
      })
      .catch((err) => console.error('Failed to load templates:', err));
  }, []);

  // Update selected template
  useEffect(() => {
    const t = templates.find((item) => item.id === selectedTemplateId) || null;
    setSelectedTemplate(t);

    // Re-run validation if CSV text is present
    if (t && csvRawText) {
      const result = parseAndValidateCsv(csvRawText, t);
      setValidationResult(result);
    }
  }, [selectedTemplateId, templates, csvRawText]);

  // Handle CSV file drop or select
  const handleFileChange = (file: File) => {
    setFileName(file.name);
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      setCsvRawText(text);
      if (selectedTemplate) {
        const result = parseAndValidateCsv(text, selectedTemplate);
        setValidationResult(result);
      }
    };
    reader.readAsText(file);
  };

  // Download reference sample CSV
  const handleDownloadSample = () => {
    if (!selectedTemplate) return;
    const csvContent = generateSampleCsv(selectedTemplate);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumos_sample_${selectedTemplate.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Submit batch for issuance
  const handleCreateBatch = async () => {
    if (!validationResult || !validationResult.isValid || !selectedTemplate) {
      setErrorMessage('Please ensure CSV is uploaded and has zero validation errors.');
      return;
    }

    if (!batchName.trim()) {
      setErrorMessage('Please provide a descriptive name for this issuance batch.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const rows = validationResult.validRows.map((r) => r.data);

      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          batchName: batchName.trim(),
          issuerName: issuerName.trim(),
          rows,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create batch.');
      }

      router.push(`/batches/${data.batch.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Batch creation failed.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Title */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-[2px] bg-[#E2F952]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#E2F952]">
            MODULE 4.2 • CSV INGESTION &amp; BATCH ENGINE
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
          Issue Certificate Batch
        </h1>
        <p className="text-zinc-400 text-sm max-w-xl">
          Upload recipient records in CSV format. Columns are strictly validated against active template placeholders before signing.
        </p>
      </div>

      {/* Step 1: Template Selection */}
      <div className="rounded-3xl border border-white/10 bg-[#111111] p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E2F952] text-xs font-mono font-bold text-black">
                1
              </span>
              <span>Select Certificate Template</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Determines required placeholder columns and coordinate placement.
            </p>
          </div>

          <button
            onClick={handleDownloadSample}
            type="button"
            className="btn-glass inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold self-start sm:self-auto"
          >
            <Download className="h-3.5 w-3.5 text-[#E2F952]" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((tpl) => {
            const isSelected = tpl.id === selectedTemplateId;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`text-left p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-[#E2F952] bg-[#E2F952]/10 shadow-lg shadow-[#E2F952]/10 ring-1 ring-[#E2F952]'
                    : 'border-white/10 bg-black/50 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-bold text-xs text-white line-clamp-1">{tpl.name}</span>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-[#E2F952] shrink-0" />}
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2">{tpl.description}</p>
                <div className="mt-3 text-[10px] font-mono text-[#E2F952]">
                  {tpl.placeholders.filter((p) => p.required).length} required fields
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: CSV Upload */}
      <div className="rounded-3xl border border-white/10 bg-[#111111] p-8 space-y-6 shadow-xl">
        <div>
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E2F952] text-xs font-mono font-bold text-black">
              2
            </span>
            <span>Upload Recipient CSV</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            File must include headers: <code className="text-[#E2F952] font-mono">name, credential, issue_date, email</code>
          </p>
        </div>

        {/* Dropzone */}
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) handleFileChange(f);
          }}
          className="flex flex-col items-center justify-center p-10 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#E2F952]/60 bg-black/60 hover:bg-black/90 cursor-pointer transition-all group"
        >
          <Upload className="h-10 w-10 text-zinc-500 group-hover:text-[#E2F952] mb-3 transition-colors" />
          <span className="text-sm font-display font-bold text-white group-hover:text-[#E2F952]">
            {fileName ? `Loaded: ${fileName}` : 'Drop CSV file here or click to browse'}
          </span>
          <span className="text-xs font-mono text-zinc-500 mt-1">UTF-8 Encoded .csv files</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileChange(f);
            }}
            className="hidden"
          />
        </label>

        {!csvRawText && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                if (selectedTemplate) {
                  const sample = generateSampleCsv(selectedTemplate);
                  setCsvRawText(sample);
                  setFileName('sample_recipients.csv');
                  setValidationResult(parseAndValidateCsv(sample, selectedTemplate));
                }
              }}
              className="text-xs text-[#E2F952] hover:underline font-mono"
            >
              Or load sample recipient dataset with 3 test rows
            </button>
          </div>
        )}
      </div>

      {/* Step 3: Validation Analysis */}
      {validationResult && (
        <div className="rounded-3xl border border-white/10 bg-[#111111] p-8 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E2F952] text-xs font-mono font-bold text-black">
                3
              </span>
              <span>CSV Ingestion Verification</span>
            </h2>
            <div>
              {validationResult.isValid ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E2F952]/10 px-3.5 py-1 text-xs font-bold text-[#E2F952] border border-[#E2F952]/30">
                  <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Validation Passed ({validationResult.validRows.length} valid)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3.5 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Validation Failed ({validationResult.invalidRows.length} issues)</span>
                </span>
              )}
            </div>
          </div>

          {/* Validation Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="rounded-2xl bg-black p-4 border border-white/10">
              <span className="text-[10px] text-zinc-500 uppercase font-mono">Total Rows</span>
              <p className="text-xl font-display font-extrabold text-white mt-1">{validationResult.totalRows}</p>
            </div>
            <div className="rounded-2xl bg-black p-4 border border-white/10">
              <span className="text-[10px] text-[#E2F952] uppercase font-mono">Valid Rows</span>
              <p className="text-xl font-display font-extrabold text-[#E2F952] mt-1">{validationResult.validRows.length}</p>
            </div>
            <div className="rounded-2xl bg-black p-4 border border-white/10">
              <span className="text-[10px] text-rose-400 uppercase font-mono">Invalid Rows</span>
              <p className="text-xl font-display font-extrabold text-rose-400 mt-1">{validationResult.invalidRows.length}</p>
            </div>
            <div className="rounded-2xl bg-black p-4 border border-white/10">
              <span className="text-[10px] text-amber-400 uppercase font-mono">Duplicates</span>
              <p className="text-xl font-display font-extrabold text-amber-400 mt-1">{validationResult.duplicateRows.length}</p>
            </div>
          </div>

          {validationResult.missingRequiredColumns.length > 0 && (
            <div className="rounded-2xl bg-rose-950/40 border border-rose-500/30 p-4 text-xs text-rose-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-rose-300">
                <ShieldAlert className="h-4 w-4" />
                <span>Missing Required Columns for Active Template:</span>
              </div>
              <p className="font-mono text-rose-400">
                {validationResult.missingRequiredColumns.join(', ')}
              </p>
            </div>
          )}

          {validationResult.invalidRows.length > 0 && (
            <div className="rounded-2xl bg-rose-950/30 border border-rose-500/30 p-4 space-y-2 text-xs">
              <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Exact Line Breakdown of Invalid Rows (Zero-Tolerance):</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px] text-rose-200">
                {validationResult.invalidRows.map((inv) => (
                  <div key={inv.rowNumber} className="rounded bg-rose-900/30 p-2 border border-rose-800/40">
                    <span className="font-bold text-rose-300">Line {inv.rowNumber}:</span>{' '}
                    {inv.errors.join('; ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valid Rows Preview Table */}
          {validationResult.validRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-mono text-zinc-300 uppercase text-[10px]">Validated Recipient Preview:</span>
                <span>Showing first {Math.min(5, validationResult.validRows.length)} records</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="border-b border-white/10 font-mono text-[10px] text-zinc-400 bg-white/5">
                    <tr>
                      <th className="px-4 py-2.5">Row</th>
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Credential</th>
                      <th className="px-4 py-2.5">Issue Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-[11px] text-zinc-300">
                    {validationResult.validRows.slice(0, 5).map((r) => (
                      <tr key={r.rowNumber}>
                        <td className="px-4 py-2.5 text-zinc-500">#{r.rowNumber}</td>
                        <td className="px-4 py-2.5 text-white font-sans font-medium">{r.data.name}</td>
                        <td className="px-4 py-2.5 text-zinc-400">{r.data.email}</td>
                        <td className="px-4 py-2.5 text-[#E2F952]">{r.data.credential}</td>
                        <td className="px-4 py-2.5 text-zinc-400">{r.data.issue_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Batch Configuration & Issuance Trigger */}
      {validationResult && validationResult.isValid && (
        <div className="rounded-3xl border border-[#E2F952]/40 bg-[#111111] p-8 space-y-6 shadow-2xl">
          <div>
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E2F952] text-xs font-mono font-bold text-black">
                4
              </span>
              <span>Issuance Authority &amp; Batch Parameters</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Confirm batch parameters before signing canonical records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">
                Batch Name / Cohort Identifier *
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g. Cohort 2026-B: Advanced Data Science"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-xs text-white placeholder-zinc-600 focus:border-[#E2F952] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-zinc-300 mb-1.5">
                Issuing Authority Identity
              </label>
              <input
                type="text"
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                placeholder="e.g. LUMOS Certify Authority"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-xs text-white placeholder-zinc-600 focus:border-[#E2F952] focus:outline-none"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl bg-rose-950/40 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
            <div className="text-xs text-zinc-400">
              <span className="text-white font-bold">{validationResult.validRows.length}</span> certificates will be signed with Ed25519 and sealed into an immutable batch manifest.
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCreateBatch}
              className="btn-volt w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-xs font-bold disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing &amp; Inscribing Batch...</span>
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 stroke-[2.5]" />
                  <span>Execute Cryptographic Issuance</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
