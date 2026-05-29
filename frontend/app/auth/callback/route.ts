import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { user } = data;
      const name =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email?.split('@')[0] ??
        'User';
      const role = (user.user_metadata?.role as string) ?? 'CANDIDATE';

      // Sync auth user to our DB (non-fatal if it fails)
      try {
        await fetch(`${origin}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user.id, email: user.email, name, role }),
        });
      } catch {
        // Continue — user can still log in even if DB sync fails
      }

      const dashPath =
        role.toUpperCase() === 'EMPLOYER'
          ? '/employer/dashboard'
          : role.toUpperCase() === 'ADMIN'
          ? '/dashboard/admin'
          : '/dashboard';

      return NextResponse.redirect(`${origin}${dashPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
