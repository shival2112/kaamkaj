import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function getDashboardPath(role: string): string {
  const r = role.toUpperCase();
  if (r === 'EMPLOYER') return '/employer/dashboard';
  if (r === 'ADMIN') return '/dashboard/admin';
  return '/dashboard';
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required by @supabase/ssr
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Redirect already-logged-in users away from auth pages
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/auth/login' ||
    pathname === '/auth/register';

  if (user && isAuthPage) {
    const role = (user.user_metadata?.role as string) ?? 'CANDIDATE';
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  // Protect /employer/* — employer role only
  if (pathname.startsWith('/employer')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const role = (user.user_metadata?.role as string) ?? 'CANDIDATE';
    if (role.toUpperCase() !== 'EMPLOYER') {
      return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
    }
  }

  // Protect /dashboard/* — candidates and admins
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const role = (user.user_metadata?.role as string) ?? 'CANDIDATE';
    const expected = pathname.startsWith('/dashboard/admin') ? 'ADMIN' : 'CANDIDATE';
    if (role.toUpperCase() !== expected) {
      return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/login',
    '/signup',
    '/auth/login',
    '/auth/register',
    '/dashboard/:path*',
    '/employer/:path*',
  ],
};
