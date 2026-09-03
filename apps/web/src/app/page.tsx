'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code,
  FileText,
  MessageSquare,
  Users,
  Building2,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Activity,
  Award,
  Sparkles,
  Play,
  Briefcase,
  Flame,
  Check,
  Zap,
  Star,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function LandingPage() {
  const [activeConsoleTab, setActiveConsoleTab] = useState<'dsa' | 'voice' | 'ats' | 'dossier'>('dsa');

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] font-sans selection:bg-[#ffffff] selection:text-[#000000]">
      {/* Top Full-Bleed Editorial Navbar */}
      <nav className="border-b border-[#1a1a1a] bg-[#000000]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-display font-black text-sm tracking-widest text-[#ffffff] uppercase group-hover:text-[#b5b5b5] transition-colors">
              FIRST MILE
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 lg:gap-12 text-xs font-mono text-[#888888]">
            <a href="#pillars" className="hover:text-[#ffffff] transition-colors">Pillars</a>
            <a href="#ecosystem" className="hover:text-[#ffffff] transition-colors">Ecosystem</a>
            <a href="#recruiters" className="hover:text-[#ffffff] transition-colors">Recruiters</a>
            <a href="#universities" className="hover:text-[#ffffff] transition-colors">Universities</a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="text-xs font-medium text-[#888888] hover:text-[#ffffff] px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-primary text-xs py-1.5 px-4"
            >
              Start Your Mile
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section: Full-Viewport Edge-to-Edge 2-Column Command Center */}
      <section className="relative min-h-[85vh] flex flex-col justify-center border-b border-[#1a1a1a] py-12 lg:py-16">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-center">
            
            {/* Left Column: Monumental Branding & Directives (7 Cols) */}
            <div className="lg:col-span-7 space-y-7 xl:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#242424] bg-[#0a0a0a] text-[11px] font-mono text-[#888888]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff] animate-pulse" />
                <span>THE TECHNICAL CAREER ECOSYSTEM • 2026</span>
              </div>

              <h1 className="font-display font-black text-6xl sm:text-7xl lg:text-8xl xl:text-9xl tracking-tighter text-[#ffffff] leading-[0.88]">
                Where careers <br />
                <span className="text-[#666666]">begin.</span>
              </h1>

              <p className="text-base sm:text-lg xl:text-xl text-[#888888] max-w-2xl leading-relaxed">
                The gap between what you learn in college and where you want to work. Track DSA consistency, audit resumes against ATS algorithms, drill with AI voice phone screeners, and unlock direct recruiter discovery.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <Link
                  href="/register"
                  className="btn-primary text-sm py-3.5 px-8 gap-2.5 shadow-lg shadow-white/5"
                >
                  <span>Create Your Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="btn-secondary text-sm py-3.5 px-8"
                >
                  Explore Live Cockpit
                </Link>
              </div>

              {/* Ticker strip */}
              <div className="pt-6 border-t border-[#1a1a1a] flex flex-wrap items-center gap-6 xl:gap-8 text-xs font-mono text-[#666666]">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#ffffff]" />
                  <span>450+ Curated DSA Logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#ffffff]" />
                  <span>STAR AI Speech Screener</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#ffffff]" />
                  <span>Verified Recruiter Pipeline</span>
                </div>
              </div>
            </div>

            {/* Right Column: Full-Width Interactive Cockpit Console (5 Cols) */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-5 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
                
                {/* Console Tab Selector */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#1a1a1a]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#242424]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#242424]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#242424]" />
                  </div>
                  <div className="flex items-center gap-1 bg-[#000000] p-1 rounded border border-[#1a1a1a] font-mono text-[10px]">
                    <button
                      onClick={() => setActiveConsoleTab('dsa')}
                      className={`px-2.5 py-1 rounded transition-all ${
                        activeConsoleTab === 'dsa' ? 'bg-[#ffffff] text-[#000000] font-bold' : 'text-[#888888] hover:text-[#ffffff]'
                      }`}
                    >
                      DSA
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab('voice')}
                      className={`px-2.5 py-1 rounded transition-all ${
                        activeConsoleTab === 'voice' ? 'bg-[#ffffff] text-[#000000] font-bold' : 'text-[#888888] hover:text-[#ffffff]'
                      }`}
                    >
                      VOICE MOCK
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab('ats')}
                      className={`px-2.5 py-1 rounded transition-all ${
                        activeConsoleTab === 'ats' ? 'bg-[#ffffff] text-[#000000] font-bold' : 'text-[#888888] hover:text-[#ffffff]'
                      }`}
                    >
                      ATS AUDIT
                    </button>
                    <button
                      onClick={() => setActiveConsoleTab('dossier')}
                      className={`px-2.5 py-1 rounded transition-all ${
                        activeConsoleTab === 'dossier' ? 'bg-[#ffffff] text-[#000000] font-bold' : 'text-[#888888] hover:text-[#ffffff]'
                      }`}
                    >
                      DOSSIER
                    </button>
                  </div>
                </div>

                {/* Tab 1: Live DSA Telemetry */}
                {activeConsoleTab === 'dsa' && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-[#666666] uppercase">Verified Candidate Proof-of-Work</span>
                        <h4 className="text-sm font-bold text-[#ffffff]">Prabhav Sharma • SDE-1</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded border border-[#27272a] bg-[#111111] text-[10px] font-mono font-bold text-[#ffffff]">
                        348 SOLVED
                      </span>
                    </div>

                    {/* Solve breakdown */}
                    <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                      <div className="bg-[#000000] border border-[#1e1e1e] p-3 rounded">
                        <span className="text-[9px] text-[#666666] block uppercase">EASY</span>
                        <span className="text-base font-bold text-[#ffffff]">124</span>
                      </div>
                      <div className="bg-[#000000] border border-[#1e1e1e] p-3 rounded">
                        <span className="text-[9px] text-[#666666] block uppercase">MEDIUM</span>
                        <span className="text-base font-bold text-[#ffffff]">186</span>
                      </div>
                      <div className="bg-[#000000] border border-[#1e1e1e] p-3 rounded">
                        <span className="text-[9px] text-[#666666] block uppercase">HARD</span>
                        <span className="text-base font-bold text-[#ffffff]">38</span>
                      </div>
                    </div>

                    {/* Mini activity streak */}
                    <div className="bg-[#000000] border border-[#1e1e1e] p-3.5 rounded space-y-2.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#888888]">
                        <span className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-[#ffffff]" />
                          <span>42-Day Consistency Streak</span>
                        </span>
                        <span className="text-[#ffffff] font-bold">Top 4% Candidate</span>
                      </div>
                      <div className="grid grid-cols-12 gap-1">
                        {[...Array(24)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-3 rounded-xs ${
                              i % 3 === 0 ? 'bg-[#ffffff]' : i % 2 === 0 ? 'bg-[#777777]' : 'bg-[#2a2a2a]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Tab 2: Live Voice Mock Telemetry */}
                {activeConsoleTab === 'voice' && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-[#666666] uppercase">Google Technical Phone Screen</span>
                        <h4 className="text-sm font-bold text-[#ffffff]">Distributed Rate Limiter Design</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded border border-[#27272a] bg-[#111111] text-[10px] font-mono font-bold text-[#ffffff]">
                        9.2 / 10 STAR
                      </span>
                    </div>

                    {/* Live Waveform Mock */}
                    <div className="bg-[#000000] border border-[#1e1e1e] p-3 rounded flex items-center justify-center gap-1.5 h-16">
                      {[14, 30, 48, 22, 38, 54, 24, 16, 42, 50, 32, 20, 44, 56, 28, 16, 40, 46, 26, 12].map((h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-[#ffffff] rounded-full animate-pulse"
                          style={{ height: `${h}px`, animationDelay: `${i * 50}ms` }}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                      <div className="bg-[#000000] border border-[#1e1e1e] p-3 rounded">
                        <span className="text-[9px] text-[#666666] block uppercase">SPEECH CADENCE</span>
                        <span className="text-sm font-bold text-[#ffffff]">142 WPM</span>
                        <span className="text-[9px] text-[#888888] block mt-0.5">Optimal Technical Range</span>
                      </div>
                      <div className="bg-[#000000] border border-[#1e1e1e] p-3 rounded">
                        <span className="text-[9px] text-[#666666] block uppercase">CRUTCH WORDS</span>
                        <span className="text-sm font-bold text-[#ffffff]">0 Detected</span>
                        <span className="text-[9px] text-[#888888] block mt-0.5">100% Verbal Precision</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Tab 3: Harvard ATS Audit Telemetry */}
                {activeConsoleTab === 'ats' && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-[#666666] uppercase">Harvard ATS Resume Index</span>
                        <h4 className="text-sm font-bold text-[#ffffff]">SDE-1 Resume Parse Benchmark</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded border border-[#27272a] bg-[#111111] text-[10px] font-mono font-bold text-[#ffffff]">
                        88% MATCH
                      </span>
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                      <div className="bg-[#000000] border border-[#1e1e1e] p-2.5 rounded flex items-center justify-between">
                        <span className="text-[#888888]">Action-Verb Strength</span>
                        <span className="text-[#ffffff] font-bold">94% Passed</span>
                      </div>
                      <div className="bg-[#000000] border border-[#1e1e1e] p-2.5 rounded flex items-center justify-between">
                        <span className="text-[#888888]">Metric Quantifications</span>
                        <span className="text-[#ffffff] font-bold">85% Passed</span>
                      </div>
                      <div className="bg-[#000000] border border-[#1e1e1e] p-2.5 rounded flex items-center justify-between">
                        <span className="text-[#888888]">Distributed Systems Keywords</span>
                        <span className="text-[#ffffff] font-bold">89% Match</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Tab 4: Recruiter Dossier Preview */}
                {activeConsoleTab === 'dossier' && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-[#666666] uppercase">Recruiter Discovery Dossier</span>
                        <h4 className="text-sm font-bold text-[#ffffff]">Candidate Index #FM-8921</h4>
                      </div>
                      <span className="px-2.5 py-0.5 rounded border border-[#27272a] bg-[#ffffff] text-[10px] font-mono font-bold text-[#000000]">
                        PRE-VETTED
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                      <div className="bg-[#000000] border border-[#1e1e1e] p-2.5 rounded">
                        <span className="text-[9px] text-[#666666] block">READINESS INDEX</span>
                        <span className="font-bold text-[#ffffff]">91 / 100</span>
                      </div>
                      <div className="bg-[#000000] border border-[#1e1e1e] p-2.5 rounded">
                        <span className="text-[9px] text-[#666666] block">PORTFOLIO PROJECTS</span>
                        <span className="font-bold text-[#ffffff]">3 Verified</span>
                      </div>
                    </div>

                    <div className="bg-[#000000] border border-[#1e1e1e] p-2.5 rounded font-mono text-xs flex items-center justify-between">
                      <span className="text-[#888888]">Direct Outreach Status</span>
                      <span className="text-[#ffffff] font-bold">Open to Offers</span>
                    </div>
                  </motion.div>
                )}

                {/* Bottom console link */}
                <div className="pt-3 border-t border-[#1a1a1a] flex items-center justify-between text-[11px] font-mono text-[#666666]">
                  <span>Live Candidate ID #FM-8921</span>
                  <Link href="/register" className="text-[#ffffff] hover:underline font-semibold flex items-center gap-1">
                    <span>Audit Your Profile</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Full-Bleed 4-Quadrant Metric Strip */}
      <section className="border-b border-[#1a1a1a] bg-[#050505]">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 font-mono">
            <div className="lg:pr-8 lg:border-r lg:border-[#1a1a1a]">
              <div className="text-3xl sm:text-4xl font-bold font-display text-[#ffffff]">450+</div>
              <div className="text-xs text-[#666666] uppercase mt-1">Curated DSA Trackers</div>
            </div>
            <div className="lg:px-8 lg:border-r lg:border-[#1a1a1a]">
              <div className="text-3xl sm:text-4xl font-bold font-display text-[#ffffff]">STAR</div>
              <div className="text-xs text-[#666666] uppercase mt-1">AI Voice Behavioral Scoring</div>
            </div>
            <div className="lg:px-8 lg:border-r lg:border-[#1a1a1a]">
              <div className="text-3xl sm:text-4xl font-bold font-display text-[#ffffff]">100%</div>
              <div className="text-xs text-[#666666] uppercase mt-1">Ungameable Proof-of-Work</div>
            </div>
            <div className="lg:pl-8">
              <div className="text-3xl sm:text-4xl font-bold font-display text-[#ffffff]">3-Way</div>
              <div className="text-xs text-[#666666] uppercase mt-1">Student, Recruiter & TPO</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars Grid */}
      <section id="pillars" className="py-24 border-b border-[#1a1a1a]">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24">
          <div className="mb-16">
            <span className="text-xs font-mono text-[#666666] uppercase tracking-wider block mb-2">Pillars</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#ffffff] tracking-tight">
              Engineered for measurable career progression.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="editorial-panel p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded bg-[#111111] border border-[#242424] flex items-center justify-center text-[#ffffff] mb-6">
                  <Code className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#ffffff] mb-2">Coding & DSA Tracker</h3>
                <p className="text-xs text-[#888888] leading-relaxed">
                  Log Striver SDE Sheet, LeetCode patterns, and blind 75 problem sets. Live breakdown by difficulty with active revision heatmaps.
                </p>
              </div>
              <div className="pt-6 border-t border-[#1a1a1a] mt-6 text-[11px] font-mono text-[#666666]">
                01 / CODING RIGOR
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="editorial-panel p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded bg-[#111111] border border-[#242424] flex items-center justify-center text-[#ffffff] mb-6">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#ffffff] mb-2">AI Voice Mock Screener</h3>
                <p className="text-xs text-[#888888] leading-relaxed">
                  Live Web Audio frequency screener that analyzes speaking pace (WPM), crutch-word count, and grades responses against the STAR framework.
                </p>
              </div>
              <div className="pt-6 border-t border-[#1a1a1a] mt-6 text-[11px] font-mono text-[#666666]">
                02 / TECHNICAL CADENCE
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="editorial-panel p-7 sm:p-9 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded bg-[#111111] border border-[#242424] flex items-center justify-center text-[#ffffff] mb-6">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-[#ffffff] mb-2">ATS Resume Auditor</h3>
                <p className="text-xs text-[#888888] leading-relaxed">
                  Benchmark your resume against Harvard formatting and role-specific keywords. Identifies skill gaps and dynamically binds them to your roadmap.
                </p>
              </div>
              <div className="pt-6 border-t border-[#1a1a1a] mt-6 text-[11px] font-mono text-[#666666]">
                03 / RESUME BENCHMARKS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Sided Ecosystem Breakdown */}
      <section id="ecosystem" className="py-24 border-b border-[#1a1a1a] bg-[#050505]">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24">
          <div className="mb-16">
            <span className="text-xs font-mono text-[#666666] uppercase tracking-wider block mb-2">The Closed Loop</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#ffffff] tracking-tight">
              One unified network for every stakeholder.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Persona */}
            <div className="border border-[#1a1a1a] bg-[#000000] p-8 rounded-md space-y-4">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border border-[#242424] text-[#b5b5b5]">
                For Students
              </span>
              <h3 className="text-lg font-bold text-[#ffffff]">Accelerate Placement Readiness</h3>
              <p className="text-xs text-[#888888] leading-relaxed">
                Connect daily coding problem solves, weekly targets, voice mock drills, and resume audits into a verifiable readiness dossier.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#b5b5b5]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff]" />
                  <span>Personalized Weekly Roadmap Targets</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff]" />
                  <span>Live STAR Voice Mock Screeners</span>
                </li>
              </ul>
            </div>

            {/* Recruiter Persona */}
            <div id="recruiters" className="border border-[#1a1a1a] bg-[#000000] p-8 rounded-md space-y-4">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border border-[#242424] text-[#b5b5b5]">
                For Tech Recruiters
              </span>
              <h3 className="text-lg font-bold text-[#ffffff]">Hire Verified Proof-of-Work</h3>
              <p className="text-xs text-[#888888] leading-relaxed">
                Bypass thousands of unvetted resumes. Filter top tier engineering talent by verified solve counts, voice mock cadence, and ATS strength.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#b5b5b5]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff]" />
                  <span>Pre-Vetted Candidate Discovery</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff]" />
                  <span>Direct Outreach & Pipeline Tracking</span>
                </li>
              </ul>
            </div>

            {/* University TPO Persona */}
            <div id="universities" className="border border-[#1a1a1a] bg-[#000000] p-8 rounded-md space-y-4">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded border border-[#242424] text-[#b5b5b5]">
                For University TPOs
              </span>
              <h3 className="text-lg font-bold text-[#ffffff]">Cohort Placement Matrix</h3>
              <p className="text-xs text-[#888888] leading-relaxed">
                Monitor live batch readiness across CSE, IT, AI/DS, and ECE. Schedule visiting company drives and export candidate dossiers in 1 click.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#b5b5b5]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff]" />
                  <span>Departmental Readiness Benchmarks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff]" />
                  <span>1-Click Candidate CSV Dossier Export</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-24 border-b border-[#1a1a1a]">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24 text-center max-w-4xl mx-auto">
          <h2 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#ffffff] tracking-tight mb-6">
            Start your mile today.
          </h2>
          <p className="text-sm sm:text-base text-[#888888] mb-8 leading-relaxed max-w-xl mx-auto">
            Experience the unified career ecosystem built for ambitious engineering students, pre-vetted recruiters, and modern institutions.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="btn-primary py-3.5 px-8 text-xs font-semibold"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="btn-secondary py-3.5 px-8 text-xs font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#000000]">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-24 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-[#666666]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#ffffff]">FIRST MILE</span>
            <span>— Where careers begin.</span>
          </div>
          <div>
            © {new Date().getFullYear()} First Mile • Career & Placement Ecosystem
          </div>
        </div>
      </footer>
    </div>
  );
}
