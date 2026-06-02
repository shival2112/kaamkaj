'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';
import { useAppAuth } from '@/context/AppAuthContext';

interface Props { onClose: () => void }

type Tab = 'login' | 'register';
type Step = 'phone' | 'otp';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Real Estate', 'Media', 'Other'];

export function EmployerAuthModal({ onClose }: Props) {
  const router = useRouter();
  const { registerEmployer, loginByPhone } = useAppAuth();
  const [tab, setTab] = useState<Tab>('register');

  // Register state
  const [regCompany,  setRegCompany]  = useState('');
  const [regName,     setRegName]     = useState('');
  const [regPhone,    setRegPhone]    = useState('');
  const [regIndustry, setRegIndustry] = useState('Technology');
  const [regLocation, setRegLocation] = useState('');
  const [regLoading,  setRegLoading]  = useState(false);
  const [regError,    setRegError]    = useState('');

  // Login state
  const [loginPhone,   setLoginPhone]   = useState('');
  const [loginOtp,     setLoginOtp]     = useState('');
  const [loginStep,    setLoginStep]    = useState<Step>('phone');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError,   setLoginError]   = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(regPhone)) { setRegError('Enter a valid 10-digit phone number.'); return; }
    if (!regCompany.trim() || !regName.trim() || !regLocation.trim()) { setRegError('All fields are required.'); return; }
    setRegLoading(true); setRegError('');
    await new Promise(r => setTimeout(r, 500)); // brief UX delay
    const result = registerEmployer({ name: regName, phone: regPhone, company: regCompany, industry: regIndustry, location: regLocation });
    setRegLoading(false);
    if (!result.ok) { setRegError(result.error ?? 'Registration failed.'); return; }
    document.cookie = 'demo-employer=true; path=/; max-age=86400';
    onClose();
    router.push('/employer/dashboard');
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
    const result = loginByPhone(loginPhone, 'employer');
    setLoginLoading(false);
    if (!result.ok) { setLoginError(result.error ?? 'Login failed.'); setLoginStep('phone'); return; }
    document.cookie = 'demo-employer=true; path=/; max-age=86400';
    onClose();
    router.push('/employer/dashboard');
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6B46C1] focus:outline-none focus:ring-2 focus:ring-[#6B46C1]/20';
  const labelCls = 'mb-1.5 block text-xs font-semibold text-gray-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="font-bold text-gray-900">Employer Portal</h2>
            <p className="text-xs text-gray-500">Post jobs and manage hiring</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['register', 'login'] as Tab[]).map(t => (
            <button key={t} onClick={() => { setTab(t); setRegError(''); setLoginError(''); setLoginStep('phone'); }}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${tab === t ? 'border-b-2 border-[#6B46C1] text-[#6B46C1]' : 'text-gray-500 hover:text-gray-700'}`}>
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
                <label className={labelCls}>Company Name *</label>
                <input required value={regCompany} onChange={e => setRegCompany(e.target.value)} placeholder="e.g. Acme Technologies" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Your Name *</label>
                <input required value={regName} onChange={e => setRegName(e.target.value)} placeholder="e.g. Rahul Sharma" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone Number * (10 digits)</label>
                <input required type="tel" maxLength={10} value={regPhone} onChange={e => setRegPhone(e.target.value.replace(/\D/g, ''))} placeholder="9876543210" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Industry</label>
                  <select value={regIndustry} onChange={e => setRegIndustry(e.target.value)} className={inputCls}>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Location *</label>
                  <input required value={regLocation} onChange={e => setRegLocation(e.target.value)} placeholder="e.g. Bangalore" className={inputCls} />
                </div>
              </div>
              <button type="submit" disabled={regLoading}
                className="w-full rounded-xl bg-[#6B46C1] py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2">
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
                  <div className="rounded-xl bg-purple-50 px-4 py-2.5 text-xs text-purple-700">
                    <p className="font-semibold">How it works</p>
                    <p>Enter your phone number + OTP <span className="font-bold">123456</span>. New numbers are auto-registered.</p>
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input required type="tel" maxLength={10} value={loginPhone}
                      onChange={e => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit phone number" className={inputCls} />
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-[#6B46C1] py-3 text-sm font-bold text-white hover:bg-purple-700">
                    Send OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <p className="text-xs text-gray-500">OTP sent to <span className="font-semibold text-gray-700">{loginPhone}</span></p>
                  <p className="rounded-xl bg-blue-50 px-4 py-2.5 text-xs text-blue-700">OTP: <span className="font-bold">123456</span></p>
                  <div>
                    <label className={labelCls}>Enter OTP</label>
                    <input required type="text" maxLength={6} value={loginOtp}
                      onChange={e => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit OTP" className={`${inputCls} tracking-widest text-center text-lg font-bold`} />
                  </div>
                  <button type="submit" disabled={loginLoading}
                    className="w-full rounded-xl bg-[#6B46C1] py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-60 flex items-center justify-center gap-2">
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
