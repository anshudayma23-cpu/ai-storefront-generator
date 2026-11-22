'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GeneratingScreenProps {
  onCancel?: () => void;
}

const MESSAGES = [
  'Reading your profile signals...',
  'Analyzing your audience & niche...',
  'Picking products your audience will pay for...',
  'Calibrating INR prices for micro-creators...',
  'Crafting high-converting bio & descriptions...',
  'Almost ready to preview...',
];

export function GeneratingScreen({ onCancel }: GeneratingScreenProps) {
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2800);

    const elapsedTimer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(elapsedTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
      <div className="max-w-sm w-full space-y-6">
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-neutral-100 animate-pulse" />
          <Loader2 className="w-8 h-8 text-neutral-900 animate-spin" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 transition-all duration-300">
            {MESSAGES[index]}
          </h2>
          <p className="text-xs text-neutral-500">
            {elapsed > 14
              ? 'Taking a little longer than usual to polish your offerings...'
              : 'Generating your ready-to-publish storefront in under a minute.'}
          </p>
        </div>

        {/* Skeleton Preview representation */}
        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/60 space-y-3 opacity-60">
          <div className="h-4 bg-neutral-200 rounded-md w-3/4 mx-auto animate-pulse" />
          <div className="h-3 bg-neutral-200 rounded-md w-1/2 mx-auto animate-pulse" />
          <div className="pt-2 grid grid-cols-2 gap-2">
            <div className="h-16 bg-neutral-200 rounded-xl animate-pulse" />
            <div className="h-16 bg-neutral-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            type="button"
            className="text-xs text-neutral-400 hover:text-neutral-700 underline font-medium pt-2 transition-colors"
          >
            Cancel and edit input
          </button>
        )}
      </div>
    </div>
  );
}
