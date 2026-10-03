'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import { Camera, Upload, X, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface QrScannerModalProps {
  onClose: () => void;
}

export default function QrScannerModal({ onClose }: QrScannerModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ certId: string; sig: string } | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const processDecodedString = useCallback((decodedText: string) => {
    try {
      // Check if it's a verify URL, e.g., https://lumos-certify.example.com/verify/CERT-2026-000001?sig=XYZ
      let certId = '';
      let sig = '';

      if (decodedText.includes('/verify/')) {
        const url = new URL(decodedText, window.location.origin);
        const segments = url.pathname.split('/');
        certId = decodeURIComponent(segments[segments.length - 1] || '');
        sig = url.searchParams.get('sig') || '';
      } else if (decodedText.startsWith('CERT-')) {
        // Raw cert ID
        certId = decodedText;
      }

      if (certId) {
        setSuccessInfo({ certId, sig });
        // Redirect after short delay so user sees confirmation
        setTimeout(() => {
          onClose();
          const targetUrl = sig
            ? `/verify/${encodeURIComponent(certId)}?sig=${encodeURIComponent(sig)}`
            : `/verify/${encodeURIComponent(certId)}`;
          router.push(targetUrl);
        }, 800);
        return true;
      } else {
        setErrorMessage(`QR code recognized but did not contain a valid certificate link: "${decodedText.slice(0, 40)}..."`);
        return false;
      }
    } catch {
      setErrorMessage(`Could not parse QR code data: "${decodedText.slice(0, 40)}"`);
      return false;
    }
  }, [router, onClose]);

  // Start camera
  const startCamera = useCallback(async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setErrorMessage('Camera access unavailable. You can upload an image of the QR code instead.');
      setActiveTab('upload');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Frame scanning loop
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, startCamera, stopCamera]);

  useEffect(() => {
    if (!isScanning) return;

    const scanFrame = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvasRef.current = canvas;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            stopCamera();
            processDecodedString(code.data);
            return;
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isScanning, processDecodedString, stopCamera]);

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setErrorMessage('Could not process image.');
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          processDecodedString(code.data);
        } else {
          setErrorMessage('No valid QR code was detected in the uploaded image. Please try a clearer image.');
        }
      };
      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="font-semibold text-slate-100 text-base">QR Certificate Scanner</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'camera'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="h-4 w-4" />
            Live Camera
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload Image
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successInfo ? (
            <div className="rounded-xl bg-emerald-950/50 border border-emerald-500/30 p-6 text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
              <div>
                <p className="font-bold text-emerald-200 text-sm">Certificate QR Detected!</p>
                <p className="font-mono text-xs text-emerald-300 mt-1">{successInfo.certId}</p>
              </div>
              <p className="text-[11px] text-emerald-400/80">Verifying signature with server registry...</p>
            </div>
          ) : activeTab === 'camera' ? (
            <div className="space-y-4">
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
                {/* Viewfinder overlay */}
                <div className="absolute inset-8 border-2 border-dashed border-amber-400/60 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="h-12 w-12 border-2 border-amber-400 rounded-lg animate-ping opacity-25" />
                </div>
                {!isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 p-4 text-center">
                    <RefreshCw className="h-8 w-8 text-amber-400 animate-spin mb-2" />
                    <p className="text-xs text-slate-300">Initializing camera sensor...</p>
                  </div>
                )}
              </div>
              <p className="text-center text-xs text-slate-400">
                Center the certificate&apos;s QR code in the viewport to verify instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center aspect-square w-full rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-950/40 hover:bg-slate-950/80 cursor-pointer p-6 transition-all group">
                <Upload className="h-10 w-10 text-slate-500 group-hover:text-amber-400 mb-3 transition-colors" />
                <span className="text-sm font-medium text-slate-200 group-hover:text-amber-300">
                  Select Certificate Photo or QR
                </span>
                <span className="text-xs text-slate-500 mt-1">PNG, JPG, WebP up to 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-red-950/40 border border-red-500/30 p-3 text-red-200 text-xs">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950/40 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>Cryptographic QR Reader</span>
          <span>RFC 8032</span>
        </div>
      </div>
    </div>
  );
}
