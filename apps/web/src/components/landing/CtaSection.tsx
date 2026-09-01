'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export function CtaSection() {
  const handleHover = () => {
    sounds.playTick();
  };

  return (
    <section className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto z-10 text-center">
      <div className="bg-gradient-to-tr from-[#18181b] via-[#09090b] to-[#18181b] border border-[rgba(255,255,255,0.1)] rounded-3xl p-12 md:p-20 relative overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.8)]">
        
        {/* Glow Spheres */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#3b82f6]/20 to-[#8b5cf6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] text-xs font-mono font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>09 — BUILD YOUR CAREER FUTURE</span>
          </span>

          <h2 className="text-4xl md:text-6xl font-black text-[#fafafa] tracking-tight uppercase leading-tight">
            Ready to Forge Your Career Path?
          </h2>

          <p className="text-sm md:text-base text-[#a1a1aa] leading-relaxed">
            Join computer science aspirants systematically preparing for top-tier software engineering placements with real-time AI guidance.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              onMouseEnter={handleHover}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#fafafa] text-[#09090b] hover:bg-[#8b5cf6] hover:text-white rounded-2xl py-4 px-8 text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_24px_rgba(255,255,255,0.2)] hover:shadow-[0_4px_32px_rgba(139,92,246,0.5)] hover:scale-[1.03]"
            >
              <span>Build My Path Now</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              onMouseEnter={handleHover}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#18181b] border border-[rgba(255,255,255,0.1)] text-[#fafafa] hover:border-white rounded-2xl py-4 px-8 text-sm font-bold uppercase tracking-wider transition-all"
            >
              <span>Sign In to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
