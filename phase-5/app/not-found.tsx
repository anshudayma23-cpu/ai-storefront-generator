import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
        <h1 className="text-3xl font-extrabold text-neutral-900">404</h1>
        <p className="text-sm text-neutral-600">Page not found</p>
        <Link href="/">
          <Button className="text-xs font-semibold rounded-xl">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
