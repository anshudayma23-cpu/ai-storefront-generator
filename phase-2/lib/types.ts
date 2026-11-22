export type ProductFormat =
  | 'ebook'
  | 'template_pack'
  | 'recorded_course'
  | 'cohort_course'
  | 'one_on_one_call'
  | 'community'
  | 'webinar'
  | 'workshop';

export type BillingType = 'one_time' | 'monthly' | 'per_session';

export type Language = 'en' | 'hinglish' | 'hi';

export type Theme = 'clean' | 'warm' | 'bold';

export type StoreStatus = 'draft' | 'published';

export interface Product {
  id: string;
  title: string;
  format: ProductFormat;
  price_inr: number;
  billing: BillingType;
  description: string;
  outcomes: [string, string, string];
  cta_label: string;
  pricing_rationale: string;
}

export interface Bio {
  headline: string;
  text: string;
}

export interface Store {
  id: string;
  slug: string;
  edit_token_hash: string;
  display_name: string;
  handle?: string | null;
  contact_url?: string | null;
  language: Language;
  theme: Theme;
  niche?: string | null;
  bio: Bio;
  products: Product[];
  input_text?: string | null;
  profile_signals?: Record<string, any> | null;
  status: StoreStatus;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
}

export type GenerationKind = 'full' | 'bio' | 'product';

export interface StoreGeneration {
  id: string;
  store_id?: string | null;
  kind: GenerationKind;
  model: string;
  latency_ms?: number | null;
  raw_output?: any;
  valid: boolean;
  fallback_used: boolean;
  input_hash?: string | null;
  created_at: string;
}
