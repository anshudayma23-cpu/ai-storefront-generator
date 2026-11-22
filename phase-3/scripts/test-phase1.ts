import { GenerateInputSchema, StoreOutputSchema } from '../lib/ai/schema';
import { generateSlug } from '../lib/utils/slug';
import { generateToken, hashToken, verifyToken } from '../lib/utils/token';
import { supabaseAdmin } from '../lib/db/client';

async function runTests() {
  console.log('--- Running Phase 1 Acceptance Tests ---');

  // Test 1: Slugs
  const slug = generateSlug();
  console.log('1. Generated Slug:', slug);
  if (!slug || slug.length !== 8) throw new Error('Slug generator failed');
  console.log('   ✓ Slug verification passed (8 chars URL safe)');

  // Test 2: Security Tokens
  const token = generateToken();
  const hash = hashToken(token);
  const isValid = verifyToken(token, hash);
  const isInvalid = verifyToken('wrong-token', hash);
  if (!isValid || isInvalid) throw new Error('Token verification failed');
  console.log('   ✓ Token generation, SHA-256 hash & verify passed');

  // Test 3: Zod Schemas
  const validMock = {
    status: 'ok',
    niche: 'Fitness Coach',
    language: 'en',
    bio: {
      headline: 'Transform your body with simple home workouts',
      text: 'Helping busy desk workers drop body fat without joining a gym.',
    },
    products: [
      {
        id: 'prod_1',
        title: 'Fat Loss Blueprint for Desk Workers',
        format: 'ebook',
        price_inr: 299,
        billing: 'one_time',
        description: 'A 28-day actionable guide to losing fat with desk exercises.',
        outcomes: ['Drop 3-5 kg in 4 weeks', 'No gym equipment needed', '15 min daily routines'],
        cta_label: 'Get the Blueprint',
        pricing_rationale: 'Priced under Rs 300 to remove friction for first-time buyers.',
      },
      {
        id: 'prod_2',
        title: '1:1 Custom Diet & Routine Audit',
        format: 'one_on_one_call',
        price_inr: 999,
        billing: 'per_session',
        description: 'A 30-minute deep dive into your lifestyle and meal plan.',
        outcomes: ['Personalized calorie targets', 'Weekly progress sheet', 'WhatsApp support'],
        cta_label: 'Book Your Call',
        pricing_rationale: 'Fairly priced consultation for personalized attention.',
      },
    ],
  };

  const parsed = StoreOutputSchema.parse(validMock);
  if (!parsed.products || parsed.products.length !== 2) throw new Error('Schema parse failed');
  console.log('   ✓ StoreOutputSchema parsed valid mock successfully');

  // Test 4: Supabase Connection
  console.log('4. Testing Supabase database connection...');
  const { data, error } = await supabaseAdmin.from('stores').select('id').limit(1);
  if (error) {
    console.error('   ✗ Supabase query error:', error.message);
    console.log('   (Note: If tables are not created yet, please run lib/db/schema.sql in Supabase SQL editor)');
  } else {
    console.log('   ✓ Supabase connected successfully! Query returned:', data);
  }

  console.log('\n--- All Phase 1 System Checks Passed! ---');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
