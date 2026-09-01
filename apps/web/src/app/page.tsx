'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { HeroCanvasEffect } from '@/components/landing/HeroCanvasEffect';
import { StackedHeadline } from '@/components/landing/StackedHeadline';
import { HeroNav } from '@/components/landing/HeroNav';
import { HeroInfoPanel } from '@/components/landing/HeroInfoPanel';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { AiAnalysisSection } from '@/components/landing/AiAnalysisSection';
import { InteractiveRoadmapSection } from '@/components/landing/InteractiveRoadmapSection';
import { SkillGapSection } from '@/components/landing/SkillGapSection';
import { ProjectBlueprintsSection } from '@/components/landing/ProjectBlueprintsSection';
import { CareerDestinationsSection } from '@/components/landing/CareerDestinationsSection';
import { InteractiveDemoSection } from '@/components/landing/InteractiveDemoSection';
import { CtaSection } from '@/components/landing/CtaSection';
import { FooterSection } from '@/components/landing/FooterSection';
import { sounds } from '@/lib/sounds';

export default function LandingPage() {
  const handleCtaHover = () => {
    sounds.playTick();
  };

  return (
    <main className="min-h-screen text-[#fafafa] bg-[#09090b] font-sans antialiased overflow-x-hidden relative selection:bg-[#8b5cf6] selection:text-white">
      
      {/* ─── 01 HERO SECTION (100vh Full Screen Composition) ─── */}
      <section className="relative w-full h-screen min-h-[700px] flex flex-col justify-between overflow-hidden">
        
        {/* Layer 1: WebGL Canvas Background (Gooey Shader & Particle Displacement) */}
        <HeroCanvasEffect />

        {/* Layer 2: Dark Readability Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/80 via-transparent to-[#09090b] pointer-events-none z-10" />

        {/* Layer 3: Minimal Floating Navigation Overlaid on Hero */}
        <HeroNav />

        {/* Layer 4: Working Area Hero Content Composition */}
        <div className="relative z-20 w-full max-w-[1920px] mx-auto px-6 md:px-12 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pointer-events-none">
          
          {/* Hero Left: Vertically Stacked GSAP Animated Headline & Primary CTA */}
          <div className="lg:col-span-8 space-y-8 pointer-events-auto">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18181b]/80 border border-[rgba(255,255,255,0.08)] backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
              <span className="text-[10px] font-mono text-[#a1a1aa] uppercase tracking-widest font-bold">
                Next-Gen AI Career Navigation System
              </span>
            </div>

            {/* GSAP Stacked Vertical Typography Engine */}
            <StackedHeadline />

            {/* Primary Action CTA Button */}
            <div className="pt-2">
              <Link
                href="/register"
                onMouseEnter={handleCtaHover}
                className="group relative inline-flex items-center gap-4 bg-[#fafafa] text-[#09090b] hover:bg-[#8b5cf6] hover:text-white rounded-2xl py-4 px-8 text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_8px_32px_rgba(255,255,255,0.2)] hover:shadow-[0_8px_40px_rgba(139,92,246,0.5)] hover:scale-[1.03] active:scale-[0.98]"
              >
                <span>BUILD MY PATH</span>
                <div className="w-7 h-7 rounded-xl bg-black/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            </div>
          </div>

          {/* Hero Right: Editorial Subtext & Interactive Visual Preview Card */}
          <div className="lg:col-span-4 hidden lg:flex justify-end pointer-events-auto">
            <HeroInfoPanel />
          </div>

        </div>

        {/* Hero Scroll Indicator */}
        <div className="relative z-20 pb-8 text-center pointer-events-none">
          <span className="text-[10px] font-mono text-[#a1a1aa]/60 uppercase tracking-widest block animate-bounce">
            Scroll to Explore Path ↓
          </span>
        </div>

      </section>

      {/* ─── 02 HOW PATHFORGE WORKS ─── */}
      <HowItWorksSection />

      {/* ─── 03 AI CAREER ANALYSIS ─── */}
      <AiAnalysisSection />

      {/* ─── 04 PERSONALIZED ROADMAP ─── */}
      <InteractiveRoadmapSection />

      {/* ─── 05 SKILL GAP ANALYSIS ─── */}
      <SkillGapSection />

      {/* ─── 06 LEARNING PATH & RECOMMENDED PROJECTS ─── */}
      <ProjectBlueprintsSection />

      {/* ─── 07 CAREER DESTINATIONS ─── */}
      <CareerDestinationsSection />

      {/* ─── 08 INTERACTIVE DEMO TERMINAL ─── */}
      <InteractiveDemoSection />

      {/* ─── 09 PRIMARY CTA BANNER ─── */}
      <CtaSection />

      {/* ─── 10 EDITORIAL FOOTER ─── */}
      <FooterSection />

    </main>
  );
}
