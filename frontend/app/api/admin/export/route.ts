import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function escapeCSV(val: string | number | null | undefined): string {
  return `"${String(val ?? '').replace(/"/g, '""')}"`;
}

function toCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const lines = [headers.map(escapeCSV).join(',')];
  for (const row of rows) lines.push(row.map(escapeCSV).join(','));
  return lines.join('\n');
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (user.user_metadata?.role as string ?? '').toUpperCase();
    if (role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') ?? 'users';

    let csv = '';
    let filename = '';

    if (type === 'users') {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, isVerified: true, createdAt: true },
      });
      filename = `kaamkaaj-users-${new Date().toISOString().slice(0, 10)}.csv`;
      csv = toCSV(
        ['ID', 'Name', 'Email', 'Role', 'Verified', 'Joined'],
        users.map(u => [u.id, u.name, u.email, u.role, u.isVerified ? 'Yes' : 'No', u.createdAt.toISOString()]),
      );
    } else if (type === 'jobs') {
      const jobs = await prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
        include: { company: { select: { name: true } } },
      });
      filename = `kaamkaaj-jobs-${new Date().toISOString().slice(0, 10)}.csv`;
      csv = toCSV(
        ['ID', 'Title', 'Company', 'Location', 'Type', 'Status', 'Views', 'Created'],
        jobs.map(j => [j.id, j.title, j.company.name, j.location, j.type, j.status, j.viewCount, j.createdAt.toISOString()]),
      );
    } else if (type === 'applications') {
      const apps = await prisma.application.findMany({
        orderBy: { appliedAt: 'desc' },
        include: {
          job:       { select: { title: true } },
          candidate: { select: { name: true, email: true } },
        },
      });
      filename = `kaamkaaj-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      csv = toCSV(
        ['ID', 'Candidate', 'Email', 'Job', 'Status', 'Rating', 'Applied At'],
        apps.map(a => [a.id, a.candidate.name, a.candidate.email, a.job.title, a.status, a.rating ?? '', a.appliedAt.toISOString()]),
      );
    } else {
      return NextResponse.json({ error: 'Invalid type. Use users, jobs, or applications.' }, { status: 400 });
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/export]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
