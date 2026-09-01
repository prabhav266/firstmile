'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Loader, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

  // Form State
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [college, setCollege] = React.useState('');
  const [branch, setBranch] = React.useState('');
  const [year, setYear] = React.useState(3);
  const [targetCompany, setTargetCompany] = React.useState('');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && (!name || !email || !password)) {
      return toast.error('Please fill in name, email and password');
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !branch || !targetCompany) {
      return toast.error('Please complete all academic details');
    }

    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        name,
        email,
        password,
        college,
        branch,
        year: Number(year),
        targetCompany,
      });
      toast.success('Registration successful! Welcome aboard!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0F172A] px-4 overflow-hidden font-sans">
      {/* Decorative premium background accent blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-sans font-bold text-3xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] mb-2 uppercase">
            PATHFORGE AI
          </h1>
          <p className="text-sm text-[#94A3B8]">Create your student account to get started</p>
        </div>

        <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 space-y-6">
          {/* Step Indicator */}
          <div className="space-y-3 pb-2 border-b border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider font-sans">
                Step {step} of 2
              </span>
              <span className="text-xs font-semibold text-[#3b82f6] font-sans">
                {step === 1 ? 'Personal Info' : 'Academic Details'}
              </span>
            </div>
            <div className="w-full bg-[#111827] h-1 rounded-full overflow-hidden">
              <div
                className="bg-[#3b82f6] h-full transition-all duration-300 ease-out"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onSubmit={handleNext}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold text-[#F9FAFB] font-sans">Personal Information</h2>
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider font-sans">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 pl-11 pr-4 text-sm text-[#F9FAFB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider font-sans">
                    College Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="email"
                      placeholder="you@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 pl-11 pr-4 text-sm text-[#F9FAFB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider font-sans">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 pl-11 pr-4 text-sm text-[#F9FAFB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white rounded-[12px] py-2.5 font-semibold text-sm transition-colors duration-200"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <h2 className="text-lg font-bold text-[#F9FAFB] font-sans">Academic Details</h2>

                {/* College */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider font-sans">
                    College Name
                  </label>
                  <input
                    type="text"
                    placeholder="IIT Bombay / BITS Pilani"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-4 text-sm text-[#F9FAFB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all"
                    required
                  />
                </div>

                {/* Branch */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider font-sans">
                    Academic Branch
                  </label>
                  <input
                    type="text"
                    placeholder="Computer Science / Electronics"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-4 text-sm text-[#F9FAFB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all"
                    required
                  />
                </div>

                {/* Year and Target Company */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider font-sans">
                      Current Year
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-3 text-sm text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all"
                    >
                      <option value={1} className="bg-[#111827]">1st Year</option>
                      <option value={2} className="bg-[#111827]">2nd Year</option>
                      <option value={3} className="bg-[#111827]">3rd Year</option>
                      <option value={4} className="bg-[#111827]">4th Year</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#CBD5E1] uppercase tracking-wider font-sans">
                      Target Company
                    </label>
                    <input
                      type="text"
                      placeholder="Google / Stripe"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-4 text-sm text-[#F9FAFB] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#111827] border border-[rgba(255,255,255,0.08)] text-[#CBD5E1] hover:text-[#F9FAFB] hover:bg-[#0F172A] active:bg-[#090D16] rounded-[12px] py-2.5 font-semibold text-sm transition-colors duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white rounded-[12px] py-2.5 font-semibold text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> Register</>}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-[#94A3B8] pt-2">
            Already have an account?{' '}
            <Link href="/login" className="text-[#3b82f6] hover:text-[#2563eb] hover:underline font-semibold transition-colors duration-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
