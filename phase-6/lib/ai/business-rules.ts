import { ProductFormat, Product } from '../types';
import { StoreOutput } from './schema';

export const FRIENDLY_PRICES = [99, 149, 199, 299, 399, 499, 699, 799, 999, 1299, 1499, 1999, 2499, 2999, 4999];

export const FORMAT_PRICE_BOUNDS: Record<ProductFormat, { min: number; max: number }> = {
  ebook: { min: 99, max: 499 },
  template_pack: { min: 199, max: 799 },
  recorded_course: { min: 499, max: 1999 },
  cohort_course: { min: 1499, max: 4999 },
  one_on_one_call: { min: 299, max: 1499 },
  community: { min: 99, max: 499 },
  webinar: { min: 99, max: 499 },
  workshop: { min: 199, max: 999 },
};

export const ALL_FORMATS: ProductFormat[] = [
  'ebook',
  'template_pack',
  'recorded_course',
  'cohort_course',
  'one_on_one_call',
  'community',
  'webinar',
  'workshop',
];

export function roundToFriendlyPrice(price: number, min: number, max: number): number {
  const clamped = Math.max(min, Math.min(max, price));
  let closest = FRIENDLY_PRICES[0];
  let minDiff = Math.abs(clamped - closest);

  for (const fp of FRIENDLY_PRICES) {
    if (fp < min || fp > max) continue;
    const diff = Math.abs(clamped - fp);
    if (diff < minDiff) {
      minDiff = diff;
      closest = fp;
    }
  }
  return closest;
}

export function sanitizeText(text: string, maxLength: number): string {
  if (!text) return '';
  let cleaned = text
    .replace(/guaranteed\s+(results|income|returns)/gi, 'structured approach')
    .replace(/100%\s+results/gi, 'actionable guidance')
    .replace(/earn\s+\d+\s*(lakh|crore|k)/gi, 'monetize your skill')
    .replace(/[^\x00-\x7F\u0900-\u097F\s.,!?'"()-]/g, '') // Keep ASCII + Devanagari + common punct
    .trim();

  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength).trim();
  }
  return cleaned;
}

export function applyBusinessRules(storeOutput: StoreOutput): StoreOutput {
  if (storeOutput.status !== 'ok' || !storeOutput.products || storeOutput.products.length === 0) {
    return storeOutput;
  }

  // 1. Sanitize Bio
  if (storeOutput.bio) {
    storeOutput.bio.headline = sanitizeText(storeOutput.bio.headline, 60);
    storeOutput.bio.text = sanitizeText(storeOutput.bio.text, 280);
  }

  // 2. Ensure product count is between 2 and 4
  let products = storeOutput.products.slice(0, 4);
  if (products.length < 2 && products.length > 0) {
    // Clone first product with secondary format if only 1 generated
    const newFormat: ProductFormat = products[0].format === 'ebook' ? 'one_on_one_call' : 'ebook';
    products.push({
      id: 'prod_auto_2',
      title: `${products[0].title} Consultation`,
      format: newFormat,
      price_inr: 499,
      billing: newFormat === 'one_on_one_call' ? 'per_session' : 'one_time',
      description: 'Personalized walkthrough and guidance call.',
      outcomes: ['Personalized feedback', 'Step by step plan', 'Direct Q&A'],
      cta_label: 'Book Consultation',
      pricing_rationale: 'Frictionless pricing for personal guidance.',
    });
  }

  // 3. Format deduplication
  const usedFormats = new Set<ProductFormat>();
  products = products.map((prod, index) => {
    let format = prod.format;
    if (usedFormats.has(format)) {
      const unused = ALL_FORMATS.find((f) => !usedFormats.has(f));
      if (unused) {
        format = unused;
      }
    }
    usedFormats.add(format);

    // 4. Clamping and friendly price rounding
    const bounds = FORMAT_PRICE_BOUNDS[format] || { min: 99, max: 999 };
    const price_inr = roundToFriendlyPrice(prod.price_inr || bounds.min, bounds.min, bounds.max);

    // 5. Sanitize strings & enforce lengths
    const title = sanitizeText(prod.title, 60);
    const description = sanitizeText(prod.description, 300);
    const outcomes = (prod.outcomes || [])
      .slice(0, 3)
      .map((o) => sanitizeText(o, 80)) as [string, string, string];

    while (outcomes.length < 3) {
      outcomes.push('Actionable step-by-step guidance');
    }

    const cta_label = sanitizeText(prod.cta_label, 24) || 'Get Access';
    const pricing_rationale = sanitizeText(prod.pricing_rationale, 160) || 'Calibrated for price-sensitive audience.';

    return {
      id: prod.id || `prod_${index + 1}`,
      title,
      format,
      price_inr,
      billing: prod.billing || 'one_time',
      description,
      outcomes,
      cta_label,
      pricing_rationale,
    };
  });

  // 6. Anchor low-ticket product: Guarantee at least ONE product under ₹500
  const hasLowTicket = products.some((p) => p.price_inr < 500);
  if (!hasLowTicket && products.length > 0) {
    // Discount the lowest priced product to ₹299 or ₹399
    products.sort((a, b) => a.price_inr - b.price_inr);
    products[0].price_inr = 299;
    products[0].pricing_rationale = 'Adjusted to under Rs 500 as an accessible entry product.';
  }

  return {
    ...storeOutput,
    products,
  };
}
