'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { X, Mail, KeyRound, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

interface BookingOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const OTP_AUTH_URL = process.env.NEXT_PUBLIC_OTP_URL || 'http://localhost:5000';

export default function BookingOtpModal({ isOpen, onClose, onSuccess }: BookingOtpModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${OTP_AUTH_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setStep('OTP');
      } else {
        setErrorMsg(data.message || 'Unable to send OTP. Please check your email.');
      }
    } catch {
      setErrorMsg('Failed to connect to authentication server on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${OTP_AUTH_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        const dummyToken = 'otp_session_' + Date.now();
        const userData = {
          id: 'user_' + Date.now(),
          name: name.trim() || email.split('@')[0],
          email: email.trim(),
          role: 'customer' as const,
        };

        useAuthStore.setState({
          user: userData,
          token: dummyToken,
          isAuthenticated: true,
          isLoading: false,
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', dummyToken);
          localStorage.setItem('user', JSON.stringify(userData));
        }

        onSuccess();
        onClose();
      } else {
        setErrorMsg(data.message || 'Invalid or expired OTP code.');
      }
    } catch {
      setErrorMsg('Failed to verify OTP with server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-slate-100 p-1.5 text-slate-500 hover:bg-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {step === 'EMAIL' ? 'Quick Checkout Verification' : 'Enter Verification Code'}
            </h3>
            <p className="text-xs text-slate-500">
              {step === 'EMAIL'
                ? 'No password required. Verify with your email OTP to complete booking.'
                : `Enter the 6-digit code sent to ${email}`}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-600 border border-red-200">
            {errorMsg}
          </div>
        )}

        {step === 'EMAIL' ? (
          <form onSubmit={handleSendOtp} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. reddy@example.com"
                  className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#fb641b] py-2.5 text-xs font-bold text-white shadow hover:bg-[#e85a15] disabled:opacity-50 transition"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">6-Digit OTP Code</label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.trim())}
                  placeholder="Enter 6-digit code"
                  className="block w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-center text-sm font-bold tracking-widest text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Verify & Proceed to Address</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('EMAIL');
                setOtp('');
                setErrorMsg('');
              }}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 pt-1"
            >
              Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
