import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { store_id, type, product_id } = await req.json();

    if (!store_id || !type) {
      return NextResponse.json({ error: 'Missing store_id or type' }, { status: 400 });
    }

    if (!['view', 'cta_click', 'share'].includes(type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    // Insert event
    await supabaseAdmin.from('events').insert({
      store_id,
      type,
      product_id: product_id || null,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get('store_id');
  if (!storeId) {
    return NextResponse.json({ error: 'Missing store_id' }, { status: 400 });
  }

  try {
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('type, count')
      .eq('store_id', storeId);

    if (error) {
      return NextResponse.json({ views: 0, clicks: 0, shares: 0 });
    }

    let views = 0;
    let clicks = 0;
    let shares = 0;

    events?.forEach((e: any) => {
      if (e.type === 'view') views++;
      if (e.type === 'cta_click') clicks++;
      if (e.type === 'share') shares++;
    });

    return NextResponse.json({ views, clicks, shares });
  } catch (err) {
    return NextResponse.json({ views: 0, clicks: 0, shares: 0 });
  }
}
