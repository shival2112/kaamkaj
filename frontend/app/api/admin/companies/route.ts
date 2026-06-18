import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;


export async function GET(request: Request) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const q    = searchParams.get('q')?.trim() || undefined;
    const page = Math.max(1, Number(searchParams.get('page') || 1));

    const where = q
      ? { OR: [
          { name:     { contains: q, mode: 'insensitive' as const } },
          { industry: { contains: q, mode: 'insensitive' as const } },
        ]}
      : {};

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          owner:  { select: { name: true, email: true } },
          _count: { select: { jobs: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({ companies, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
  } catch (error) {
    console.error('[GET /api/admin/companies]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST â€” create a new company
export async function POST(request: Request) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json() as {
      name?: string; industry?: string; size?: string;
      description?: string; website?: string; ownerId?: string;
    };
    const { name, industry, size, description, website, ownerId } = body;

    if (!name?.trim() || !ownerId?.trim()) {
      return NextResponse.json({ error: 'name and ownerId are required' }, { status: 400 });
    }

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { id: true, role: true, company: true },
    });
    if (!owner) return NextResponse.json({ error: 'Owner not found' }, { status: 404 });
    if (owner.role !== 'EMPLOYER') return NextResponse.json({ error: 'Owner must have EMPLOYER role' }, { status: 400 });
    if (owner.company) return NextResponse.json({ error: 'This employer already has a company' }, { status: 409 });

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        industry: industry?.trim() || null,
        size: size?.trim() || null,
        description: description?.trim() || null,
        website: website?.trim() || null,
        ownerId,
      },
      include: {
        owner:  { select: { name: true, email: true } },
        _count: { select: { jobs: true } },
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/companies]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH â€” toggle isVerified
export async function PATCH(request: Request) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json() as { id: string; isVerified: boolean };
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const updated = await prisma.company.update({
      where: { id: body.id },
      data:  { isVerified: body.isVerified },
      select: { id: true, isVerified: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/admin/companies]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE â€” remove a company (cascades jobs + applications)
export async function DELETE(request: Request) {
  try {
    const { admin } = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    await prisma.company.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/admin/companies]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

