import { NextRequest, NextResponse } from 'next/server';
import { hashToken } from '@/lib/utils/token';
import { supabaseAdmin } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const token = req.headers.get('x-edit-token');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: missing edit token' }, { status: 401 });
  }

  try {
    const tokenHash = hashToken(token);

    // Verify token & status
    const { data: store, error: findError } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .eq('edit_token_hash', tokenHash)
      .single();

    if (findError || !store) {
      return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
    }

    if (!store.products || store.products.length === 0) {
      return NextResponse.json({ error: 'Store must have at least one product before publishing' }, { status: 400 });
    }

    // Transition to published
    const now = new Date().toISOString();
    const { data: publishedStore, error: updateError } = await supabaseAdmin
      .from('stores')
      .update({
        status: 'published',
        published_at: now,
        updated_at: now,
      })
      .eq('slug', slug)
      .select('*')
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.json({
      ok: true,
      public_url: `${appUrl}/s/${slug}`,
      store: publishedStore,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
