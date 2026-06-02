'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  onLogin: () => void;
  onClose: () => void;
}

type Phase = 'phone' | 'otp';

export function LoginModal({ onLogin, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setPhase('otp');
  };

  const handleVerify = () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    onLogin();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900">Login to Register</h2>
        <p className="mt-1 text-sm text-gray-500">
          {phase === 'phone'
            ? 'Enter your phone number to continue'
            : `OTP sent to +91 ${phone}`}
        </p>

        {phase === 'phone' ? (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Phone Number
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2.5 focus-within:border-[#14a085] focus-within:ring-2 focus-within:ring-[#14a085]/20 transition-all">
                <span className="shrink-0 text-sm text-gray-500">🇮🇳 +91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  placeholder="Enter phone number"
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
            <button
              onClick={handleSendOtp}
              className="w-full rounded-xl bg-[#14a085] py-3 text-sm font-bold text-white transition-colors hover:bg-[#0d8a72]"
            >
              Send OTP
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Enter OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="6-digit OTP"
                autoFocus
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-lg font-bold tracking-[0.5em] text-gray-900 placeholder:text-sm placeholder:tracking-normal placeholder:font-normal focus:border-[#14a085] focus:outline-none focus:ring-2 focus:ring-[#14a085]/20"
              />
              {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
            <button
              onClick={handleVerify}
              className="w-full rounded-xl bg-[#14a085] py-3 text-sm font-bold text-white transition-colors hover:bg-[#0d8a72]"
            >
              Verify &amp; Register
            </button>
            <button
              onClick={() => {
                setPhase('phone');
                setOtp('');
                setError('');
              }}
              className="w-full text-sm text-[#14a085] hover:underline"
            >
              Change number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
