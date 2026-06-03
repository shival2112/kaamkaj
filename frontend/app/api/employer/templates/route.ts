import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// GET — list all templates for the authenticated employer
export async function GET() {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const templates = await prisma.jobTemplate.findMany({
      where:   { employerId: userId },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('[GET /api/employer/templates]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — create a new template from a job-form payload
// Body: { name: string, data: { title, type, location, experienceLevel, salaryMin?, salaryMax?, vacancies?, skills?, description } }
export async function POST(request: Request) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { name?: string; data?: Record<string, unknown> };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    if (!body.data || typeof body.data !== 'object') {
      return NextResponse.json({ error: 'data (job form payload) is required' }, { status: 400 });
    }

    const MAX_TEMPLATES = 20;
    const count = await prisma.jobTemplate.count({ where: { employerId: userId } });
    if (count >= MAX_TEMPLATES) {
      return NextResponse.json({ error: `Maximum ${MAX_TEMPLATES} templates allowed.` }, { status: 400 });
    }

    const template = await prisma.jobTemplate.create({
      data: { employerId: userId, name: body.name.trim(), data: body.data as Prisma.InputJsonValue },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('[POST /api/employer/templates]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
