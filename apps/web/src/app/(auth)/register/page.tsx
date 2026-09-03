'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Users,
  Building2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { OtpInput } from '@/components/auth/OtpInput';
import { sounds } from '@/lib/sounds';

type PersonaRole = 'STUDENT' | 'RECRUITER' | 'TPO';

export default function RegisterPage() {
  const router = useRouter();

  // Step 1: Persona Selection, Step 2: Profile Info & Email, Step 3: 6-Digit OTP Verification
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<PersonaRole>('STUDENT');
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Student Fields
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('Computer Science (CSE)');
  const [year, setYear] = useState(3);

  // Recruiter Fields
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('Technical Talent Lead');
  const [hiringDomain, setHiringDomain] = useState('Full Stack & Distributed Systems');

  // University TPO Fields
  const [institutionName, setInstitutionName] = useState('');
  const [tpoDesignation, setTpoDesignation] = useState('Head of Training & Placements');

  // OTP State
  const [otpCode, setOtpCode] = useState('');

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !email.includes('@')) {
      return toast.error('Please enter your full name and valid email');
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/send-otp', { email, mode: 'register' });
      sounds.playToggle();
      if (res.data?.data?.devOtp) {
        setOtpCode(res.data.data.devOtp);
        toast.success(`Verification Code: ${res.data.data.devOtp}`, { duration: 12000 });
      } else {
        toast.success(`Verification code dispatched to ${email}`);
      }
      setStep(3);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send verification code';
      toast.error(msg);
      if (err.response?.status === 409) {
        toast((t) => (
          <span className="flex items-center gap-2 text-xs">
            <span>Account already exists!</span>
            <Link
              href="/login"
              onClick={() => toast.dismiss(t.id)}
              className="text-[#ffffff] font-bold underline"
            >
              Sign In Instead →
            </Link>
          </span>
        ), { duration: 6000 });
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP & Complete Registration
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (!code || code.length !== 6) {
      return toast.error('Please enter the 6-digit verification code');
    }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/verify-otp', {
        email,
        code,
        name,
        role,
        college: role === 'STUDENT' ? college : undefined,
        branch: role === 'STUDENT' ? branch : undefined,
        year: role === 'STUDENT' ? Number(year) : undefined,
        company: role === 'RECRUITER' ? company : undefined,
        designation: role === 'RECRUITER' ? designation : role === 'TPO' ? tpoDesignation : undefined,
        institutionName: role === 'TPO' ? institutionName : undefined,
        hiringDomain: role === 'RECRUITER' ? hiringDomain : undefined,
      });

      sounds.playChime();
      const redirectUrl = res.data?.data?.redirectUrl || '/dashboard';
      const token = res.data?.data?.accessToken;

      if (token) {
        try {
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
        } catch (e) {}

        document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax; secure`;
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-token', token);
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('pathforge-career-os-gamification');
      }
      toast.success(`Account created! Welcome to First Mile.`);
      window.location.href = redirectUrl;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#000000] px-4 py-8 font-sans select-none">
      <div className="w-full max-w-lg relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <h1 className="font-display font-black text-2xl tracking-widest text-[#ffffff] uppercase group-hover:text-[#b5b5b5] transition-colors">
              FIRST MILE
            </h1>
          </Link>
          <p className="text-xs text-[#888888] mt-1 font-mono tracking-tight">Where careers begin.</p>
        </div>

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-7 space-y-6 shadow-2xl">
          {/* Progress Step Bar */}
          <div className="space-y-2 pb-3 border-b border-[#1a1a1a]">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#666666] uppercase tracking-wider">
                Step 0{step} / 03
              </span>
              <span className="text-[#ffffff] font-medium">
                {step === 1 ? 'Select Role' : step === 2 ? 'Profile Details' : 'Verify Email'}
              </span>
            </div>
            <div className="w-full bg-[#141414] h-1 rounded-full overflow-hidden">
              <div
                className="bg-[#ffffff] h-full transition-all duration-300 ease-out"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: Persona Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-sm font-bold text-[#ffffff] tracking-tight">Select Account Persona</h2>
                  <p className="text-xs text-[#888888] mt-0.5">Choose how you will engage with First Mile.</p>
                </div>

                <div className="space-y-2">
                  {/* Option 1: Student */}
                  <div
                    onClick={() => setRole('STUDENT')}
                    className={`p-4 rounded-md border cursor-pointer transition-all flex items-start gap-3.5 ${
                      role === 'STUDENT'
                        ? 'bg-[#121212] border-[#ffffff]'
                        : 'bg-[#000000] border-[#242424] hover:border-[#444444]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-[#181818] border border-[#27272a] flex items-center justify-center text-[#ffffff] shrink-0 mt-0.5">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#ffffff]">Student Candidate</h3>
                        {role === 'STUDENT' && <Check className="w-3.5 h-3.5 text-[#ffffff]" />}
                      </div>
                      <p className="text-[11px] text-[#888888] mt-1 leading-relaxed">
                        Track DSA problems, audit resumes against ATS benchmarks, and practice voice technical mocks.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Recruiter */}
                  <div
                    onClick={() => setRole('RECRUITER')}
                    className={`p-4 rounded-md border cursor-pointer transition-all flex items-start gap-3.5 ${
                      role === 'RECRUITER'
                        ? 'bg-[#121212] border-[#ffffff]'
                        : 'bg-[#000000] border-[#242424] hover:border-[#444444]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-[#181818] border border-[#27272a] flex items-center justify-center text-[#ffffff] shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#ffffff]">Corporate Recruiter</h3>
                        {role === 'RECRUITER' && <Check className="w-3.5 h-3.5 text-[#ffffff]" />}
                      </div>
                      <p className="text-[11px] text-[#888888] mt-1 leading-relaxed">
                        Discover verified engineering talent filtered by ungameable proof-of-work and STAR mock scores.
                      </p>
                    </div>
                  </div>

                  {/* Option 3: University TPO */}
                  <div
                    onClick={() => setRole('TPO')}
                    className={`p-4 rounded-md border cursor-pointer transition-all flex items-start gap-3.5 ${
                      role === 'TPO'
                        ? 'bg-[#121212] border-[#ffffff]'
                        : 'bg-[#000000] border-[#242424] hover:border-[#444444]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded bg-[#181818] border border-[#27272a] flex items-center justify-center text-[#ffffff] shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#ffffff]">University Placement Cell (TPO)</h3>
                        {role === 'TPO' && <Check className="w-3.5 h-3.5 text-[#ffffff]" />}
                      </div>
                      <p className="text-[11px] text-[#888888] mt-1 leading-relaxed">
                        Monitor cohort placement readiness, benchmark departments, and export candidate dossiers.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full btn-primary py-2.5 gap-2"
                >
                  <span>Continue to Information</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: Profile Details */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[#888888] hover:text-[#ffffff] flex items-center gap-1 font-medium transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back to Roles</span>
                  </button>
                  <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                    {role} Profile
                  </span>
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#ffffff] tracking-tight">
                    {role === 'STUDENT' ? 'Student Information' : role === 'RECRUITER' ? 'Recruiter & Company Information' : 'University & Placement Details'}
                  </h2>
                </div>

                {/* Common Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Prabhav Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#000000] border border-[#242424] rounded-md py-2 px-3 text-xs text-[#ffffff] placeholder-[#444444] focus:outline-none focus:border-[#ffffff] transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="name@institution.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#000000] border border-[#242424] rounded-md py-2 px-3 text-xs text-[#ffffff] placeholder-[#444444] focus:outline-none focus:border-[#ffffff] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Role Specific Fields */}
                {role === 'STUDENT' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-mono text-[#888888] uppercase tracking-wider block mb-1">University / Institute</label>
                      <input
                        type="text"
                        placeholder="e.g. Indian Institute of Information Technology"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        className="w-full bg-[#000000] border border-[#242424] rounded-md py-2 px-3 text-xs text-[#ffffff] placeholder-[#444444] focus:outline-none focus:border-[#ffffff] transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Discipline / Branch</label>
                        <select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full bg-[#000000] border border-[#242424] rounded-md py-2 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff] transition-all"
                        >
                          <option value="Computer Science (CSE)">CSE</option>
                          <option value="Information Technology (IT)">IT</option>
                          <option value="AI & Data Science (AI/DS)">AI & Data Science</option>
                          <option value="Electronics (ECE)">ECE</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Batch Year</label>
                        <select
                          value={year}
                          onChange={(e) => setYear(Number(e.target.value))}
                          className="w-full bg-[#000000] border border-[#242424] rounded-md py-2 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff] transition-all"
                        >
                          <option value={4}>4th Year (Class of 2026)</option>
                          <option value={3}>3rd Year (Class of 2027)</option>
                          <option value={2}>2nd Year (Class of 2028)</option>
                          <option value={1}>1st Year (Class of 2029)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {role === 'RECRUITER' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Company / Organization</label>
                      <input
                        type="text"
                        placeholder="e.g. Atlassian, Razorpay, Google"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full bg-[#000000] border border-[#242424] rounded-md py-2 px-3 text-xs text-[#ffffff] placeholder-[#444444] focus:outline-none focus:border-[#ffffff] transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Primary Hiring Track</label>
                      <input
                        type="text"
                        placeholder="e.g. Distributed Systems & Core SDE"
                        value={hiringDomain}
                        onChange={(e) => setHiringDomain(e.target.value)}
                        className="w-full bg-[#000000] border border-[#242424] rounded-md py-2 px-3 text-xs text-[#ffffff] placeholder-[#444444] focus:outline-none focus:border-[#ffffff] transition-all"
                      />
                    </div>
                  </div>
                )}

                {role === 'TPO' && (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-mono text-[#888888] uppercase tracking-wider block mb-1">University / Institute Name</label>
                      <input
                        type="text"
                        placeholder="e.g. National Institute of Technology"
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full bg-[#000000] border border-[#242424] rounded-md py-2 px-3 text-xs text-[#ffffff] placeholder-[#444444] focus:outline-none focus:border-[#ffffff] transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-2.5 gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#000000]" />
                  ) : (
                    <>
                      <span>Send Authentication Code</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* STEP 3: 6-Digit OTP Verification */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-[#888888] hover:text-[#ffffff] flex items-center gap-1 font-medium transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back to Details</span>
                  </button>
                  <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider">
                    {role} Registration
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <h2 className="text-sm font-bold text-[#ffffff]">Enter Verification Code</h2>
                  <p className="text-xs text-[#888888]">
                    We sent a 6-digit code to <strong className="text-[#ffffff]">{email}</strong>. Check your inbox.
                  </p>
                </div>

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
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#000000]" /> : <span>Complete Registration</span>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom link */}
          <p className="text-center text-xs text-[#888888] pt-1">
            Already registered on First Mile?{' '}
            <Link href="/login" className="text-[#ffffff] hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
