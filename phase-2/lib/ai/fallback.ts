import { StoreOutput } from './schema';

export const STARTER_FALLBACK_TEMPLATES: Record<string, StoreOutput> = {
  fitness: {
    status: 'ok',
    niche: 'Fitness & Health',
    language: 'en',
    bio: {
      headline: 'Sustainable Fitness & Weight Loss Coaching',
      text: 'Helping people achieve their dream physique with practical home workouts and healthy, realistic diets.',
    },
    products: [
      {
        id: 'fb_fit_1',
        title: 'Complete Home Fat-Loss Blueprint',
        format: 'ebook',
        price_inr: 299,
        billing: 'one_time',
        description: 'A 30-day PDF roadmap with 20-minute daily bodyweight workouts and realistic meal swaps.',
        outcomes: ['No gym or equipment needed', 'Clear calorie & meal targets', 'Drop 3-4 kg safely in 4 weeks'],
        cta_label: 'Download Guide',
        pricing_rationale: 'Low-ticket Rs 299 price point encourages frictionless impulse purchases.',
      },
      {
        id: 'fb_fit_2',
        title: '1:1 Custom Routine & Nutrition Audit',
        format: 'one_on_one_call',
        price_inr: 799,
        billing: 'per_session',
        description: '30-minute video session to analyze your habits, daily schedule, and fix fat-loss plateaus.',
        outcomes: ['Personalized weekly schedule', 'Direct form check & guidance', '7-day follow-up messaging'],
        cta_label: 'Book Consultation',
        pricing_rationale: 'Affordable high-value 1:1 access for serious clients.',
      },
      {
        id: 'fb_fit_3',
        title: 'Weekend Form & Posture Workshop',
        format: 'workshop',
        price_inr: 499,
        billing: 'one_time',
        description: 'Interactive live Zoom session demonstrating safe posture, core activation, and mobility drills.',
        outcomes: ['Live exercise corrections', 'Fix desk-job lower back pain', 'Live Q&A with coach'],
        cta_label: 'Join Workshop',
        pricing_rationale: 'Rs 499 attracts mass community participation on weekends.',
      },
    ],
  },
  finance: {
    status: 'ok',
    niche: 'Personal Finance & Wealth',
    language: 'en',
    bio: {
      headline: 'Smart Money & Tax Optimization for Salaried Professionals',
      text: 'Practical financial frameworks to maximize savings, legally minimize taxes, and invest for long-term growth.',
    },
    products: [
      {
        id: 'fb_fin_1',
        title: 'All-in-One Personal Budget & Tax Tracker',
        format: 'template_pack',
        price_inr: 399,
        billing: 'one_time',
        description: 'Ready-to-use Notion and Google Sheets dashboard to calculate tax regimes and track investments.',
        outcomes: ['Old vs New tax regime simulator', 'Automated monthly budget ledger', 'Emergency fund calculator'],
        cta_label: 'Get Templates',
        pricing_rationale: 'Under Rs 400 for high-utility productivity spreadsheets.',
      },
      {
        id: 'fb_fin_2',
        title: 'Mutual Fund & Direct Investing Masterclass',
        format: 'recorded_course',
        price_inr: 1299,
        billing: 'one_time',
        description: 'Comprehensive 2-hour video series demystifying direct index funds, equity allocations, and SIPs.',
        outcomes: ['Build a 3-fund portfolio', 'Avoid commission-heavy schemes', 'Clear financial independence road'],
        cta_label: 'Start Course',
        pricing_rationale: 'Priced for maximum value-to-cost return on investment.',
      },
      {
        id: 'fb_fin_3',
        title: '1:1 Portfolio & Strategy Consultation',
        format: 'one_on_one_call',
        price_inr: 1499,
        billing: 'per_session',
        description: '45-minute confidential consultation to review your assets, insurance, and tax strategy.',
        outcomes: ['Asset allocation health check', 'Term insurance verification', 'Goal-based roadmap'],
        cta_label: 'Book Session',
        pricing_rationale: 'Premium one-on-one session with customized financial breakdown.',
      },
    ],
  },
  general: {
    status: 'ok',
    niche: 'Creator Coaching & Skills',
    language: 'en',
    bio: {
      headline: 'Master Real Skills & Grow Your Digital Presence',
      text: 'Actionable blueprints, personalized guidance, and practical resources to accelerate your growth.',
    },
    products: [
      {
        id: 'fb_gen_1',
        title: 'Actionable Starter Playbook',
        format: 'ebook',
        price_inr: 199,
        billing: 'one_time',
        description: 'The complete beginner-to-pro roadmap with step-by-step principles and mistakes to avoid.',
        outcomes: ['Clear foundational roadmap', 'Time-tested frameworks', 'Checklists and cheat sheets'],
        cta_label: 'Get Playbook',
        pricing_rationale: 'Ultra low-barrier Rs 199 entry point.',
      },
      {
        id: 'fb_gen_2',
        title: '1:1 Strategy & Roadmap Call',
        format: 'one_on_one_call',
        price_inr: 699,
        billing: 'per_session',
        description: '30-minute focused consultation to diagnose roadblocks and create a personalized plan.',
        outcomes: ['Personalized diagnosis', 'Clear next 30-day priorities', 'Actionable answers to questions'],
        cta_label: 'Book 1:1 Call',
        pricing_rationale: 'Accessible rate for individual direct coaching.',
      },
      {
        id: 'fb_gen_3',
        title: 'Exclusive Resource & Asset Vault',
        format: 'template_pack',
        price_inr: 499,
        billing: 'one_time',
        description: 'Curated collection of proven templates, prompts, and workflows to save 10+ hours a week.',
        outcomes: ['Ready-to-use templates', 'Plug-and-play workflows', 'Lifetime updates included'],
        cta_label: 'Unlock Vault',
        pricing_rationale: 'Rs 499 is proven for digital resource bundles.',
      },
    ],
  },
};

export function buildFallbackStore(detectedNiche?: string, language: string = 'en'): StoreOutput {
  const nicheKey = (detectedNiche || '').toLowerCase();
  let baseTemplate = STARTER_FALLBACK_TEMPLATES.general;

  if (nicheKey.includes('fit') || nicheKey.includes('health') || nicheKey.includes('diet') || nicheKey.includes('workout')) {
    baseTemplate = STARTER_FALLBACK_TEMPLATES.fitness;
  } else if (nicheKey.includes('fin') || nicheKey.includes('money') || nicheKey.includes('tax') || nicheKey.includes('invest')) {
    baseTemplate = STARTER_FALLBACK_TEMPLATES.finance;
  }

  return {
    ...baseTemplate,
    language: (language as any) || 'en',
  };
}
