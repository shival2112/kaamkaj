import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limit: 1 resend per email per 5 minutes
const resendCooldowns = new Map<string, number>();

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const email = user.email;
    if (!email) return NextResponse.json({ error: 'No email on account' }, { status: 400 });

    const lastSent = resendCooldowns.get(email) ?? 0;
    const cooldown = 5 * 60 * 1000;
    if (Date.now() - lastSent < cooldown) {
      const wait = Math.ceil((lastSent + cooldown - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Please wait ${wait}s before requesting another verification email.` },
        { status: 429 }
      );
    }

    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) {
      console.error('[resend-verification] Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    resendCooldowns.set(email, Date.now());
    return NextResponse.json({ ok: true, message: 'Verification email sent' });
  } catch (error) {
    console.error('[POST /api/auth/resend-verification]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
