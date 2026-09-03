'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 max-w-md w-full text-center"
      >
        <div className="font-sans font-extrabold text-7xl text-[#3b82f6] mb-4">404</div>
        <h1 className="font-sans font-bold text-2xl text-[#f9fafb] mb-3">Page not found</h1>
        <p className="text-[#cbd5e1] text-sm mb-8 max-w-xs mx-auto leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist. It may have been moved or deleted.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 bg-[#111827] border border-[rgba(255,255,255,0.08)] text-[#cbd5e1] hover:bg-[#1f2937] hover:text-[#f9fafb] active:bg-[#111827] rounded-xl py-2.5 px-5 font-semibold text-sm transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-[#3b82f6] text-white hover:bg-[#2563eb] active:bg-[#1d4ed8] rounded-xl py-2.5 px-5 font-semibold text-sm transition-colors duration-200"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
