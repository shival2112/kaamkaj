import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

async function getEmployer(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId, role: 'EMPLOYER' },
    include: { company: true },
  });
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const employer = await getEmployer(user.id);
    if (!employer) return NextResponse.json({ error: 'Employer not found' }, { status: 404 });

    return NextResponse.json({ company: employer.company ?? null });
  } catch (error) {
    console.error('[GET /api/employer/company]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      name?: string; industry?: string; size?: string;
      website?: string; description?: string;
    };

    const { name, industry, size, website, description } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
    }

    const existing = await prisma.company.findUnique({ where: { ownerId: user.id } });

    const data = {
      name:        name.trim(),
      industry:    industry?.trim() || null,
      size:        size?.trim()     || null,
      website:     website?.trim()  || null,
      description: description?.trim() || null,
    };

    const company = existing
      ? await prisma.company.update({ where: { ownerId: user.id }, data })
      : await prisma.company.create({ data: { ...data, ownerId: user.id } });

    return NextResponse.json({ company });
  } catch (error) {
    console.error('[PATCH /api/employer/company]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
