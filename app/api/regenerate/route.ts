import { NextRequest, NextResponse } from 'next/server';
import { regenerateBio, regenerateProduct } from '@/lib/ai/generate';
import { applyBusinessRules } from '@/lib/ai/business-rules';
import { hashToken } from '@/lib/utils/token';
import { supabaseAdmin } from '@/lib/db/client';
import { checkRateLimit } from '@/lib/db/rate-limiter';
import { mapErrorToFriendly } from '@/lib/utils/errors';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const rateLimit = await checkRateLimit(clientIp);
    if (rateLimit.limited) {
      const minutes = Math.ceil((rateLimit.retryAfterSeconds || 3600) / 60);
      return NextResponse.json(
        mapErrorToFriendly('RATE_LIMITED', `Hourly limit reached. Retry in ${minutes} minutes.`),
        { status: 429 }
      );
    }

    const { slug, token, target, instruction, currentStore } = await req.json();

    if (!slug || !token || !target || !currentStore) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify token hash
    const tokenHash = hashToken(token);
    const { data: store } = await supabaseAdmin
      .from('stores')
      .select('edit_token_hash')
      .eq('slug', slug)
      .single();

    if (store && store.edit_token_hash !== tokenHash) {
      return NextResponse.json({ error: 'Unauthorized edit token' }, { status: 401 });
    }

    if (target === 'bio') {
      const newBio = await regenerateBio(currentStore, instruction);
      return NextResponse.json({ target: 'bio', data: newBio });
    }

    if (target.startsWith('product:')) {
      const productId = target.replace('product:', '');
      const newProduct = await regenerateProduct(currentStore, productId, instruction);

      // Re-apply business rules to single product
      const tempStore = {
        ...currentStore,
        products: (currentStore.products || []).map((p: any) =>
          p.id === productId ? newProduct : p
        ),
      };
      const clamped = applyBusinessRules(tempStore);
      const updatedProduct = clamped.products?.find((p: any) => p.id === productId) || newProduct;

      return NextResponse.json({ target, data: updatedProduct });
    }

    return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
  } catch (err: any) {
    console.error('API /regenerate error:', err);
    return NextResponse.json({ error: 'Regeneration failed', message: err.message }, { status: 500 });
  }
}
