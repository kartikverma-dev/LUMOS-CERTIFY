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

      // Successfully created: redirect to batch detail
      router.push(`/batches/${data.batch.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Batch creation failed.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
          <span>MODULE 4.2</span>
          <span>•</span>
          <span>CSV INGESTION & BATCH ISSUANCE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
          Issue New Certificate Batch
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Upload recipient records in CSV format. Columns are strictly validated against active template placeholders before signing.
        </p>
      </div>

      {/* Step 1: Template Selection */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-mono text-amber-300">
                1
              </span>
              <span>Select Certificate Template</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Defines the required placeholders and layout coordinates.
            </p>
          </div>

          <button
            onClick={handleDownloadSample}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-amber-400" />
            <span>Download Sample CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {templates.map((tpl) => {
            const isSelected = tpl.id === selectedTemplateId;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/10 ring-1 ring-amber-500'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-200 line-clamp-1">{tpl.name}</span>
                  {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.description}</p>
                <div className="mt-2 text-[10px] font-mono text-amber-300/80">
                  {tpl.placeholders.filter((p) => p.required).length} required fields
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: CSV Upload */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-mono text-amber-300">
              2
            </span>
            <span>Upload Recipient CSV</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            File must include headers: <code className="text-amber-300 font-mono">name, credential, issue_date, email</code>
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
          className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-950/50 hover:bg-slate-950/80 cursor-pointer transition-all group"
        >
          <Upload className="h-10 w-10 text-slate-500 group-hover:text-amber-400 mb-3 transition-colors" />
          <span className="text-sm font-semibold text-slate-200 group-hover:text-amber-300">
            {fileName ? `Loaded: ${fileName}` : 'Drop CSV file here or click to browse'}
          </span>
          <span className="text-xs text-slate-500 mt-1">UTF-8 Encoded .csv files</span>
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

        {/* Or Paste Sample directly */}
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
              className="text-xs text-amber-400 hover:text-amber-300 underline font-mono"
            >
              Or load sample recipient dataset with 3 test rows
            </button>
          </div>
        )}
      </div>

      {/* Step 3: Validation Analysis (Blueprint §4.2) */}
      {validationResult && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-mono text-amber-300">
                3
              </span>
              <span>CSV Ingestion Verification</span>
            </h2>
            <div className="flex items-center gap-2">
              {validationResult.isValid ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Validation Passed ({validationResult.validRows.length} valid)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Validation Failed ({validationResult.invalidRows.length} issues)</span>
                </span>
              )}
            </div>
          </div>

          {/* Validation Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Total Rows</span>
              <p className="text-lg font-bold text-white font-mono">{validationResult.totalRows}</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
              <span className="text-[10px] text-emerald-400 uppercase font-mono">Valid Rows</span>
              <p className="text-lg font-bold text-emerald-400 font-mono">{validationResult.validRows.length}</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
              <span className="text-[10px] text-rose-400 uppercase font-mono">Invalid Rows</span>
              <p className="text-lg font-bold text-rose-400 font-mono">{validationResult.invalidRows.length}</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3">
              <span className="text-[10px] text-amber-400 uppercase font-mono">Duplicates</span>
              <p className="text-lg font-bold text-amber-400 font-mono">{validationResult.duplicateRows.length}</p>
            </div>
          </div>

          {/* Missing Required Columns Alert */}
          {validationResult.missingRequiredColumns.length > 0 && (
            <div className="rounded-lg bg-rose-950/40 border border-rose-500/30 p-4 text-xs text-rose-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-rose-300">
                <ShieldAlert className="h-4 w-4" />
                <span>Missing Required Columns for Active Template:</span>
              </div>
              <p className="font-mono text-rose-400">
                {validationResult.missingRequiredColumns.join(', ')}
              </p>
            </div>
          )}

          {/* Bad Rows Detailed Listing (Nothing silently skipped!) */}
          {validationResult.invalidRows.length > 0 && (
            <div className="rounded-lg bg-rose-950/30 border border-rose-500/30 p-4 space-y-2 text-xs">
              <div className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <span>Exact Line Breakdown of Invalid Rows (Zero Tolerance Policy):</span>
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
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-slate-300">Validated Recipient Preview:</span>
                <span>Showing first {Math.min(5, validationResult.validRows.length)} records</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="border-b border-slate-800 font-mono text-[10px] text-slate-400 bg-slate-900/40">
                    <tr>
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Credential</th>
                      <th className="px-3 py-2">Issue Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                    {validationResult.validRows.slice(0, 5).map((r) => (
                      <tr key={r.rowNumber}>
                        <td className="px-3 py-2 text-slate-500">#{r.rowNumber}</td>
                        <td className="px-3 py-2 text-white font-sans font-medium">{r.data.name}</td>
                        <td className="px-3 py-2 text-slate-400">{r.data.email}</td>
                        <td className="px-3 py-2 text-amber-300">{r.data.credential}</td>
                        <td className="px-3 py-2 text-slate-400">{r.data.issue_date}</td>
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
        <div className="rounded-xl border border-amber-500/30 bg-slate-900/80 p-6 space-y-6 shadow-xl">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-mono text-slate-950 font-bold">
                4
              </span>
              <span>Issuance Authority & Batch Parameters</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Confirm batch parameters before signing canonical records.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Batch Name / Cohort Identifier *
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g. Cohort 2026-B: Advanced Data Science"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Issuing Authority Identity
              </label>
              <input
                type="text"
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                placeholder="e.g. LUMOS Certify Authority"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-rose-950/40 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              <span className="text-slate-200 font-semibold">{validationResult.validRows.length}</span> certificates will be signed with Ed25519 and assigned sequential identifiers.
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCreateBatch}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 active:scale-98 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing & Creating Batch...</span>
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
