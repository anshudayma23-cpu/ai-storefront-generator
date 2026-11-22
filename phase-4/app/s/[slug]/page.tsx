import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/db/client';
import { Store, Product } from '@/lib/types';
import { CheckCircle2, Instagram, MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

// 1. Dynamic OpenGraph & Meta Tags for WhatsApp & Social link previews
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const { data: store } = await supabaseAdmin
    .from('stores')
    .select('display_name, bio, niche')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!store) {
    return {
      title: 'Store Not Found | AI Storefront',
    };
  }

  const title = `${store.display_name} | Official Storefront`;
  const description =
    store.bio?.headline ||
    `Explore exclusive products, guides, and sessions from ${store.display_name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'AI Storefront',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function PublicStorePage({ params }: PageProps) {
  const { slug } = params;

  // 2. Fetch published store
  const { data: store, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !store || store.status !== 'published') {
    notFound();
  }

  const products: Product[] = store.products || [];

  return (
    <div className="min-h-screen bg-neutral-100/70 py-6 sm:py-12 px-4 font-sans text-neutral-900">
      <div className="max-w-md mx-auto space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200/90 shadow-sm text-center space-y-3 relative overflow-hidden">
          <div className="w-20 h-20 bg-neutral-900 text-white rounded-full flex items-center justify-center font-extrabold text-2xl mx-auto shadow-md">
            {store.display_name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-neutral-900">
              {store.display_name}
            </h1>
            {store.handle && (
              <a
                href={`https://instagram.com/${store.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 font-medium mt-0.5"
              >
                <Instagram className="w-3.5 h-3.5" /> @{store.handle}
              </a>
            )}
          </div>

          {store.bio && (
            <div className="space-y-1.5 pt-1">
              <h2 className="text-sm font-bold text-neutral-800 leading-snug">
                {store.bio.headline}
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-sm mx-auto">
                {store.bio.text}
              </p>
            </div>
          )}
        </div>

        {/* Products Listing */}
        <div className="space-y-3.5">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-neutral-200/90 shadow-sm space-y-3.5 transition-transform hover:-translate-y-0.5"
            >
              {/* Product Header */}
              <div className="flex justify-between items-baseline gap-2">
                <h3 className="font-bold text-base text-neutral-900 leading-snug">
                  {prod.title}
                </h3>
                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-neutral-900">₹{prod.price_inr}</span>
                  <span className="text-[10px] text-neutral-400 block -mt-1 capitalize">
                    {prod.billing.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">{prod.description}</p>

              {/* Outcomes List */}
              {prod.outcomes && prod.outcomes.length > 0 && (
                <ul className="space-y-1.5 pt-1">
                  {prod.outcomes.map((out, idx) => (
                    <li key={idx} className="text-xs text-neutral-700 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Action Button: opens WhatsApp or creator link */}
              <div className="pt-2">
                <a
                  href={
                    store.contact_url
                      ? store.contact_url
                      : `https://wa.me/?text=${encodeURIComponent(
                          `Hi ${store.display_name}, I'm interested in getting "${prod.title}" (₹${prod.price_inr}) from your store!`
                        )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors text-center"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{prod.cta_label || 'Contact to Get'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="text-center pt-6 pb-4 space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors bg-white/70 px-3 py-1.5 rounded-full border border-neutral-200/60 shadow-xs"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Made with AI Storefront</span>
          </Link>
          <p className="text-[10px] text-neutral-400">
            Create your link-in-bio store in under a minute
          </p>
        </footer>
      </div>
    </div>
  );
}
