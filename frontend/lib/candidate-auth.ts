/**
 * Dual-auth resolver for candidate API routes.
 *
 * Mirrors lib/employer-auth.ts for the candidate side.
 * Supports both Supabase (email/password) and NextAuth phone OTP candidates.
 * For NextAuth candidates, auto-creates a bridge Prisma User row so they can
 * own Application records (which require User.id FK on candidateId).
 */

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function resolveCandidateUserId(): Promise<string | null> {
  // ── 1. Supabase session (email/password, Google OAuth) ────────────────────
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const role = (user.user_metadata?.role as string ?? 'CANDIDATE').toUpperCase();
      if (role !== 'CANDIDATE') {
        console.log('[candidate-auth] Supabase user role is', role, '— not CANDIDATE');
        return null;
      }
      console.log('[candidate-auth] Supabase candidate resolved:', user.id);
      return user.id;
    }
  } catch (err) {
    console.warn('[candidate-auth] Supabase check failed:', err);
  }

  // ── 2. NextAuth JWT (phone OTP candidates) ────────────────────────────────
  try {
    const session = await auth();
    if (!session?.user) return null;

    const role = (session.user.role as string ?? '').toUpperCase();
    if (role !== 'CANDIDATE') {
      console.log('[candidate-auth] NextAuth user role is', role, '— not CANDIDATE');
      return null;
    }

    const phoneUserId = session.user.id as string;

    const phoneUser = await prisma.phoneUser.findUnique({
      where: { id: phoneUserId },
    });
    if (!phoneUser) {
      console.warn('[candidate-auth] NextAuth session references unknown PhoneUser:', phoneUserId);
      return null;
    }

    // Auto-create bridge Prisma User so Application.candidateId FK is satisfied.
    // Identical pattern to employer-auth.ts.
    const bridgeEmail = `${phoneUser.phone}@phone.kaamkaaj.internal`;
    await prisma.user.upsert({
      where: { id: phoneUserId },
      update: {},
      create: {
        id:    phoneUserId,
        email: bridgeEmail,
        name:  phoneUser.name || phoneUser.phone,
        role:  'CANDIDATE',
        phone: phoneUser.phone,
      },
    });

    console.log('[candidate-auth] NextAuth candidate bridge resolved:', phoneUserId);
    return phoneUserId;
  } catch (err) {
    console.warn('[candidate-auth] NextAuth check failed:', err);
    return null;
  }
}
