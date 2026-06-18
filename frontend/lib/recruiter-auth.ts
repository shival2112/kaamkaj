import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export interface RecruiterContext {
  userId: string;
  companyId: string;
}

export async function resolveRecruiterContext(): Promise<RecruiterContext | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const role = (user.user_metadata?.role as string ?? '').toUpperCase();
    if (role !== 'RECRUITER') return null;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, recruiterCompanyId: true },
    });
    if (!dbUser?.recruiterCompanyId) return null;

    return { userId: dbUser.id, companyId: dbUser.recruiterCompanyId };
  } catch {
    return null;
  }
}
