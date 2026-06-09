import { prisma } from '@/lib/prisma';
import { resolveCandidateUserId } from '@/lib/candidate-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await resolveCandidateUserId();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { candidateId: userId },
      include: {
        job: { include: { company: { select: { name: true } } } },
      },
      orderBy: { appliedAt: 'desc' },
    });

    const header = 'Job Title,Company,Location,Type,Status,Applied Date\n';
    const rows = applications.map(app => {
      const title    = `"${app.job.title.replace(/"/g, '""')}"`;
      const company  = `"${app.job.company.name.replace(/"/g, '""')}"`;
      const location = `"${app.job.location.replace(/"/g, '""')}"`;
      const type     = app.job.type.replace('_', ' ');
      const status   = app.status;
      const date     = new Date(app.appliedAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
      return `${title},${company},${location},${type},${status},${date}`;
    }).join('\n');

    const csv = header + rows;

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="my-applications.csv"',
      },
    });
  } catch (error) {
    console.error('[GET /api/candidate/applications/export]', error);
    return new Response('Internal server error', { status: 500 });
  }
}
