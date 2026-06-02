/**
 * Dual-auth resolver for employer API routes.
 *
 * The employer portal supports two independent auth mechanisms:
 *   1. Supabase email/password (OAuth) — Prisma User.id = Supabase UID
 *   2. NextAuth phone OTP             — Prisma PhoneUser.id (cuid)
 *
 * Both result in a "userId" that can be used as Company.ownerId.
 * For NextAuth employers, a bridge Prisma User row is auto-created on first access
 * so they can own Company and Job records without a Supabase account.
 */

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function resolveEmployerUserId(): Promise<string | null> {
  // ── 1. Supabase session (email/password, Google OAuth) ────────────────────
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const role = (user.user_metadata?.role as string ?? '').toUpperCase();
      if (role !== 'EMPLOYER') {
        console.log('[employer-auth] Supabase user role is', role, '— not EMPLOYER');
        return null;
      }
      console.log('[employer-auth] Supabase employer resolved:', user.id);
      return user.id;
    }
  } catch (err) {
    console.warn('[employer-auth] Supabase check failed:', err);
  }

  // ── 2. NextAuth JWT (phone OTP employers) ─────────────────────────────────
  try {
    const session = await auth();
    if (!session?.user) return null;

    const role = (session.user.role as string ?? '').toUpperCase();
    if (role !== 'EMPLOYER') {
      console.log('[employer-auth] NextAuth user role is', role, '— not EMPLOYER');
      return null;
    }

    const phoneUserId = session.user.id as string;

    // Look up PhoneUser to get their details
    const phoneUser = await prisma.phoneUser.findUnique({
      where: { id: phoneUserId },
    });
    if (!phoneUser) {
      console.warn('[employer-auth] NextAuth session references unknown PhoneUser:', phoneUserId);
      return null;
    }

    // Auto-create a bridge Prisma User row on first API access.
    // This lets the phone employer own Company and Job records (which require User.id FK).
    // The email placeholder is internal and never used for login.
    const bridgeEmail = `${phoneUser.phone}@phone.kaamkaaj.internal`;
    await prisma.user.upsert({
      where: { id: phoneUserId },
      update: {},
      create: {
        id:    phoneUserId,
        email: bridgeEmail,
        name:  phoneUser.name || phoneUser.phone,
        role:  'EMPLOYER',
        phone: phoneUser.phone,
      },
    });

    console.log('[employer-auth] NextAuth employer bridge resolved:', phoneUserId);
    return phoneUserId;
  } catch (err) {
    console.warn('[employer-auth] NextAuth check failed:', err);
    return null;
  }
}
