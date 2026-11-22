import { NextRequest, NextResponse } from 'next/server';
import { hashToken } from '@/lib/utils/token';
import { supabaseAdmin } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const token = req.headers.get('x-edit-token') || req.nextUrl.searchParams.get('t');

  const { data: store, error } = await supabaseAdmin
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  // If draft, verify token
  if (store.status === 'draft') {
    if (!token || hashToken(token) !== store.edit_token_hash) {
      return NextResponse.json({ error: 'Unauthorized access to draft store' }, { status: 401 });
    }
  }

  return NextResponse.json({ store });
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const token = req.headers.get('x-edit-token');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: missing token' }, { status: 401 });
  }

  try {
    const tokenHash = hashToken(token);
    const body = await req.json();

    const allowedFields = ['display_name', 'contact_url', 'bio', 'products', 'theme', 'language'];
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const { data: updated, error } = await supabaseAdmin
      .from('stores')
      .update(updateData)
      .eq('slug', slug)
      .eq('edit_token_hash', tokenHash)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, store: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
