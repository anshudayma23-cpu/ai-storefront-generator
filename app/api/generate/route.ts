import { NextRequest, NextResponse } from 'next/server';
import { GenerateInputSchema } from '@/lib/ai/schema';
import { generateStore } from '@/lib/ai/generate';
import { normaliseHandle, readProfileSignals } from '@/lib/instagram/reader';
import { generateSlug } from '@/lib/utils/slug';
import { generateToken, hashToken } from '@/lib/utils/token';
import { supabaseAdmin } from '@/lib/db/client';
import { checkRateLimit } from '@/lib/db/rate-limiter';
import { mapErrorToFriendly } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 0. Per-IP Rate Limiting check
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const rateLimit = await checkRateLimit(clientIp);
    if (rateLimit.limited) {
      const minutes = Math.ceil((rateLimit.retryAfterSeconds || 3600) / 60);
      const friendly = mapErrorToFriendly(
        'RATE_LIMITED',
        `You have used your 10 generations for this hour. Please try again in about ${minutes} minutes.`
      );
      return NextResponse.json(friendly, { status: 429 });
    }

    const body = await req.json();

    // 1. Validate Input
    const parseResult = GenerateInputSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { description, handle, language } = parseResult.data;

    // 2. Best-effort Instagram metadata fetch (4s non-blocking)
    let profileSignals = null;
    let cleanHandle = null;

    if (handle) {
      cleanHandle = normaliseHandle(handle);
      if (cleanHandle) {
        profileSignals = await readProfileSignals(cleanHandle);
      }
    }

    // 3. Run AI Generation
    const genResult = await generateStore({
      description,
      handle: cleanHandle,
      language,
      profileSignals,
    });

    const storeOutput = genResult.storeOutput;

    // 4. Handle Clarifying Question
    if (storeOutput.status === 'needs_more_info') {
      return NextResponse.json({
        status: 'needs_more_info',
        clarifying_question: storeOutput.clarifying_question,
      });
    }

    // 5. Generate secure slug & edit token
    const slug = generateSlug();
    const editToken = generateToken();
    const editTokenHash = hashToken(editToken);

    const displayName = cleanHandle
      ? `@${cleanHandle}`
      : (storeOutput.niche ? `${storeOutput.niche} Store` : 'Creator Store');

    // 6. Insert into Supabase stores table
    const { data: storeRow, error: dbError } = await supabaseAdmin
      .from('stores')
      .insert({
        slug,
        edit_token_hash: editTokenHash,
        display_name: displayName,
        handle: cleanHandle,
        language,
        niche: storeOutput.niche,
        bio: storeOutput.bio || {},
        products: storeOutput.products || [],
        input_text: description,
        profile_signals: profileSignals,
        status: 'draft',
      })
      .select('*')
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Fallback: return state with token even if DB write had permission limits
      return NextResponse.json({
        slug,
        edit_token: editToken,
        store: {
          slug,
          display_name: displayName,
          handle: cleanHandle,
          language,
          niche: storeOutput.niche,
          bio: storeOutput.bio,
          products: storeOutput.products,
          status: 'draft',
        },
      });
    }

    return NextResponse.json({
      slug,
      edit_token: editToken,
      store: storeRow,
    });
  } catch (err: any) {
    console.error('API /generate error:', err);
    return NextResponse.json(
      {
        error: 'Failed to generate storefront',
        message: err.message,
      },
      { status: 500 }
    );
  }
}
