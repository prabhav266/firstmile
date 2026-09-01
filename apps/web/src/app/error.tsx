'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 max-w-md w-full text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-[#ef4444]" />
        </div>
        <h1 className="font-sans font-bold text-2xl text-[#f9fafb] mb-3">Something went wrong</h1>
        <p className="text-sm text-[#cbd5e1] mb-8 leading-relaxed">
          An unexpected error occurred. Our team has been notified. Please try again.
          {error.digest && (
            <span className="block mt-2 font-mono text-xs text-[#94a3b8]">Error ID: {error.digest}</span>
          )}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-[#111827] border border-[rgba(255,255,255,0.08)] text-[#cbd5e1] hover:bg-[#1f2937] hover:text-[#f9fafb] active:bg-[#111827] rounded-xl py-2.5 px-5 font-semibold text-sm transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
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
