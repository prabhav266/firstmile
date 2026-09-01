'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Lock, Mail, ArrowRight, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please enter email and password');
    }

    setLoading(true);
    try {
      await api.post('/api/auth/login', { email, password });
      toast.success('Welcome back!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0F172A] px-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="font-sans font-bold text-3xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] bg-clip-text text-transparent tracking-wide mb-2">
            PATHFORGE AI
          </h1>
          <p className="text-sm text-[#94A3B8]">Your Placement & Career Development Navigator</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1F2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 space-y-6">
          <h2 className="text-xl font-semibold text-[#F9FAFB]">Sign In</h2>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-5 h-5 text-[#94A3B8]" />
              <input
                type="email"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 pl-12 pr-4 text-sm text-[#F9FAFB] placeholder:text-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Password</label>
              <Link href="#" className="text-xs text-[#3B82F6] hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-5 h-5 text-[#94A3B8]" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 pl-12 pr-4 text-sm text-[#F9FAFB] placeholder:text-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] active:bg-[#1D4ED8] text-white rounded-xl py-3 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
          </motion.button>

          {/* Bottom link */}
          <p className="text-center text-xs text-[#CBD5E1] pt-2">
            New to PathForge? <Link href="/register" className="text-[#3B82F6] hover:underline font-semibold">Create account</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
