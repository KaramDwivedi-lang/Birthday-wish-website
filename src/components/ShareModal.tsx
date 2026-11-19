import { useState } from 'react';
import { Check, Copy, Download, Mail, MessageCircle, QrCode, Sparkles, X } from 'lucide-react';
import type { WishConfig } from '../types/wish';
import { generateStandaloneWishHtml } from '../utils/htmlExporter';
import {
  buildMailtoShareHref,
  buildShareUrl,
  buildWhatsAppShareHref,
} from '../utils/wishLogic';

interface ShareModalProps {
  wish: WishConfig;
  isOpen: boolean;
  isSaving: boolean;
  saveError: string;
  lastSavedId: string | null;
  onSaveNewCopy: () => Promise<void>;
  onUpdateExisting: () => Promise<void>;
  onOpenQr: () => void;
  onClose: () => void;
}

export function ShareModal({
  wish,
  isOpen,
  isSaving,
  saveError,
  lastSavedId,
  onSaveNewCopy,
  onUpdateExisting,
  onOpenQr,
  onClose,
}: ShareModalProps) {
  const [copiedType, setCopiedType] = useState<'link' | 'whatsapp' | 'email' | null>(null);

  if (!isOpen) return null;

  const activeId = lastSavedId || wish.id;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const shareUrl = buildShareUrl(origin, activeId);
  const whatsappHref = buildWhatsAppShareHref(wish, shareUrl);
  const mailtoHref = buildMailtoShareHref(wish, shareUrl);

  const copyText = async (text: string, type: 'link' | 'whatsapp' | 'email') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  const handleDownloadHtml = () => {
    const html = generateStandaloneWishHtml(wish);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    const safeName = wish.recipientName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'keepsake';
    anchor.download = `${safeName}-${wish.occasion.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-wish.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const whatsappInviteText = decodeURIComponent(whatsappHref.replace('https://wa.me/?text=', ''));
  const emailInviteText = `Subject: A ${wish.occasion} Surprise for ${wish.recipientName}\n\nOpen your wish here: ${shareUrl}${
    wish.passwordEnabled && wish.passwordHint ? `\nPassword hint: ${wish.passwordHint}` : ''
  }`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Save and share wish"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Save & Share Your Wish</h2>
            <p className="text-xs text-slate-500">
              Share via WhatsApp, Email, link, or downloadable HTML file
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void onSaveNewCopy()}
              className="flex-1 py-2.5 px-4 rounded-md bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save as New Share Link'}</span>
            </button>

            {wish.id !== 'nehal-birthday' && (
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void onUpdateExisting()}
                className="py-2.5 px-4 rounded-md border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Update Current
              </button>
            )}
          </div>

          {saveError && (
            <p role="alert" className="text-xs font-medium text-red-600 bg-red-50 p-3 rounded-md">
              {saveError}
            </p>
          )}

          <div>
            <label htmlFor="share-url-field" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Shareable link
            </label>
            <div className="flex gap-2">
              <input
                id="share-url-field"
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md text-slate-700"
              />
              <button
                type="button"
                onClick={() => void copyText(shareUrl, 'link')}
                className="px-3.5 py-2 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                {copiedType === 'link' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            {wish.passwordEnabled && (
              <p className="mt-1.5 text-xs text-slate-500">
                Password: <span className="font-semibold text-slate-700">{wish.password}</span> · Hint:{' '}
                {wish.passwordHint || 'None'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </a>

            <a
              href={mailtoHref}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Send via Email</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <button
              type="button"
              onClick={() => void copyText(whatsappInviteText, 'whatsapp')}
              className="text-slate-600 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
            >
              {copiedType === 'whatsapp' ? 'WhatsApp message copied!' : 'Copy WhatsApp message'}
            </button>
            <button
              type="button"
              onClick={() => void copyText(emailInviteText, 'email')}
              className="text-slate-600 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
            >
              {copiedType === 'email' ? 'Email text copied!' : 'Copy Email invite'}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Offline / QR Sharing</p>
              <p>Download interactive HTML or open a scannable QR code.</p>
            </div>
            <div className="flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="px-3 py-2 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download HTML</span>
              </button>
              <button
                type="button"
                onClick={onOpenQr}
                className="px-3 py-2 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
              >
                <QrCode className="w-3.5 h-3.5" aria-hidden="true" />
                <span>QR code sharing</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
