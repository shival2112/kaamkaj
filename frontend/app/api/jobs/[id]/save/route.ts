import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ saved: false });

    const record = await prisma.savedJob.findUnique({
      where: { userId_jobId: { userId: user.id, jobId: params.id } },
    });
    return NextResponse.json({ saved: !!record });
  } catch {
    return NextResponse.json({ saved: false });
  }
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.savedJob.upsert({
      where: { userId_jobId: { userId: user.id, jobId: params.id } },
      update: {},
      create: { userId: user.id, jobId: params.id },
    });
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error('[POST /api/jobs/[id]/save]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.savedJob.deleteMany({
      where: { userId: user.id, jobId: params.id },
    });
    return NextResponse.json({ saved: false });
  } catch (error) {
    console.error('[DELETE /api/jobs/[id]/save]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
