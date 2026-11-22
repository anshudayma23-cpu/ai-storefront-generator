import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-neutral-200/80 shadow-sm space-y-5">
        <div className="w-14 h-14 bg-neutral-100 text-neutral-800 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          404
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">This store doesn't exist yet</h2>
          <p className="text-xs text-neutral-500">
            The link you opened might be mistyped, deleted, or is still waiting to be published.
          </p>
        </div>

        <Link href="/" className="block">
          <Button className="w-full text-xs font-semibold h-11 rounded-xl shadow-sm flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Create your own storefront
          </Button>
        </Link>
      </div>
    </div>
  );
}
