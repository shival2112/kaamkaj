import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function verifyAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { admin: null, unauth: true };

  // Trust Supabase user_metadata.role — this is what the middleware checks for
  // route protection, so the API must be consistent with it.
  const metaRole = (user.user_metadata?.role as string ?? '').toUpperCase();
  if (metaRole === 'ADMIN') return { admin: user, unauth: false };

  // Fall back to the Prisma DB role for accounts where metadata was not set.
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  return { admin: dbUser?.role === 'ADMIN' ? user : null, unauth: false };
}
