# Auth Skill — KaamKaaj

## Strategy
Supabase Auth with JWT stored in httpOnly cookies via `@supabase/ssr`.

## Roles
```ts
type UserRole = 'candidate' | 'employer' | 'admin';
```

## Route Protection (middleware.ts)
```ts
// frontend/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/dashboard/candidate': ['candidate'],
  '/dashboard/employer':  ['employer'],
  '/dashboard/admin':     ['admin'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const requiredRoles = Object.entries(PROTECTED_ROUTES).find(([path]) =>
    pathname.startsWith(path)
  )?.[1];

  if (!requiredRoles) return NextResponse.next();

  // Validate session
  const supabase = createServerClient(...);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  // Check role
  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
  if (!dbUser || !requiredRoles.includes(dbUser.role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

## Signup Flow
1. User selects role (candidate / employer) on `/signup`
2. `supabase.auth.signUp()` creates auth record
3. After email confirmation → `onAuthStateChange` fires
4. Server action creates record in `users` table with selected role
5. Redirect to appropriate dashboard

## Login Flow
1. `supabase.auth.signInWithPassword()` on `/login`
2. Session stored in httpOnly cookie
3. Read role from `users` table
4. Redirect: candidate → `/dashboard/candidate`, employer → `/dashboard/employer`

## Logout
```ts
await supabase.auth.signOut();
// Clear cookies and redirect to homepage
```

## Auth Hook (hooks/useAuth.ts)
```ts
'use client';
import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, setUser, clearUser } = useAuthStore();
  const supabase = createSupabaseClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) setUser(session.user);
      else clearUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user };
}
```

## Auth Store (store/authStore.ts)
```ts
import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
```

## Protected Page Pattern
```tsx
// app/(dashboard)/candidate/page.tsx
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export default async function CandidateDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  // render dashboard...
}
```

## Form Patterns

### Login Form
```tsx
'use client';
async function handleLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) { /* show error */ }
  else router.push('/dashboard');
}
```
