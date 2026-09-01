'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowUp } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export function FooterSection() {
  const scrollToTop = () => {
    sounds.playTick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 border-t border-[rgba(255,255,255,0.06)] bg-[#09090b] pt-16 pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-sans font-bold text-sm tracking-widest text-[#fafafa]">
            PATHFORGE<span className="text-[#8b5cf6]">AI</span>
          </span>
          <span className="text-xs font-mono text-[#a1a1aa] ml-2">© 2026 PathForge AI Platform</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-8 text-xs font-mono uppercase tracking-widest text-[#a1a1aa]">
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          <Link href="/register" className="hover:text-white transition-colors">Register</Link>
        </div>

        {/* Back to top */}
        <button
          onClick={scrollToTop}
          className="p-3 rounded-xl bg-[#18181b] border border-[rgba(255,255,255,0.08)] text-[#a1a1aa] hover:text-white hover:border-[#8b5cf6] transition-all flex items-center gap-2 text-xs font-mono uppercase"
        >
          <span>Back to Top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>

      </div>
    </footer>
  );
}

export default FooterSection;
