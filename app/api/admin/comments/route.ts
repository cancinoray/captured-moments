import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const filter = searchParams.get('filter') || 'all';

  try {
    let query = supabaseAdmin.from('comments').select('*');

    if (filter === 'approved') {
      query = query.eq('is_approved', true).eq('is_deleted', false);
    } else if (filter === 'pending') {
      query = query.eq('is_approved', false).eq('is_deleted', false);
    } else if (filter === 'deleted') {
      query = query.eq('is_deleted', true);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

