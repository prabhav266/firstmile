'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Building2,
  Users,
  GraduationCap,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { OtpInput } from '@/components/auth/OtpInput';
import { sounds } from '@/lib/sounds';

type LoginRole = 'STUDENT' | 'RECRUITER' | 'TPO';

export default function LoginPage() {
  const router = useRouter();

  // Active Role Persona Tab
  const [activeRole, setActiveRole] = useState<LoginRole>('STUDENT');

  // Step 1 = Email Input, Step 2 = 6-Digit OTP Verification
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: any;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // 1. Send OTP to Email
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      return toast.error('Please enter a valid email address');
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/send-otp', { email, mode: 'login' });
      sounds.playToggle();
      toast.success(`Verification code dispatched to ${email}`);
      setStep(2);
      setResendTimer(60);
      setCanResend(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send verification code';
      toast.error(msg);
      if (err.response?.status === 404) {
        toast((t) => (
          <span className="flex items-center gap-2 text-xs">
            <span>No account found.</span>
            <Link
              href="/register"
              onClick={() => toast.dismiss(t.id)}
              className="text-[#ffffff] font-bold underline"
            >
              Create Account →
            </Link>
          </span>
        ), { duration: 6000 });
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP & Auto-Route by Role
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (!code || code.length !== 6) {
      return toast.error('Please enter the complete 6-digit verification code');
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/verify-otp', {
        email,
        code,
        role: activeRole,
      });

      sounds.playChime();
      const redirectUrl = res.data?.data?.redirectUrl || (activeRole === 'RECRUITER' ? '/dashboard/recruiter' : activeRole === 'TPO' ? '/dashboard/tpo' : '/dashboard');
      const role = res.data?.data?.user?.role || activeRole;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('pathforge-career-os-gamification');
      }

      toast.success(`Authenticated as ${role === 'STUDENT' ? 'Student' : role === 'RECRUITER' ? 'Recruiter' : 'Campus Placement Cell'}...`);
      window.location.href = redirectUrl;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  // Demo 1-Click Quick Login
  const handleDemoLogin = async (demoEmail: string, role: LoginRole) => {
    setActiveRole(role);
    setEmail(demoEmail);
    setLoading(true);
    try {
      const res = await api.post('/api/auth/send-otp', { email: demoEmail });
      const devCode = res.data?.data?.devCode || '123456';
      setOtpCode(devCode);
      const verifyRes = await api.post('/api/auth/verify-otp', {
        email: demoEmail,
        code: devCode,
        name: `Demo ${role === 'STUDENT' ? 'Student' : role === 'RECRUITER' ? 'Recruiter' : 'Campus TPO'}`,
        role,
      });

      sounds.playChime();
      toast.success(`Signed in as Demo ${role}!`);
      window.location.href = verifyRes.data?.data?.redirectUrl || (role === 'RECRUITER' ? '/dashboard/recruiter' : role === 'TPO' ? '/dashboard/tpo' : '/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#000000] px-4 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <h1 className="font-display font-black text-2xl tracking-widest text-[#ffffff] uppercase group-hover:text-[#b5b5b5] transition-colors">
              FIRST MILE
            </h1>
          </Link>
          <p className="text-xs text-[#888888] mt-1 font-mono tracking-tight">Where careers begin.</p>
        </div>

        {/* Main Card */}
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-7 space-y-6 shadow-2xl">
          {/* Persona Selection Tabs */}
          <div className="space-y-2 pb-4 border-b border-[#1a1a1a]">
            <span className="text-[10px] font-mono font-medium text-[#666666] uppercase tracking-wider block text-center">
              Account Persona
            </span>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#000000] rounded-md border border-[#1a1a1a]">
              <button
                type="button"
                onClick={() => setActiveRole('STUDENT')}
                className={`py-2 px-1 rounded text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
                  activeRole === 'STUDENT'
                    ? 'bg-[#ffffff] text-[#000000] shadow-sm'
                    : 'text-[#888888] hover:text-[#ffffff]'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRole('RECRUITER')}
                className={`py-2 px-1 rounded text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
                  activeRole === 'RECRUITER'
                    ? 'bg-[#ffffff] text-[#000000] shadow-sm'
                    : 'text-[#888888] hover:text-[#ffffff]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Recruiter</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveRole('TPO')}
                className={`py-2 px-1 rounded text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
                  activeRole === 'TPO'
                    ? 'bg-[#ffffff] text-[#000000] shadow-sm'
                    : 'text-[#888888] hover:text-[#ffffff]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>University</span>
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              /* Step 1: Email Form */
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-sm font-bold text-[#ffffff] tracking-tight">
                    {activeRole === 'STUDENT' ? 'Student Sign In' : activeRole === 'RECRUITER' ? 'Corporate Recruiter Sign In' : 'Placement Cell Sign In'}
                  </h2>
                  <p className="text-xs text-[#888888] mt-0.5">Enter your email to receive a 6-digit authentication code.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-[#888888] uppercase tracking-wider block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#666666]" />
                    <input
                      type="email"
                      placeholder={activeRole === 'STUDENT' ? 'student@college.edu' : activeRole === 'RECRUITER' ? 'talent@company.com' : 'tpo@university.edu'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#000000] border border-[#242424] rounded-md py-2.5 pl-10 pr-4 text-xs text-[#ffffff] placeholder-[#444444] focus:outline-none focus:border-[#ffffff] transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-2.5 gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#000000]" />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              /* Step 2: 6-Digit OTP Verification */
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-[#888888] hover:text-[#ffffff] flex items-center gap-1 font-medium transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Change Email</span>
                  </button>
                  <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                    {activeRole}
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <h2 className="text-sm font-bold text-[#ffffff]">Enter Verification Code</h2>
                  <p className="text-xs text-[#888888]">
                    Dispatched to <strong className="text-[#ffffff]">{email}</strong>
                  </p>
                </div>

                {/* 6-Digit OtpInput */}
                <OtpInput
                  value={otpCode}
                  onChange={setOtpCode}
                  length={6}
                  disabled={loading}
                  onComplete={(code) => handleVerifyOtp(code)}
                />

                <button
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otpCode.length !== 6}
                  className="w-full btn-primary py-2.5 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#000000]" /> : <span>Verify & Access First Mile</span>}
                </button>

                {/* Resend Code Timer */}
                <div className="text-center pt-1">
                  {canResend ? (
                    <button
                      onClick={() => handleSendOtp()}
                      className="text-xs text-[#ffffff] hover:underline font-medium flex items-center justify-center gap-1.5 mx-auto"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Resend code</span>
                    </button>
                  ) : (
                    <p className="text-xs text-[#666666] font-mono">
                      Resend available in <span className="text-[#b5b5b5]">{resendTimer}s</span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Demo One-Click Persona Logins */}
          <div className="pt-4 border-t border-[#1a1a1a] space-y-2">
            <span className="text-[9px] font-mono text-[#666666] uppercase tracking-wider block text-center">
              Instant Demo Access
            </span>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('student.demo@pathforge.ai', 'STUDENT')}
                className="bg-[#000000] hover:bg-[#111111] border border-[#242424] hover:border-[#444444] p-2 rounded text-left transition-all group"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#b5b5b5] mb-1" />
                <div className="text-[11px] font-semibold text-[#ffffff]">Student</div>
                <div className="text-[9px] text-[#666666]">Cockpit</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('recruiter.demo@techcorp.com', 'RECRUITER')}
                className="bg-[#000000] hover:bg-[#111111] border border-[#242424] hover:border-[#444444] p-2 rounded text-left transition-all group"
              >
                <Users className="w-3.5 h-3.5 text-[#b5b5b5] mb-1" />
                <div className="text-[11px] font-semibold text-[#ffffff]">Recruiter</div>
                <div className="text-[9px] text-[#666666]">Search</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('tpo.head@university.edu', 'TPO')}
                className="bg-[#000000] hover:bg-[#111111] border border-[#242424] hover:border-[#444444] p-2 rounded text-left transition-all group"
              >
                <Building2 className="w-3.5 h-3.5 text-[#b5b5b5] mb-1" />
                <div className="text-[11px] font-semibold text-[#ffffff]">Placement</div>
                <div className="text-[9px] text-[#666666]">Cell</div>
              </button>
            </div>
          </div>

          {/* Bottom link */}
          <p className="text-center text-xs text-[#888888] pt-1">
            New to First Mile?{' '}
            <Link href="/register" className="text-[#ffffff] hover:underline font-semibold">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
