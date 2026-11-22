'use client';

import React, { useState } from 'react';
import { Product, ProductFormat, BillingType } from '@/lib/types';
import { RefreshCw, Trash2, Check, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onChange: (updated: Product) => void;
  onDelete: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  canDelete: boolean;
}

const FORMAT_BADGES: Record<ProductFormat, { label: string; color: string }> = {
  ebook: { label: 'PDF Guide / Ebook', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  template_pack: { label: 'Template Pack', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  recorded_course: { label: 'Recorded Course', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  cohort_course: { label: 'Live Cohort', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  one_on_one_call: { label: '1:1 Mentorship Call', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  community: { label: 'Community', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  webinar: { label: 'Live Webinar', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  workshop: { label: 'Interactive Workshop', color: 'bg-orange-50 text-orange-700 border-orange-200' },
};

export function ProductCard({
  product,
  onChange,
  onDelete,
  onRegenerate,
  isRegenerating,
  canDelete,
}: ProductCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showRationale, setShowRationale] = useState(false);

  // Edit fields
  const [title, setTitle] = useState(product.title);
  const [format, setFormat] = useState<ProductFormat>(product.format);
  const [priceInr, setPriceInr] = useState(product.price_inr);
  const [billing, setBilling] = useState<BillingType>(product.billing);
  const [description, setDescription] = useState(product.description);
  const [outcomes, setOutcomes] = useState<[string, string, string]>(product.outcomes);
  const [ctaLabel, setCtaLabel] = useState(product.cta_label);

  const handleSave = () => {
    setIsEditing(false);
    onChange({
      ...product,
      title,
      format,
      price_inr: Number(priceInr),
      billing,
      description,
      outcomes,
      cta_label: ctaLabel,
    });
  };

  const badge = FORMAT_BADGES[product.format] || { label: product.format, color: 'bg-neutral-100 text-neutral-800' };

  return (
    <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-3.5 relative group transition-all">
      {/* Card Header */}
      <div className="flex justify-between items-center">
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
          {badge.label}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            title="Regenerate this product"
            className="text-neutral-400 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete product"
              className="text-neutral-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3 pt-1 text-xs">
          <div>
            <label className="font-semibold text-neutral-500 uppercase text-[10px]">Title</label>
            <input
              type="text"
              value={title}
              maxLength={60}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full font-bold text-sm text-neutral-900 p-2 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-neutral-500 uppercase text-[10px]">Price (INR ₹)</label>
              <input
                type="number"
                value={priceInr}
                onChange={(e) => setPriceInr(Number(e.target.value))}
                className="w-full text-sm font-bold text-neutral-900 p-2 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-500 uppercase text-[10px]">Billing</label>
              <select
                value={billing}
                onChange={(e) => setBilling(e.target.value as BillingType)}
                className="w-full text-xs font-medium text-neutral-900 p-2.5 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none bg-white"
              >
                <option value="one_time">One-time</option>
                <option value="monthly">Monthly</option>
                <option value="per_session">Per Session</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-500 uppercase text-[10px]">Description</label>
            <textarea
              rows={2}
              value={description}
              maxLength={300}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs text-neutral-700 p-2 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none resize-none"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-500 uppercase text-[10px]">3 Outcome Bullets</label>
            <div className="space-y-1.5">
              {outcomes.map((bullet, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={bullet}
                  maxLength={80}
                  onChange={(e) => {
                    const newOutcomes = [...outcomes] as [string, string, string];
                    newOutcomes[idx] = e.target.value;
                    setOutcomes(newOutcomes);
                  }}
                  className="w-full text-xs text-neutral-700 p-1.5 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-500 uppercase text-[10px]">CTA Button Label</label>
            <input
              type="text"
              value={ctaLabel}
              maxLength={24}
              onChange={(e) => setCtaLabel(e.target.value)}
              className="w-full text-xs font-semibold text-neutral-900 p-2 rounded-lg border border-neutral-300 focus:border-neutral-900 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full bg-neutral-900 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" /> Save Product Details
          </button>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="cursor-pointer group-hover:bg-neutral-50/50 -m-2 p-2 rounded-xl transition-colors space-y-2.5"
          title="Click to edit product"
        >
          <div className="flex justify-between items-baseline gap-2">
            <h4 className="text-base font-bold text-neutral-900 leading-tight">{product.title}</h4>
            <div className="text-right shrink-0">
              <span className="text-lg font-extrabold text-neutral-900">₹{product.price_inr}</span>
              <span className="text-[10px] text-neutral-400 block -mt-1 capitalize">
                {product.billing.replace('_', ' ')}
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">{product.description}</p>

          <ul className="space-y-1.5 pt-1">
            {product.outcomes.map((out, idx) => (
              <li key={idx} className="text-xs text-neutral-700 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{out}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <button
              type="button"
              className="w-full bg-neutral-900 text-white font-semibold py-2.5 rounded-xl text-xs shadow-sm hover:bg-neutral-800 transition-colors pointer-events-none"
            >
              {product.cta_label}
            </button>
          </div>
        </div>
      )}

      {/* Expandable Pricing Rationale in Editor */}
      {product.pricing_rationale && (
        <div className="border-t border-neutral-100 pt-2 text-[11px]">
          <button
            type="button"
            onClick={() => setShowRationale(!showRationale)}
            className="text-neutral-500 hover:text-neutral-800 font-medium flex items-center gap-1"
          >
            <span>Why ₹{product.price_inr}?</span>
            {showRationale ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showRationale && (
            <p className="mt-1 text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
              💡 {product.pricing_rationale}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
