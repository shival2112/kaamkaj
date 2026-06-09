import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resume = await prisma.resume.findUnique({
      where: { userId: user.id },
      select: { fileUrl: true },
    });

    if (!resume?.fileUrl) return NextResponse.json({ signedUrl: null });

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const path = `${user.id}/resume.pdf`;
    const { data, error } = await admin.storage.from('resumes').createSignedUrl(path, 300);
    if (error || !data?.signedUrl) {
      console.error('[signed-url] Supabase error:', error);
      return NextResponse.json({ signedUrl: null });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (err) {
    console.error('[GET /api/candidate/resume/signed-url]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
