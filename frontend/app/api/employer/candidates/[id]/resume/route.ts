import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const employerUserId = await resolveEmployerUserId();
    if (!employerUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify this candidate applied to one of the employer's jobs
    const company = await prisma.company.findUnique({ where: { ownerId: employerUserId }, select: { id: true } });
    if (!company) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const app = await prisma.application.findFirst({
      where: { candidateId: params.id, job: { companyId: company.id } },
    });
    if (!app) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const resume = await prisma.resume.findUnique({
      where: { userId: params.id },
      select: { fileUrl: true },
    });
    if (!resume?.fileUrl) return NextResponse.json({ error: 'No resume uploaded' }, { status: 404 });

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const path = `${params.id}/resume.pdf`;
    const { data, error } = await admin.storage
      .from('resumes')
      .createSignedUrl(path, 120, { download: 'resume.pdf' });

    if (error || !data?.signedUrl) {
      return NextResponse.json({ error: 'Could not generate download link' }, { status: 500 });
    }

    return NextResponse.json({ downloadUrl: data.signedUrl });
  } catch (err) {
    console.error('[GET /api/employer/candidates/[id]/resume]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
