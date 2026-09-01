'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export function HeroNav() {
  const handleHover = () => {
    sounds.playTick();
  };

  return (
    <nav className="relative z-50 w-full max-w-[1920px] mx-auto px-6 md:px-12 py-6 flex items-center justify-between pointer-events-auto">
      {/* Left Navigation Cluster */}
      <div className="flex items-center gap-8 md:gap-12">
        <Link
          href="/"
          onMouseEnter={handleHover}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.4)] group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span className="font-sans font-bold text-sm md:text-base tracking-widest text-[#fafafa] group-hover:text-[#3b82f6] transition-colors">
            PATHFORGE<span className="text-[#8b5cf6]">AI</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-[#a1a1aa] tracking-widest uppercase">
          <a
            href="#features"
            onMouseEnter={handleHover}
            className="hover:text-[#fafafa] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#8b5cf6] hover:after:w-full after:transition-all"
          >
            Capabilities
          </a>
          <a
            href="#how-it-works"
            onMouseEnter={handleHover}
            className="hover:text-[#fafafa] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#8b5cf6] hover:after:w-full after:transition-all"
          >
            Workflow
          </a>
          <a
            href="#roadmap"
            onMouseEnter={handleHover}
            className="hover:text-[#fafafa] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#8b5cf6] hover:after:w-full after:transition-all"
          >
            Roadmap
          </a>
          <a
            href="#analysis"
            onMouseEnter={handleHover}
            className="hover:text-[#fafafa] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#8b5cf6] hover:after:w-full after:transition-all"
          >
            AI Scorer
          </a>
        </div>
      </div>

      {/* Right Navigation Cluster */}
      <div className="flex items-center gap-4 md:gap-8">
        <Link
          href="/login"
          onMouseEnter={handleHover}
          className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] hover:text-[#fafafa] transition-colors px-3 py-2"
        >
          Sign In
        </Link>

        <Link
          href="/register"
          onMouseEnter={handleHover}
          className="relative inline-flex items-center gap-2 bg-[#fafafa] text-[#09090b] hover:bg-[#8b5cf6] hover:text-white rounded-xl py-2.5 px-5 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_24px_rgba(139,92,246,0.4)] hover:scale-[1.02]"
        >
          <span>Start Journey</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </nav>
  );
}

export default HeroNav;
