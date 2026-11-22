import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/db/client';
import { Store, Product, Theme } from '@/lib/types';
import { THEMES } from '@/lib/themes';
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

  // Record view event asynchronously (fire-and-forget)
  supabaseAdmin.from('events').insert({
    store_id: store.id,
    type: 'view',
  }).then(() => {});

  const currentTheme = THEMES[(store.theme as Theme) || 'clean'] || THEMES.clean;
  const products: Product[] = store.products || [];

  return (
    <div className={`min-h-screen ${currentTheme.bgClass} py-6 sm:py-12 px-4 font-sans transition-colors duration-200`}>
      <div className="max-w-md mx-auto space-y-4">
        {/* Profile Card */}
        <div className={`${currentTheme.cardClass} rounded-3xl p-6 sm:p-7 border shadow-sm text-center space-y-3 relative overflow-hidden`}>
          <div className={`w-20 h-20 ${currentTheme.accentClass} rounded-full flex items-center justify-center font-extrabold text-2xl mx-auto shadow-md`}>
            {store.display_name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h1 className={`text-xl font-extrabold tracking-tight ${currentTheme.textClass}`}>
              {store.display_name}
            </h1>
            {store.handle && (
              <a
                href={`https://instagram.com/${store.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs opacity-70 hover:opacity-100 font-medium mt-0.5"
              >
                <Instagram className="w-3.5 h-3.5" /> @{store.handle}
              </a>
            )}
          </div>

          {store.bio && (
            <div className="space-y-1.5 pt-1">
              <h2 className="text-sm font-bold opacity-90 leading-snug">
                {store.bio.headline}
              </h2>
              <p className="text-xs opacity-75 leading-relaxed max-w-sm mx-auto">
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
              className={`${currentTheme.cardClass} rounded-3xl p-5 sm:p-6 border shadow-sm space-y-3.5 transition-transform hover:-translate-y-0.5`}
            >
              {/* Product Header */}
              <div className="flex justify-between items-baseline gap-2">
                <h3 className={`font-bold text-base leading-snug ${currentTheme.textClass}`}>
                  {prod.title}
                </h3>
                <div className="text-right shrink-0">
                  <span className={`text-lg font-black ${currentTheme.textClass}`}>₹{prod.price_inr}</span>
                  <span className="text-[10px] opacity-60 block -mt-1 capitalize">
                    {prod.billing.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <p className="text-xs opacity-75 leading-relaxed">{prod.description}</p>

              {/* Outcomes List */}
              {prod.outcomes && prod.outcomes.length > 0 && (
                <ul className="space-y-1.5 pt-1">
                  {prod.outcomes.map((out, idx) => (
                    <li key={idx} className="text-xs opacity-85 flex items-start gap-2">
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
                  className={`w-full ${currentTheme.buttonClass} py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all text-center`}
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
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold opacity-70 hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full border border-black/10 shadow-xs"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Made with AI Storefront</span>
          </Link>
          <p className="text-[10px] opacity-60">
            Create your link-in-bio store in under a minute • Zero spend prototype
          </p>
        </footer>
      </div>
    </div>
  );
}

