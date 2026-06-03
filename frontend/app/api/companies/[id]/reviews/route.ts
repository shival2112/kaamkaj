import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET — list reviews + average rating for a company
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [reviews, agg] = await Promise.all([
      prisma.companyReview.findMany({
        where:   { companyId: params.id },
        orderBy: { createdAt: 'desc' },
        select:  {
          id: true, rating: true, title: true, body: true, createdAt: true,
          candidate: { select: { name: true } },
        },
      }),
      prisma.companyReview.aggregate({
        where: { companyId: params.id },
        _avg:  { rating: true },
        _count: { id: true },
      }),
    ]);

    return NextResponse.json({
      reviews,
      averageRating: agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : null,
      totalReviews:  agg._count.id,
    });
  } catch (error) {
    console.error('[GET /api/companies/[id]/reviews]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — submit a review (authenticated candidates only; one per company)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where:  { id: user.id },
      select: { role: true },
    });
    if (dbUser?.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Only candidates can leave reviews' }, { status: 403 });
    }

    const company = await prisma.company.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

    const body = await request.json() as { rating?: number; title?: string; body?: string };

    if (!body.rating || body.rating < 1 || body.rating > 5 || !Number.isInteger(body.rating)) {
      return NextResponse.json({ error: 'rating must be an integer 1–5' }, { status: 400 });
    }
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const review = await prisma.companyReview.upsert({
      where:  { companyId_candidateId: { companyId: params.id, candidateId: user.id } },
      update: { rating: body.rating, title: body.title.trim(), body: body.body?.trim() ?? null },
      create: { companyId: params.id, candidateId: user.id, rating: body.rating, title: body.title.trim(), body: body.body?.trim() ?? null },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('[POST /api/companies/[id]/reviews]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — remove own review
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.companyReview.deleteMany({
      where: { companyId: params.id, candidateId: user.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/companies/[id]/reviews]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
