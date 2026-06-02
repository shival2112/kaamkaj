'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Briefcase, User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createSupabaseClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type Role = 'CANDIDATE' | 'EMPLOYER';

const GoogleIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const ROLE_OPTIONS: {
  value: Role;
  icon: typeof User2;
  title: string;
  desc: string;
}[] = [
  {
    value: 'CANDIDATE',
    icon: User2,
    title: 'Job Seeker',
    desc: 'Find great opportunities',
  },
  {
    value: 'EMPLOYER',
    icon: Briefcase,
    title: 'Employer',
    desc: 'Find great talent',
  },
];

export function SignupForm() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('CANDIDATE');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Create the account server-side via Admin API — no confirmation email sent,
      // no rate limits, duplicate emails return a clear 409 error.
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      const regData = await regRes.json() as { ok?: boolean; error?: string };

      if (!regRes.ok) {
        setError(regData.error ?? 'Registration failed. Please try again.');
        return;
      }

      // Account created and confirmed — sign in immediately
      const supabase = createSupabaseClient();
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !signInData.session) {
        setError('Account created! Please sign in.');
        router.push('/login');
        return;
      }

      router.push(role === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard/onboarding');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const supabase = createSupabaseClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Role selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">I am a...</p>
        <div className="grid grid-cols-2 gap-3">
          {ROLE_OPTIONS.map(({ value, icon: Icon, title, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={cn(
                'flex flex-col items-start gap-1.5 rounded-xl border-2 p-4 text-left transition-all duration-150',
                role === value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border bg-white hover:border-primary/40 hover:bg-secondary'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                  role === value
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p
                className={cn(
                  'text-sm font-semibold',
                  role === value ? 'text-primary' : 'text-foreground'
                )}
              >
                {title}
              </p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={googleLoading}
        className={cn(
          'flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white px-4 py-2.5',
          'text-sm font-medium text-foreground shadow-sm transition-all',
          'hover:bg-secondary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60'
        )}
      >
        {googleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative flex items-center">
        <div className="flex-1 border-t border-border" />
        <span className="mx-4 text-xs text-muted-foreground">
          or continue with email
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Form */}
      <form onSubmit={handleSignup} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-foreground"
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rahul Sharma"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="block text-sm font-medium text-foreground"
          >
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="block text-sm font-medium text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-border px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
