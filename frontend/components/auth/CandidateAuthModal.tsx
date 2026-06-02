'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import { useAppAuth } from '@/context/AppAuthContext';

interface Props { onClose: () => void }
type Tab = 'login' | 'register';
type Step = 'phone' | 'otp';

export function CandidateAuthModal({ onClose }: Props) {
  const router = useRouter();
  const { registerCandidate, loginByPhone } = useAppAuth();
  const [tab, setTab] = useState<Tab>('register');

  // Register
  const [regName,    setRegName]    = useState('');
  const [regPhone,   setRegPhone]   = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError,   setRegError]   = useState('');

  // Login
  const [loginPhone,   setLoginPhone]   = useState('');
  const [loginOtp,     setLoginOtp]     = useState('');
  const [loginStep,    setLoginStep]    = useState<Step>('phone');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError,   setLoginError]   = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) { setRegError('Please enter your full name.'); return; }
    if (!/^\d{10}$/.test(regPhone)) { setRegError('Enter a valid 10-digit phone number.'); return; }
    setRegLoading(true); setRegError('');
    await new Promise(r => setTimeout(r, 500));
    const result = registerCandidate({ name: regName, phone: regPhone });
    setRegLoading(false);
    if (!result.ok) { setRegError(result.error ?? 'Registration failed.'); return; }
    document.cookie = 'demo-candidate=true; path=/; max-age=86400';
    onClose();
    router.push('/dashboard');
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(loginPhone)) { setLoginError('Enter a valid 10-digit phone number.'); return; }
    setLoginError('');
    setLoginStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginOtp !== '123456') { setLoginError('Invalid OTP. Use 123456.'); return; }
    setLoginLoading(true); setLoginError('');
    await new Promise(r => setTimeout(r, 500));
    const result = loginByPhone(loginPhone, 'candidate');
    setLoginLoading(false);
    if (!result.ok) { setLoginError(result.error ?? 'Login failed.'); setLoginStep('phone'); return; }
    document.cookie = 'demo-candidate=true; path=/; max-age=86400';
    onClose();
    router.push('/dashboard');
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#007a5a] focus:outline-none focus:ring-2 focus:ring-[#007a5a]/20';
  const labelCls = 'mb-1.5 block text-xs font-semibold text-gray-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="font-bold text-gray-900">Candidate Portal</h2>
            <p className="text-xs text-gray-500">Find great job opportunities</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['register', 'login'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setRegError(''); setLoginError(''); setLoginStep('phone'); }}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${tab === t ? 'border-b-2 border-[#007a5a] text-[#007a5a]' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── Register ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {regError && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{regError}</div>}
              <div>
                <label className={labelCls}>Full Name *</label>
                <input required value={regName} onChange={e => setRegName(e.target.value)} placeholder="e.g. Rahul Sharma" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone Number * (10 digits)</label>
                <input required type="tel" maxLength={10} value={regPhone}
                  onChange={e => setRegPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210" className={inputCls} />
              </div>
              <button type="submit" disabled={regLoading}
                className="w-full rounded-xl bg-[#007a5a] py-3 text-sm font-bold text-white hover:bg-[#006a4e] disabled:opacity-60 flex items-center justify-center gap-2">
                {regLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Account
              </button>
            </form>
          )}

          {/* ── Login ── */}
          {tab === 'login' && (
            <div className="space-y-4">
              {loginError && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{loginError}</div>}

              {loginStep === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className={labelCls}>Registered Phone Number</label>
                    <input required type="tel" maxLength={10} value={loginPhone}
                      onChange={e => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit phone number" className={inputCls} />
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-[#007a5a] py-3 text-sm font-bold text-white hover:bg-[#006a4e]">
                    Send OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <p className="text-xs text-gray-500">OTP sent to <span className="font-semibold text-gray-700">{loginPhone}</span></p>
                  <p className="rounded-xl bg-blue-50 px-4 py-2.5 text-xs text-blue-700">Enter any phone number · OTP is always <span className="font-bold">123456</span></p>
                  <div>
                    <label className={labelCls}>Enter OTP</label>
                    <input required type="text" maxLength={6} value={loginOtp}
                      onChange={e => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit OTP" className={`${inputCls} tracking-widest text-center text-lg font-bold`} />
                  </div>
                  <button type="submit" disabled={loginLoading}
                    className="w-full rounded-xl bg-[#007a5a] py-3 text-sm font-bold text-white hover:bg-[#006a4e] disabled:opacity-60 flex items-center justify-center gap-2">
                    {loginLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Verify &amp; Login
                  </button>
                  <button type="button" onClick={() => { setLoginStep('phone'); setLoginOtp(''); setLoginError(''); }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700">
                    ← Change phone number
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
