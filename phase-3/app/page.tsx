'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputForm } from '@/components/input-form';
import { GeneratingScreen } from '@/components/generating-screen';

export default function HomePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [clarifyingQuestion, setClarifyingQuestion] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const handleGenerate = async (formData: { description: string; handle?: string; language: string }) => {
    setIsGenerating(true);
    setClarifyingQuestion(null);
    setErrorBanner(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to generate store');
      }

      if (data.status === 'needs_more_info') {
        setIsGenerating(false);
        setClarifyingQuestion(data.clarifying_question);
        return;
      }

      if (data.slug && data.edit_token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`edit_token_${data.slug}`, data.edit_token);
        }
        router.push(`/edit/${data.slug}?t=${data.edit_token}`);
      } else {
        throw new Error('Did not receive store identifier.');
      }
    } catch (err: any) {
      setIsGenerating(false);
      setErrorBanner(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Full screen progress overlay */}
      {isGenerating && <GeneratingScreen onCancel={() => setIsGenerating(false)} />}

      <div className="max-w-md w-full mx-auto space-y-6 pt-4 sm:pt-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-semibold shadow-sm">
            <span>✨ AI Storefront Generator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 leading-tight">
            Your link-in-bio store, ready in a minute.
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-xs mx-auto">
            Describe what you do. We write your bio, pick high-converting products, and calibrate prices in rupees.
          </p>
        </div>

        {/* Global Error Banner if any */}
        {errorBanner && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs text-center font-medium">
            {errorBanner}
          </div>
        )}

        {/* Main Card Form */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-sm">
          <InputForm
            onGenerate={handleGenerate}
            isLoading={isGenerating}
            clarifyingQuestion={clarifyingQuestion}
          />
        </div>

        {/* Value Proposition Micro-bullets */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium text-neutral-500 pt-2">
          <div>⚡ 60s Generation</div>
          <div>💰 INR Price Strategy</div>
          <div>✏️ 100% Editable</div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-neutral-400 py-6">
        Built with Google Antigravity & SuperProfile specs. Free tools only.
      </footer>
    </main>
  );
}
