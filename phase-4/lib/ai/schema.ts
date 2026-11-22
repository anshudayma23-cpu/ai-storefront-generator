import { z } from 'zod';

export const ProductFormatEnum = z.enum([
  'ebook',
  'template_pack',
  'recorded_course',
  'cohort_course',
  'one_on_one_call',
  'community',
  'webinar',
  'workshop',
]);

export const BillingTypeEnum = z.enum(['one_time', 'monthly', 'per_session']);

export const LanguageEnum = z.enum(['en', 'hinglish', 'hi']);

export const GenerateInputSchema = z.object({
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(600, 'Description cannot exceed 600 characters'),
  handle: z
    .string()
    .trim()
    .max(30, 'Handle cannot exceed 30 characters')
    .optional()
    .nullable(),
  language: LanguageEnum.default('en'),
});

export type GenerateInput = z.infer<typeof GenerateInputSchema>;

export const ProductOutputSchema = z.object({
  id: z.string(),
  title: z.string().max(60, 'Title max 60 chars'),
  format: ProductFormatEnum,
  price_inr: z.number().int().positive('Price must be positive in INR'),
  billing: BillingTypeEnum,
  description: z.string().max(300, 'Description max 300 chars'),
  outcomes: z.array(z.string().max(80)).length(3, 'Must have exactly 3 outcomes'),
  cta_label: z.string().max(24, 'CTA label max 24 chars'),
  pricing_rationale: z.string().max(160, 'Pricing rationale max 160 chars'),
});

export const BioOutputSchema = z.object({
  headline: z.string().max(60, 'Headline max 60 chars'),
  text: z.string().max(280, 'Bio text max 280 chars'),
});

export const StoreOutputSchema = z.object({
  status: z.enum(['ok', 'needs_more_info']),
  clarifying_question: z.string().optional(),
  niche: z.string().max(40).optional().default('Creator'),
  language: LanguageEnum.optional().default('en'),
  bio: BioOutputSchema.optional(),
  products: z
    .array(ProductOutputSchema)
    .min(2, 'Must have at least 2 products')
    .max(4, 'Cannot have more than 4 products')
    .optional(),
});

export type StoreOutput = z.infer<typeof StoreOutputSchema>;
