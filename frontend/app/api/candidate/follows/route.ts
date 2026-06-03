import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

type ParsedData = {
  followedCompanies?: string[];
  [key: string]: unknown;
};

async function getCandidate() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function getFollowed(userId: string): Promise<string[]> {
  const resume = await prisma.resume.findUnique({
    where: { userId },
    select: { parsedData: true },
  });
  return ((resume?.parsedData as ParsedData)?.followedCompanies) ?? [];
}

async function setFollowed(userId: string, ids: string[]) {
  const resume = await prisma.resume.findUnique({ where: { userId } });
  const existing = (resume?.parsedData as ParsedData) ?? {};
  const data = { ...existing, followedCompanies: ids };
  if (resume) {
    await prisma.resume.update({ where: { userId }, data: { parsedData: data } });
  } else {
    await prisma.resume.create({ data: { userId, fileUrl: '', parsedData: data } });
  }
}

// GET — list followed company IDs + basic info
export async function GET() {
  const user = await getCandidate();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ids = await getFollowed(user.id);
  if (ids.length === 0) return NextResponse.json({ follows: [] });

  const companies = await prisma.company.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, industry: true, isVerified: true },
  });
  return NextResponse.json({ follows: companies });
}

// POST — follow a company { companyId }
export async function POST(request: Request) {
  const user = await getCandidate();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { companyId } = await request.json() as { companyId?: string };
  if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });

  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

  const current = await getFollowed(user.id);
  if (!current.includes(companyId)) {
    await setFollowed(user.id, [...current, companyId]);
  }
  return NextResponse.json({ ok: true, following: true });
}

// DELETE — unfollow a company ?companyId=
export async function DELETE(request: Request) {
  const user = await getCandidate();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');
  if (!companyId) return NextResponse.json({ error: 'companyId required' }, { status: 400 });

  const current = await getFollowed(user.id);
  await setFollowed(user.id, current.filter(id => id !== companyId));
  return NextResponse.json({ ok: true, following: false });
}
