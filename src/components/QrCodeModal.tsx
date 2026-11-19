import { useEffect, useState } from 'react';
import { Check, Copy, Download, ExternalLink, QrCode, Share2, Smartphone, X } from 'lucide-react';
import type { WishConfig } from '../types/wish';
import { generateQrPngDataUrl } from '../utils/qrCode';
import { buildQrDownloadFilename, buildShareUrl, isLocalhostUrl } from '../utils/wishLogic';

interface QrCodeModalProps {
  wish: WishConfig;
  isOpen: boolean;
  isSaving: boolean;
  saveError: string;
  lastSavedId: string | null;
  onClose: () => void;
}

export function QrCodeModal({
  wish,
  isOpen,
  isSaving,
  saveError,
  lastSavedId,
  onClose,
}: QrCodeModalProps) {
  const [qrPngUrl, setQrPngUrl] = useState<string>('');
  const [qrError, setQrError] = useState<string>('');
  const [downloadedNotice, setDownloadedNotice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeId = lastSavedId || wish.id;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const shareUrl = buildShareUrl(origin, activeId);
  const pngFilename = buildQrDownloadFilename(wish.recipientName, wish.occasion);
  const localhostHint = isLocalhostUrl(shareUrl);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setQrError('');

    generateQrPngDataUrl(shareUrl)
      .then((dataUrl) => {
        if (!cancelled) {
          setQrPngUrl(dataUrl);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setQrError(err instanceof Error ? err.message : 'Unable to generate QR code.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleDownloadQrPng = () => {
    if (!qrPngUrl) return;
    const anchor = document.createElement('a');
    anchor.href = qrPngUrl;
    anchor.download = pngFilename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setDownloadedNotice(true);
    setTimeout(() => setDownloadedNotice(false), 2600);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="QR code sharing"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-red-600 text-white">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="text-base font-bold leading-tight">QR Code Sharing</h2>
              <p className="text-xs text-red-100">
                Scan with phone or laptop, or click the QR to open
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR code dialog"
            className="p-1.5 rounded-md text-red-100 hover:text-white hover:bg-red-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          {saveError && (
            <p role="alert" className="w-full text-xs font-medium text-red-600 bg-red-50 p-3 rounded-md text-left">
              {saveError}
            </p>
          )}

          {qrError && (
            <p role="alert" className="w-full text-xs font-medium text-red-600 bg-red-50 p-3 rounded-md text-left">
              {qrError}
            </p>
          )}

          <div className="flex flex-col items-center">
            {isSaving || !qrPngUrl ? (
              <div
                className="w-56 h-56 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 text-xs text-slate-500"
                aria-busy="true"
              >
                <QrCode className="w-8 h-8 animate-pulse text-red-500" />
                <span>Generating QR code...</span>
              </div>
            ) : (
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Click QR code to open wish link"
                title="Click QR code to open your wish link"
                className="group relative block p-3 rounded-2xl bg-white border-2 border-slate-200 shadow-md hover:border-red-500 hover:shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2"
              >
                <img
                  src={qrPngUrl}
                  alt={`Scannable QR code for ${wish.recipientName}'s ${wish.occasion} wish`}
                  className="w-52 h-52 sm:w-56 sm:h-56 object-contain rounded-lg"
                />
                <span className="mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-red-600 group-hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Click QR code to open link</span>
                </span>
              </a>
            )}
          </div>

          <div className="w-full space-y-2.5 pt-1">
            <button
              type="button"
              disabled={isSaving || !qrPngUrl}
              onClick={handleDownloadQrPng}
              className="w-full py-2.5 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              {downloadedNotice ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved as PNG ({pngFilename})</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Share the QR code (Save PNG)</span>
                </>
              )}
            </button>

            <p className="text-xs text-slate-600 flex items-center justify-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span>Or scan it directly with any phone or laptop camera to open this wish.</span>
            </p>
          </div>

          <div className="w-full pt-3 border-t border-slate-200 space-y-2 text-left">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                aria-label="QR code destination link"
                value={shareUrl}
                className="flex-1 px-2.5 py-1.5 text-[11px] font-mono bg-slate-50 border border-slate-200 rounded-md text-slate-700 truncate"
              />
              <button
                type="button"
                onClick={() => void handleCopyLink()}
                className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1 shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {wish.passwordEnabled && (
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Share2 className="w-3 h-3 shrink-0 text-slate-400" aria-hidden="true" />
                <span>
                  Unlock password: <strong className="text-slate-700">{wish.password}</strong>
                  {wish.passwordHint ? ` · Hint: ${wish.passwordHint}` : ''}
                </span>
              </p>
            )}

            {localhostHint && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                Tip: This QR links to localhost on your device. Open the live/shared URL or your Wi-Fi IP so phones can scan and open it too.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
