'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../stores/auth.store';
import { Package, Loader2, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { sendRegisterOtp, verifyAndRegister, isLoading } = useAuthStore();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const msg = await sendRegisterOtp(email);
      setInfoMessage(msg || 'Verification code sent to your email.');
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please check your email.');
    }
  };

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await verifyAndRegister({ name, email, password, otp });
      router.push('/shop');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Package className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            {step === 'details' ? 'Create an account' : 'Verify your email'}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {step === 'details' ? (
              <>
                Already registered?{' '}
                <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                  Sign in instead
                </Link>
              </>
            ) : (
              `Enter the 6-digit verification code sent to ${email}`
            )}
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {step === 'details' ? (
          <form className="mt-6 space-y-4" onSubmit={handleSendOtp}>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                placeholder="Chandan Reddy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-colors"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue with OTP'}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleVerifyAndRegister}>
            <div>
              <label className="block text-xs font-semibold text-slate-700">6-Digit Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-lg tracking-widest font-mono text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                placeholder="123456"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-colors"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Complete Registration'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('details');
                setError(null);
                setInfoMessage(null);
              }}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Edit details or resend code
            </button>
          </form>
        )}

        <div className="pt-2 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}