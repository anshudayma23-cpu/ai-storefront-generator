import { getGeminiModel, getTriageModel } from './client';
import { SYSTEM_PROMPT, FEW_SHOT_EXAMPLES } from './prompts';
import { StoreOutput, StoreOutputSchema, GenerateInput } from './schema';
import { applyBusinessRules } from './business-rules';
import { buildFallbackStore } from './fallback';
import { supabaseAdmin } from '../db/client';
import { hashToken } from '../utils/token';

export interface GenerationResult {
  storeOutput: StoreOutput;
  fallbackUsed: boolean;
  latencyMs: number;
}

export async function triageInput(
  description: string,
  language: string = 'en'
): Promise<{ status: 'ok' | 'too_vague' | 'gibberish' | 'unsafe' | 'non_creator'; clarifying_question?: string }> {
  // If rich input (>80 chars with diverse words), skip triage to minimize latency
  if (description.length > 80 && description.split(/\s+/).length > 10) {
    return { status: 'ok' };
  }

  // Obvious gibberish checks (repeated keys, no vowels, etc.)
  const trimmed = description.trim();
  if (/^(.)\1+$/.test(trimmed) || trimmed.length < 5) {
    return {
      status: 'gibberish',
      clarifying_question: 'Could you tell us what skill, topic, or expertise you want to share with your audience?',
    };
  }

  try {
    const model = getTriageModel();
    const prompt = `Classify this creator input: "${description}".
Return a JSON object with:
{
  "classification": "ok" | "too_vague" | "gibberish" | "unsafe" | "non_creator",
  "clarifying_question": "string (only if too_vague, e.g. What specific topic or audience do you focus on?)"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);

    return {
      status: parsed.classification || 'ok',
      clarifying_question: parsed.clarifying_question,
    };
  } catch (err) {
    console.warn('Triage call error, proceeding with generation:', err);
    return { status: 'ok' };
  }
}

export async function generateStore(
  input: GenerateInput & { profileSignals?: any },
  storeId?: string
): Promise<GenerationResult> {
  const startTime = Date.now();
  let fallbackUsed = false;
  let rawOutputText = '';
  let modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  // 1. Check Triage
  const triage = await triageInput(input.description, input.language);
  if (triage.status === 'too_vague' || triage.status === 'gibberish') {
    return {
      storeOutput: {
        status: 'needs_more_info',
        niche: 'Creator',
        language: input.language || 'en',
        clarifying_question:
          triage.clarifying_question ||
          'Could you tell us a bit more about what you teach, coach, or create for your audience?',
      },
      fallbackUsed: false,
      latencyMs: Date.now() - startTime,
    };
  }

  const userPrompt = `
Language preference: ${input.language}
${input.handle ? `Instagram Handle: @${input.handle}` : ''}
${input.profileSignals ? `Profile Signals: ${JSON.stringify(input.profileSignals)}` : ''}

<user_input>
${input.description}
</user_input>

Generate the complete JSON storefront according to the system rules and schema.
`;

  const fullPrompt = `${SYSTEM_PROMPT}\n\n${FEW_SHOT_EXAMPLES}\n\n${userPrompt}`;

  try {
    const model = getGeminiModel();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    let response;
    try {
      const result = await model.generateContent(fullPrompt);
      response = result.response;
    } finally {
      clearTimeout(timeoutId);
    }

    rawOutputText = response.text();
    const parsedJson = JSON.parse(rawOutputText);

    // Validate with Zod
    const validated = StoreOutputSchema.parse(parsedJson);

    // Apply deterministic business rules (clamping, friendly rounding, diversity)
    const finalStore = applyBusinessRules(validated);

    const latencyMs = Date.now() - startTime;

    // Log to Supabase generations table asynchronously
    logGeneration({
      storeId,
      kind: 'full',
      model: modelName,
      latencyMs,
      rawOutput: parsedJson,
      valid: true,
      fallbackUsed: false,
      inputHash: hashToken(input.description + input.language),
    }).catch((err) => console.error('Generation logging error:', err));

    return {
      storeOutput: finalStore,
      fallbackUsed: false,
      latencyMs,
    };
  } catch (err: any) {
    console.error('LLM generation or validation failed, attempting retry or fallback:', err.message);

    // Fallback template
    fallbackUsed = true;
    const fallbackStore = buildFallbackStore(input.description, input.language);
    const finalFallback = applyBusinessRules(fallbackStore);
    const latencyMs = Date.now() - startTime;

    logGeneration({
      storeId,
      kind: 'full',
      model: modelName,
      latencyMs,
      rawOutput: { error: err.message, rawText: rawOutputText },
      valid: false,
      fallbackUsed: true,
      inputHash: hashToken(input.description + input.language),
    }).catch((err) => console.error('Fallback generation logging error:', err));

    return {
      storeOutput: finalFallback,
      fallbackUsed: true,
      latencyMs,
    };
  }
}

export async function regenerateBio(currentStore: StoreOutput, instruction?: string): Promise<StoreOutput['bio']> {
  const model = getGeminiModel();
  const prompt = `You are an expert copywriter for Indian creators.
Current Bio: ${JSON.stringify(currentStore.bio)}
Niche: ${currentStore.niche}
Language: ${currentStore.language}
${instruction ? `User instruction: ${instruction}` : ''}

Generate an alternative, high-converting bio in the specified language and tone.
Return ONLY valid JSON:
{
  "headline": "string (max 60 chars)",
  "text": "string (max 280 chars)"
}`;

  const result = await model.generateContent(prompt);
  const parsed = JSON.parse(result.response.text());
  return {
    headline: parsed.headline.substring(0, 60),
    text: parsed.text.substring(0, 280),
  };
}

export async function regenerateProduct(
  currentStore: StoreOutput,
  targetProductId: string,
  instruction?: string
): Promise<any> {
  const model = getGeminiModel();
  const currentProduct = (currentStore.products || []).find((p) => p.id === targetProductId);

  const prompt = `You are a product strategist for Indian creators.
Current Product: ${JSON.stringify(currentProduct)}
Creator Niche: ${currentStore.niche}
Language: ${currentStore.language}
${instruction ? `Instruction: ${instruction}` : ''}

Generate an updated product concept matching the pricing guide and INR standards.
Return ONLY valid JSON matching:
{
  "id": "${targetProductId}",
  "title": "string (max 60 chars)",
  "format": "ebook" | "template_pack" | "recorded_course" | "cohort_course" | "one_on_one_call" | "community" | "webinar" | "workshop",
  "price_inr": number,
  "billing": "one_time" | "monthly" | "per_session",
  "description": "string (max 300 chars)",
  "outcomes": ["outcome 1", "outcome 2", "outcome 3"],
  "cta_label": "string (max 24 chars)",
  "pricing_rationale": "string (max 160 chars)"
}`;

  const result = await model.generateContent(prompt);
  const parsed = JSON.parse(result.response.text());
  return parsed;
}

async function logGeneration(params: {
  storeId?: string;
  kind: 'full' | 'bio' | 'product';
  model: string;
  latencyMs: number;
  rawOutput: any;
  valid: boolean;
  fallbackUsed: boolean;
  inputHash: string;
}) {
  try {
    await supabaseAdmin.from('generations').insert({
      store_id: params.storeId || null,
      kind: params.kind,
      model: params.model,
      latency_ms: params.latencyMs,
      raw_output: params.rawOutput,
      valid: params.valid,
      fallback_used: params.fallbackUsed,
      input_hash: params.inputHash,
    });
  } catch (e) {
    // Non-blocking log failure
  }
}
