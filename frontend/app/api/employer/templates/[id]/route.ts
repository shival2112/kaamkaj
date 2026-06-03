import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveEmployerUserId } from '@/lib/employer-auth';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

async function ownedTemplate(userId: string, id: string) {
  return prisma.jobTemplate.findFirst({ where: { id, employerId: userId } });
}

// GET — fetch a single template
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const template = await ownedTemplate(userId, params.id);
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    return NextResponse.json(template);
  } catch (error) {
    console.error('[GET /api/employer/templates/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH — rename or update template data
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await ownedTemplate(userId, params.id);
    if (!existing) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    const body = await request.json() as { name?: string; data?: Record<string, unknown> };

    const updated = await prisma.jobTemplate.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.data && { data: body.data as Prisma.InputJsonValue }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PATCH /api/employer/templates/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — remove a template
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await resolveEmployerUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await ownedTemplate(userId, params.id);
    if (!existing) return NextResponse.json({ error: 'Template not found' }, { status: 404 });

    await prisma.jobTemplate.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/employer/templates/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
