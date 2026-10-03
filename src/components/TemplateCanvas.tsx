'use client';

import React from 'react';
import { CertificateTemplate, PlaceholderConfig } from '@/lib/types';
import { QrCode } from 'lucide-react';

interface TemplateCanvasProps {
  template: CertificateTemplate;
  selectedPlaceholderId?: string | null;
  onSelectPlaceholder?: (id: string | null) => void;
  onUpdatePlaceholderPosition?: (id: string, x: number, y: number) => void;
  onUpdateQrPosition?: (x: number, y: number) => void;
  sampleOverrides?: Record<string, string>;
  isEditable?: boolean;
}

export default function TemplateCanvas({
  template,
  selectedPlaceholderId,
  onSelectPlaceholder,
  onUpdatePlaceholderPosition,
  sampleOverrides,
  isEditable = false,
}: TemplateCanvasProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Background styling CSS classes / inline styles
  const getBackgroundStyle = () => {
    switch (template.backgroundStyle) {
      case 'executive-gold':
        return {
          backgroundColor: '#0B1329',
          border: '12px double #D4AF37',
        };
      case 'tech-blue':
        return {
          backgroundColor: '#030712',
          border: '8px solid #0284C7',
          backgroundImage: 'radial-gradient(#082F49 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        };
      case 'classic-crimson':
        return {
          backgroundColor: '#FFFDF5',
          border: '10px double #881337',
        };
      default:
        return {
          backgroundColor: '#0F172A',
          border: '8px solid #334155',
        };
    }
  };

  const getFontFamily = (family: string) => {
    switch (family) {
      case 'serif':
        return 'Georgia, "Times New Roman", serif';
      case 'mono':
        return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      case 'sans':
      default:
        return 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    }
  };

  // Dragging support for interactive design
  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    if (!isEditable) return;
    e.stopPropagation();
    setDraggingId(id);
    if (onSelectPlaceholder) {
      onSelectPlaceholder(id);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isEditable || !draggingId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

    if (draggingId === 'qr') {
      // QR dragging
      if (template.qrConfig && onUpdatePlaceholderPosition) {
        // onUpdateQrPosition
      }
    } else if (onUpdatePlaceholderPosition) {
      onUpdatePlaceholderPosition(draggingId, Math.round(x), Math.round(y));
    }
  };

  const handlePointerUp = () => {
    setDraggingId(null);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => onSelectPlaceholder && onSelectPlaceholder(null)}
      className="relative w-full aspect-[1056/816] rounded-xl overflow-hidden shadow-2xl select-none"
      style={getBackgroundStyle()}
    >
      {/* Decorative inner frame for Executive Gold */}
      {template.backgroundStyle === 'executive-gold' && (
        <div className="absolute inset-3 border border-amber-500/40 pointer-events-none rounded-sm">
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-400" />
        </div>
      )}

      {/* Decorative inner frame for Tech Blue */}
      {template.backgroundStyle === 'tech-blue' && (
        <div className="absolute inset-3 border border-cyan-500/30 pointer-events-none">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
        </div>
      )}

      {/* Placeholders */}
      {template.placeholders.map((p: PlaceholderConfig) => {
        const isSelected = selectedPlaceholderId === p.id;
        const textVal = sampleOverrides?.[p.key] || p.sampleValue || `{{${p.key}}}`;

        let transform = 'translate(-50%, -50%)';
        if (p.textAlign === 'left') transform = 'translate(0, -50%)';
        if (p.textAlign === 'right') transform = 'translate(-100%, -50%)';

        return (
          <div
            key={p.id}
            onPointerDown={(e) => handlePointerDown(p.id, e)}
            className={`absolute transition-shadow ${
              isEditable ? 'cursor-move' : ''
            } ${
              isSelected
                ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 bg-amber-500/10 rounded px-1.5 py-0.5'
                : isEditable
                ? 'hover:outline hover:outline-1 hover:outline-dashed hover:outline-amber-400/50'
                : ''
            }`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform,
              fontFamily: getFontFamily(p.fontFamily),
              fontSize: `clamp(10px, ${p.fontSize * 0.08}vw, ${p.fontSize}px)`,
              fontWeight: p.fontWeight === 'bold' ? 700 : p.fontWeight === '600' ? 600 : 400,
              color: p.color,
              textAlign: p.textAlign,
            }}
          >
            {textVal}
          </div>
        );
      })}

      {/* QR Code Block */}
      {template.qrConfig && (
        <div
          onPointerDown={(e) => handlePointerDown('qr', e)}
          className={`absolute flex flex-col items-center justify-center p-1.5 rounded-lg shadow-lg ${
            isEditable ? 'cursor-move' : ''
          } ${
            selectedPlaceholderId === 'qr'
              ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900'
              : ''
          }`}
          style={{
            left: `${template.qrConfig.x}%`,
            top: `${template.qrConfig.y}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: template.qrConfig.lightColor || '#ffffff',
          }}
        >
          <div className="relative flex items-center justify-center p-1">
            <QrCode
              className="w-14 h-14 md:w-16 md:h-16"
              style={{ color: template.qrConfig.darkColor || '#000000' }}
            />
          </div>
          {template.qrConfig.includeLabel && (
            <span
              className="text-[9px] font-bold tracking-wider mt-0.5"
              style={{ color: template.qrConfig.darkColor || '#000000' }}
            >
              {template.qrConfig.label || 'SCAN TO VERIFY'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
