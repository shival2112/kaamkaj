import { auth } from './auth';
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function getDashboardPath(role: string): string {
  const r = role.toUpperCase();
  if (r === 'EMPLOYER') return '/employer/dashboard';
  if (r === 'ADMIN')    return '/dashboard/admin';
  return '/dashboard';
}

// Wrap with NextAuth `auth` so req.auth gives the JWT session without extra cookie reads
export default auth(async function middleware(req: NextRequest & { auth?: { user?: { role?: string } } | null }) {
  const { pathname } = req.nextUrl;
  const nextRole = req.auth?.user?.role?.toUpperCase();

  // ── Redirect already-logged-in NextAuth users away from /login and /signup ──
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if (isAuthPage && nextRole) {
    const dest = nextRole === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard';
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // ── /employer/* ───────────────────────────────────────────────────────────
  if (pathname.startsWith('/employer')) {
    // 1. NextAuth JWT employer
    if (nextRole === 'EMPLOYER') return NextResponse.next();

    // 2. Supabase employer session (for Supabase-registered employers)
    let response = NextResponse.next({ request: req });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (list) => {
            list.forEach(({ name, value }) => req.cookies.set(name, value));
            response = NextResponse.next({ request: req });
            list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const role = (user.user_metadata?.role as string ?? '').toUpperCase();
      if (role === 'EMPLOYER') return response;
      return NextResponse.redirect(new URL(getDashboardPath(role), req.url));
    }

    return NextResponse.redirect(new URL('/', req.url));
  }

  // ── /dashboard/* ──────────────────────────────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    // 1. NextAuth JWT candidate
    if (nextRole === 'CANDIDATE') {
      if (pathname.startsWith('/dashboard/admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // 2. Supabase session (candidate + admin)
    let response = NextResponse.next({ request: req });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (list) => {
            list.forEach(({ name, value }) => req.cookies.set(name, value));
            response = NextResponse.next({ request: req });
            list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const role = (user.user_metadata?.role as string ?? 'CANDIDATE').toUpperCase();
      const expected = pathname.startsWith('/dashboard/admin') ? 'ADMIN' : 'CANDIDATE';
      if (role === expected) return response;
      return NextResponse.redirect(new URL(getDashboardPath(role), req.url));
    }

    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/login', '/signup', '/employer/:path*', '/dashboard/:path*'],
};
