'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2, Eye, EyeOff, Briefcase, User2 } from 'lucide-react';
import { useModalStore } from '@/store/modalStore';
import { createSupabaseClient } from '@/lib/supabase';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputCls(hasError = false) {
  return `w-full rounded-xl border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-gray-200 focus:border-current focus:ring-current/10'
  }`;
}

const GoogleIcon = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// ─── Sign-In Form ─────────────────────────────────────────────────────────────

function SignInForm({ role, accent }: { role: 'CANDIDATE' | 'EMPLOYER'; accent: string }) {
  const router = useRouter();
  const { close } = useModalStore();
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [googleLoad,  setGoogleLoad]  = useState(false);
  const [error,       setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Ensure email is confirmed before attempting sign-in
      await fetch('/api/auth/ensure-confirmed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const supabase = createSupabaseClient();
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });

      if (authErr) {
        const msg = authErr.message.toLowerCase();
        if (msg.includes('invalid login credentials')) setError('Incorrect email or password.');
        else if (msg.includes('email not confirmed')) setError('Email not confirmed. Check your inbox.');
        else setError(authErr.message);
        return;
      }

      const userRole = (data.user?.user_metadata?.role as string ?? 'CANDIDATE').toUpperCase();
      const dest = userRole === 'ADMIN' ? '/dashboard/admin'
        : userRole === 'EMPLOYER' ? '/employer/dashboard'
        : '/dashboard';

      close();
      router.push(dest);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoad(true);
    try {
      const supabase = createSupabaseClient();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } finally {
      setGoogleLoad(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Google */}
      <button type="button" onClick={handleGoogle} disabled={googleLoad}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60">
        {googleLoad ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </button>

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-gray-100" />
        <span className="mx-3 text-xs text-gray-400">or continue with email</span>
        <div className="flex-1 border-t border-gray-100" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Email address</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email" className={inputCls()} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-600">Password</label>
          </div>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} required value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              autoComplete="current-password" className={`${inputCls()} pr-10`} />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className={`flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl font-bold text-white transition disabled:opacity-60 ${accent}`}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign In
        </button>
      </form>
    </div>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ role, accent }: { role: 'CANDIDATE' | 'EMPLOYER'; accent: string }) {
  const router = useRouter();
  const { close } = useModalStore();
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [error,      setError]      = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) { setError(data.error ?? 'Registration failed. Please try again.'); return; }

      // Auto sign-in after registration
      const supabase = createSupabaseClient();
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) { setError('Account created! Please sign in.'); return; }

      const dest = role === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard/onboarding';
      close();
      router.push(dest);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoad(true);
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
      setGoogleLoad(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Google */}
      <button type="button" onClick={handleGoogle} disabled={googleLoad}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60">
        {googleLoad ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        Continue with Google
      </button>

      <div className="relative flex items-center">
        <div className="flex-1 border-t border-gray-100" />
        <span className="mx-3 text-xs text-gray-400">or continue with email</span>
        <div className="flex-1 border-t border-gray-100" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Full name</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder="Rahul Sharma" autoComplete="name" className={inputCls()} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Email address</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" autoComplete="email" className={inputCls()} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-600">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} required value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
              minLength={6} autoComplete="new-password" className={`${inputCls()} pr-10`} />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className={`flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl font-bold text-white transition disabled:opacity-60 ${accent}`}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Account
        </button>

        <p className="text-center text-xs text-gray-400">
          By signing up you agree to our Terms &amp; Privacy Policy
        </p>
      </form>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function AuthModal() {
  const { isOpen, role, tab, setTab, close } = useModalStore();

  if (!isOpen || !role) return null;

  const isEmployer   = role === 'EMPLOYER';
  const accent       = isEmployer ? 'bg-[#6B46C1] hover:bg-purple-700' : 'bg-[#007a5a] hover:bg-[#006a4e]';
  const accentText   = isEmployer ? 'text-[#6B46C1]' : 'text-[#007a5a]';
  const accentBorder = isEmployer ? 'border-[#6B46C1]' : 'border-[#007a5a]';
  const Icon         = isEmployer ? Briefcase : User2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isEmployer ? 'bg-purple-100' : 'bg-teal-50'}`}>
              <Icon className={`h-4 w-4 ${accentText}`} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {isEmployer ? 'Employer Portal' : 'Candidate Portal'}
              </h2>
              <p className="text-xs text-gray-500">
                {isEmployer ? 'Post jobs and manage hiring' : 'Find great opportunities'}
              </p>
            </div>
          </div>
          <button onClick={close} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['register', 'login'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === t
                  ? `border-b-2 ${accentBorder} ${accentText}`
                  : 'text-gray-400 hover:text-gray-600'
              }`}>
              {t === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6">
          {tab === 'login'
            ? <SignInForm role={role} accent={accent} />
            : <RegisterForm role={role} accent={accent} />
          }

          <p className="mt-4 text-center text-xs text-gray-400">
            {tab === 'login' ? (
              <>No account?{' '}
                <button onClick={() => setTab('register')} className={`font-semibold ${accentText} hover:underline`}>
                  Create one
                </button>
              </>
            ) : (
              <>Already registered?{' '}
                <button onClick={() => setTab('login')} className={`font-semibold ${accentText} hover:underline`}>
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
