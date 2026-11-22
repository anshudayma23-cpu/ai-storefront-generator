'use client';

import React, { useState } from 'react';
import { Bio } from '@/lib/types';
import { RefreshCw, Check } from 'lucide-react';

interface BioSectionProps {
  bio: Bio;
  displayName: string;
  niche?: string | null;
  onChange: (updatedBio: Bio, updatedDisplayName: string) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function BioSection({
  bio,
  displayName,
  niche,
  onChange,
  onRegenerate,
  isRegenerating,
}: BioSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [headline, setHeadline] = useState(bio.headline);
  const [text, setText] = useState(bio.text);
  const [name, setName] = useState(displayName);

  const handleSave = () => {
    setIsEditing(false);
    onChange({ headline, text }, name);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm space-y-4 relative group">
      {/* Top Bar with Section Label and Regenerate */}
      <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Store Profile</span>
          {niche && (
            <span className="text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full font-medium">
              {niche}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          title="Regenerate Bio"
          className="text-neutral-400 hover:text-neutral-900 transition-colors p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-50 flex items-center gap-1 text-xs font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Regenerate</span>
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase">Creator / Store Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-base font-bold text-neutral-900 p-2 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase">Headline</label>
            <input
              type="text"
              value={headline}
              maxLength={60}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full text-sm font-semibold text-neutral-800 p-2 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase">Bio Description</label>
            <textarea
              rows={3}
              value={text}
              maxLength={280}
              onChange={(e) => setText(e.target.value)}
              className="w-full text-xs text-neutral-600 p-2 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none resize-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="bg-neutral-900 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" /> Save Changes
          </button>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer group-hover:bg-neutral-50/50 -m-2 p-2 rounded-xl transition-colors space-y-1"
          title="Click to edit bio"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 leading-snug">{displayName}</h2>
              <p className="text-xs text-neutral-400">Tap to edit bio</p>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-neutral-800 pt-2">{bio.headline}</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">{bio.text}</p>
        </div>
      )}
    </div>
  );
}
