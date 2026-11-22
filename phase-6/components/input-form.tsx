'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Instagram, ArrowRight, HelpCircle } from 'lucide-react';

interface InputFormProps {
  onGenerate: (data: { description: string; handle?: string; language: string }) => void;
  isLoading: boolean;
  clarifyingQuestion?: string | null;
}

const EXAMPLES = [
  {
    label: '🏋️ Fitness Coach',
    text: 'Fitness coach helping office workers lose belly fat with 20min home workouts and practical meal swaps.',
  },
  {
    label: '💰 Tax & Finance',
    text: 'Chartered Accountant helping salaried professionals save taxes under the new regime and invest in index funds.',
  },
  {
    label: '🍳 Desi Cooking',
    text: 'Home chef sharing authentic regional Indian recipes, meal prep plans for bachelors, and weekly grocery lists.',
  },
  {
    label: '🎨 UI/UX Designer',
    text: 'Freelance product designer mentoring junior designers with portfolio reviews, Figma system kits, and mock interview preps.',
  },
];

export function InputForm({ onGenerate, isLoading, clarifyingQuestion }: InputFormProps) {
  const [description, setDescription] = useState('');
  const [handle, setHandle] = useState('');
  const [language, setLanguage] = useState<'en' | 'hinglish' | 'hi'>('en');

  // Auto-detect Hinglish or Hindi
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDescription(val);

    if (/[\u0900-\u097F]/.test(val)) {
      setLanguage('hi');
    } else if (/\b(karein|apna|kaise|mein|aur|nahi|ke|hai)\b/i.test(val)) {
      setLanguage('hinglish');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length >= 10 && description.trim().length <= 600) {
      onGenerate({ description: description.trim(), handle: handle.trim() || undefined, language });
    }
  };

  const isLengthValid = description.trim().length >= 10 && description.trim().length <= 600;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Clarifying Question Banner */}
      {clarifyingQuestion && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm flex items-start gap-3 animate-in fade-in">
          <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-950">Quick question to help us design your store:</p>
            <p className="mt-1">{clarifyingQuestion}</p>
          </div>
        </div>
      )}

      {/* Description Textarea */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-neutral-500 font-medium">
          <label htmlFor="description" className="text-neutral-700 font-semibold text-sm">
            What do you do or teach? <span className="text-red-500">*</span>
          </label>
          <span className={description.length > 600 ? 'text-red-500 font-bold' : ''}>
            {description.length} / 600 chars
          </span>
        </div>
        <textarea
          id="description"
          value={description}
          onChange={handleDescriptionChange}
          placeholder="e.g. Fitness coach helping desk workers lose fat without gym, sharing home workouts and desi diet plans..."
          rows={4}
          maxLength={600}
          className="w-full p-3.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm outline-none transition-all placeholder:text-neutral-400 resize-none shadow-sm"
        />
        <p className="text-xs text-neutral-400">Minimum 10 characters.</p>
      </div>

      {/* Tap-to-Fill Example Chips */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tap an example to start:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => setDescription(ex.text)}
              className="text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium px-3 py-1.5 rounded-lg transition-colors border border-neutral-200/60"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Handle & Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1.5">
          <label htmlFor="handle" className="text-xs font-semibold text-neutral-700">
            Instagram Handle <span className="text-neutral-400 font-normal">(Optional boost)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
              <Instagram className="w-4 h-4" />
            </span>
            <input
              id="handle"
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="username or @name"
              className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 text-sm outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-700">Language & Tone</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['en', 'hinglish', 'hi'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`text-xs py-2.5 rounded-xl font-medium border transition-all text-center ${
                  language === lang
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                    : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {lang === 'en' ? 'English' : lang === 'hinglish' ? 'Hinglish' : 'हिंदी'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Submit Button */}
      <div className="pt-4 sticky bottom-4 z-10 bg-white/80 backdrop-blur-md pb-2 -mx-2 px-2">
        <Button
          type="submit"
          disabled={!isLengthValid || isLoading}
          className="w-full h-12 text-base font-semibold shadow-md flex items-center justify-center gap-2 rounded-xl"
        >
          {isLoading ? (
            'Preparing your store...'
          ) : (
            <>
              Generate my store <Sparkles className="w-4 h-4 text-amber-300" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
