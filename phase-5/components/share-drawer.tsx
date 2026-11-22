'use client';

import React, { useState } from 'react';
import { Copy, Check, Share2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareDrawerProps {
  slug: string;
  displayName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDrawer({ slug, displayName, isOpen, onClose }: ShareDrawerProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const publicUrl = `${appUrl}/s/${slug}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Check out ${displayName}'s store: ${publicUrl}`
  )}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${displayName}'s Storefront`,
          text: `Check out ${displayName}'s digital products and sessions!`,
          url: publicUrl,
        });
      } catch (err) {
        // Ignored or dismissed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl border border-neutral-200 animate-in slide-in-from-bottom duration-200 text-center">
        <div className="w-12 h-12 bg-neutral-900 text-white rounded-2xl flex items-center justify-center mx-auto text-xl font-bold shadow-md">
          🚀
        </div>

        <div>
          <h3 className="font-extrabold text-lg text-neutral-900">Your Store is Live!</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Share this link with your audience across Instagram, WhatsApp, and YouTube.
          </p>
        </div>

        {/* Copy Link Input Bar */}
        <div className="flex items-center gap-2 p-1.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="bg-transparent pl-2.5 flex-1 text-neutral-700 outline-none select-all text-xs"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 shadow-sm transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Action Share Buttons */}
        <div className="space-y-2 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors block"
          >
            <span>💬 Share directly on WhatsApp</span>
          </a>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Sheet
            </button>

            <a
              href={`/s/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Store
            </a>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-neutral-400 hover:text-neutral-700 font-medium pt-1"
        >
          Close and keep editing
        </button>
      </div>
    </div>
  );
}
