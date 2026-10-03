'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  Download,
  Plus,
  Trash2,
  Palette,
  QrCode,
  Layers,
  Check,
  AlertCircle,
  Eye,
  Sliders,
} from 'lucide-react';
import { CertificateTemplate, PlaceholderConfig } from '@/lib/types';
import TemplateCanvas from './TemplateCanvas';

interface TemplateDesignerEditorProps {
  initialTemplate: CertificateTemplate;
  isNew?: boolean;
}

export default function TemplateDesignerEditor({
  initialTemplate,
  isNew = false,
}: TemplateDesignerEditorProps) {
  const router = useRouter();
  const [template, setTemplate] = useState<CertificateTemplate>(initialTemplate);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialTemplate.placeholders[0]?.id || null
  );
  const [activeTab, setActiveTab] = useState<'placeholders' | 'qr' | 'settings'>('placeholders');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPlaceholder = template.placeholders.find((p) => p.id === selectedId) || null;

  // Update a placeholder
  const updatePlaceholder = (id: string, updates: Partial<PlaceholderConfig>) => {
    setTemplate((prev) => ({
      ...prev,
      placeholders: prev.placeholders.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  // Update position via canvas drag
  const handleUpdatePosition = (id: string, x: number, y: number) => {
    updatePlaceholder(id, { x, y });
  };

  // Add new custom placeholder
  const handleAddPlaceholder = () => {
    const newId = `p-${Date.now().toString().slice(-4)}`;
    const newPlaceholder: PlaceholderConfig = {
      id: newId,
      key: `custom_${newId}`,
      label: 'New Field',
      x: 50,
      y: 65,
      fontSize: 16,
      fontFamily: 'sans',
      fontWeight: 'normal',
      color: '#FFFFFF',
      textAlign: 'center',
      required: false,
      sampleValue: 'Custom Value',
    };

    setTemplate((prev) => ({
      ...prev,
      placeholders: [...prev.placeholders, newPlaceholder],
    }));
    setSelectedId(newId);
  };

  // Delete placeholder
  const handleDeletePlaceholder = (id: string) => {
    setTemplate((prev) => ({
      ...prev,
      placeholders: prev.placeholders.filter((p) => p.id !== id),
    }));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  // Save template
  const handleSave = async () => {
    if (!template.name.trim()) {
      setErrorMessage('Please give your template a name.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        throw new Error('Failed to save template.');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      if (isNew) {
        router.push(`/templates/${template.id}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save error.';
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${template.id}_layout.json`);
    downloadAnchor.click();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <Link href="/templates" className="hover:underline text-slate-400">
              TEMPLATES
            </Link>
            <span>/</span>
            <span>{template.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-serif flex items-center gap-2">
            <span>{template.name}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors"
            title="Export layout specification JSON (Blueprint §4.1)"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleSave}
            type="button"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition-all"
          >
            {saveSuccess ? (
              <>
                <Check className="h-4 w-4 stroke-[2.5]" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 stroke-[2.5]" />
                <span>Save Template</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-rose-950/40 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Designer Grid: Canvas (2 cols) + Controls Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Visual Canvas Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Eye className="h-3.5 w-3.5 text-amber-400" />
              <span>Interactive Drag-and-Drop Canvas</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Click elements to edit position & typography
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-2xl">
            <TemplateCanvas
              template={template}
              selectedPlaceholderId={selectedId}
              onSelectPlaceholder={(id) => setSelectedId(id)}
              onUpdatePlaceholderPosition={handleUpdatePosition}
              isEditable={true}
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Dimensions: {template.width}px × {template.height}px (Standard Landscape)</span>
            <span className="font-mono text-amber-300/80">QR block placed at {template.qrConfig.x}%, {template.qrConfig.y}%</span>
          </div>
        </div>

        {/* Right: Sidebar Configuration Controls */}
        <div className="space-y-4">
          {/* Tab Switcher */}
          <div className="flex rounded-xl border border-slate-800 bg-slate-900/80 p-1">
            <button
              onClick={() => setActiveTab('placeholders')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'placeholders'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Fields ({template.placeholders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'qr'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>QR Anchor</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Theme</span>
            </button>
          </div>

          {/* TAB 1: Placeholders List & Editor */}
          {activeTab === 'placeholders' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-100">Placeholder Fields</h3>
                <button
                  onClick={handleAddPlaceholder}
                  type="button"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Field</span>
                </button>
              </div>

              {/* Placeholder Pill Selector */}
              <div className="flex flex-wrap gap-1.5">
                {template.placeholders.map((p) => {
                  const isSelected = p.id === selectedId;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                          : 'border-slate-800 bg-slate-950/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.label || p.key}
                    </button>
                  );
                })}
              </div>

              {/* Detailed Selected Placeholder Editor */}
              {selectedPlaceholder ? (
                <div className="pt-3 border-t border-slate-800 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-amber-400 font-bold">
                      {`{{${selectedPlaceholder.key}}}`}
                    </span>
                    <button
                      onClick={() => handleDeletePlaceholder(selectedPlaceholder.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                      title="Delete Placeholder"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Field Label</label>
                      <input
                        type="text"
                        value={selectedPlaceholder.label}
                        onChange={(e) =>
                          updatePlaceholder(selectedPlaceholder.id, { label: e.target.value })
                        }
                        className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">CSV Header Key</label>
                      <input
                        type="text"
                        value={selectedPlaceholder.key}
                        onChange={(e) =>
                          updatePlaceholder(selectedPlaceholder.id, { key: e.target.value })
                        }
                        className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Position Sliders */}
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-slate-400">
                        <span>Horizontal X: {selectedPlaceholder.x}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={selectedPlaceholder.x}
                        onChange={(e) =>
                          updatePlaceholder(selectedPlaceholder.id, { x: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-400">
                        <span>Vertical Y: {selectedPlaceholder.y}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="95"
                        value={selectedPlaceholder.y}
                        onChange={(e) =>
                          updatePlaceholder(selectedPlaceholder.id, { y: Number(e.target.value) })
                        }
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* Typography & Color */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Font Family</label>
                      <select
                        value={selectedPlaceholder.fontFamily}
                        onChange={(e) =>
                          updatePlaceholder(selectedPlaceholder.id, {
                            fontFamily: e.target.value as 'serif' | 'sans' | 'mono',
                          })
                        }
                        className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-white"
                      >
                        <option value="serif">Serif</option>
                        <option value="sans">Sans-serif</option>
                        <option value="mono">Monospace</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Size ({selectedPlaceholder.fontSize}pt)</label>
                      <input
                        type="number"
                        min="8"
                        max="72"
                        value={selectedPlaceholder.fontSize}
                        onChange={(e) =>
                          updatePlaceholder(selectedPlaceholder.id, { fontSize: Number(e.target.value) })
                        }
                        className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Color</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={selectedPlaceholder.color}
                          onChange={(e) =>
                            updatePlaceholder(selectedPlaceholder.id, { color: e.target.value })
                          }
                          className="h-8 w-8 rounded bg-transparent cursor-pointer border border-slate-800"
                        />
                        <span className="font-mono text-[10px] text-slate-300">
                          {selectedPlaceholder.color}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 mb-1">Text Alignment</label>
                      <select
                        value={selectedPlaceholder.textAlign}
                        onChange={(e) =>
                          updatePlaceholder(selectedPlaceholder.id, {
                            textAlign: e.target.value as 'left' | 'center' | 'right',
                          })
                        }
                        className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-white"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Font Weight</label>
                      <select
                        value={selectedPlaceholder.fontWeight}
                        onChange={(e) =>
                          updatePlaceholder(selectedPlaceholder.id, {
                            fontWeight: e.target.value as 'normal' | 'bold' | '600',
                          })
                        }
                        className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-white"
                      >
                        <option value="normal">Normal</option>
                        <option value="600">Semi-Bold</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Sample Preview Text</label>
                    <input
                      type="text"
                      value={selectedPlaceholder.sampleValue}
                      onChange={(e) =>
                        updatePlaceholder(selectedPlaceholder.id, { sampleValue: e.target.value })
                      }
                      className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-white"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">
                  Select a placeholder above or click one on the canvas to inspect and edit.
                </p>
              )}
            </div>
          )}

          {/* TAB 2: QR Code Configuration */}
          {activeTab === 'qr' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <QrCode className="h-4 w-4 text-cyan-400" />
                <span>QR Code Anchor Block (Blueprint §4.1)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Fixed corner recommended — bottom-right is standard. The QR contains the Ed25519 signature anchor.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Position Horizontal X: {template.qrConfig.x}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={template.qrConfig.x}
                    onChange={(e) =>
                      setTemplate((prev) => ({
                        ...prev,
                        qrConfig: { ...prev.qrConfig, x: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Position Vertical Y: {template.qrConfig.y}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={template.qrConfig.y}
                    onChange={(e) =>
                      setTemplate((prev) => ({
                        ...prev,
                        qrConfig: { ...prev.qrConfig, y: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>QR Block Size: {template.qrConfig.size}px</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="180"
                    value={template.qrConfig.size}
                    onChange={(e) =>
                      setTemplate((prev) => ({
                        ...prev,
                        qrConfig: { ...prev.qrConfig, size: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">QR Label Text</label>
                  <input
                    type="text"
                    value={template.qrConfig.label}
                    onChange={(e) =>
                      setTemplate((prev) => ({
                        ...prev,
                        qrConfig: { ...prev.qrConfig, label: e.target.value },
                      }))
                    }
                    className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Theme & Template Settings */}
          {activeTab === 'settings' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Palette className="h-4 w-4 text-amber-400" />
                <span>Background & Styling</span>
              </h3>

              <div>
                <label className="block text-slate-400 mb-1">Template Name</label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => setTemplate((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  value={template.description}
                  onChange={(e) => setTemplate((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded bg-slate-950 border border-slate-800 p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-2">Preset Aesthetic</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'executive-gold', label: 'Executive Gold & Navy' },
                    { id: 'tech-blue', label: 'Tech Obsidian & Cyan' },
                    { id: 'classic-crimson', label: 'Classic Ivory & Crimson' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() =>
                        setTemplate((prev) => ({
                          ...prev,
                          backgroundStyle: bg.id as CertificateTemplate['backgroundStyle'],
                        }))
                      }
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        template.backgroundStyle === bg.id
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-semibold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
