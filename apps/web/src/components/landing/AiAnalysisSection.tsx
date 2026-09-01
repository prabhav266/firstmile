'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, CheckCircle2, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export function AiAnalysisSection() {
  const [activeTab, setActiveTab] = useState<'ats' | 'bullets' | 'gaps'>('ats');

  const handleTabChange = (tab: 'ats' | 'bullets' | 'gaps') => {
    setActiveTab(tab);
    sounds.playTick();
  };

  return (
    <section id="analysis" className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto z-10">
      <div className="bg-[#18181b]/70 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
        
        {/* Subtle Cybernetic Background Glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Description Column */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono text-[#3b82f6] uppercase tracking-widest block font-bold">03 — AI RESUME & SKILL AUDITOR</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#fafafa] tracking-tight uppercase leading-tight">
              Real-Time ATS Diagnostic Engine
            </h2>
            <p className="text-xs text-[#a1a1aa] leading-relaxed">
              Don&apos;t leave your resume to chance. PathForge AI parses bullet points, detects passive phrasing, and highlights missing high-value technical keywords for target engineering positions.
            </p>

            {/* Interactive Tabs */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleTabChange('ats')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'ats' ? 'bg-[#3b82f6] text-white shadow-[0_0_16px_rgba(59,130,246,0.4)]' : 'bg-[#09090b] text-[#a1a1aa] hover:text-white'
                }`}
              >
                ATS Score
              </button>
              <button
                onClick={() => handleTabChange('bullets')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'bullets' ? 'bg-[#8b5cf6] text-white shadow-[0_0_16px_rgba(139,92,246,0.4)]' : 'bg-[#09090b] text-[#a1a1aa] hover:text-white'
                }`}
              >
                Weak Bullets
              </button>
              <button
                onClick={() => handleTabChange('gaps')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'gaps' ? 'bg-[#10b981] text-white shadow-[0_0_16px_rgba(16,185,129,0.4)]' : 'bg-[#09090b] text-[#a1a1aa] hover:text-white'
                }`}
              >
                Missing Skills
              </button>
            </div>
          </div>

          {/* Right Simulated Live Analysis Card Column */}
          <div className="lg:col-span-7 bg-[#09090b] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 md:p-8 space-y-6">
            
            {/* ATS Score View */}
            {activeTab === 'ats' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.04)] pb-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#a1a1aa] uppercase block">Candidate Resume Metric</span>
                    <h3 className="text-lg font-bold text-[#fafafa] uppercase">Fullstack SDE Profile</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-mono font-bold text-[#10b981]">88.5%</span>
                    <span className="text-[10px] font-mono text-[#a1a1aa] block uppercase">ATS Score</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
                    <span>Technical Keywords Coverage</span>
                    <span className="font-mono text-[#fafafa]">92%</span>
                  </div>
                  <div className="w-full h-2 bg-[#18181b] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10b981] w-[92%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#a1a1aa] pt-2">
                    <span>Quantifiable Achievements & Metrics</span>
                    <span className="font-mono text-[#fafafa]">85%</span>
                  </div>
                  <div className="w-full h-2 bg-[#18181b] rounded-full overflow-hidden">
                    <div className="h-full bg-[#3b82f6] w-[85%]" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Weak Bullets View */}
            {activeTab === 'bullets' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-xs font-mono text-[#f59e0b] uppercase tracking-wider font-bold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>2 Passive Bullet Points Flagged</span>
                </div>

                <div className="p-4 bg-[#18181b] border border-[#f59e0b]/30 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-[#ef4444] uppercase block font-bold">Weak Bullet:</span>
                  <p className="text-xs text-[#a1a1aa] line-through">&ldquo;Assisted in backend development and helped build database tables.&rdquo;</p>
                  <span className="text-[10px] font-mono text-[#10b981] uppercase block font-bold pt-1">AI ATS Rewrite Suggestion:</span>
                  <p className="text-xs text-[#fafafa] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6] shrink-0" />
                    <span>&ldquo;Engineered event-driven PostgreSQL microservices, scaling query throughput by 35%.&rdquo;</span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Missing Skills View */}
            {activeTab === 'gaps' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <span className="text-xs font-mono text-[#a1a1aa] uppercase tracking-wider block font-bold">Detected Missing Skills for Google SDE Role:</span>
                <div className="flex flex-wrap gap-2">
                  {['System Design', 'Redis Caching', 'Docker', 'gRPC', 'Kubernetes', 'CI/CD Pipeline'].map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-[#8b5cf6]/10 border border-[#8b5cf6]/40 text-[#8b5cf6] rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
                <p className="text-[10px] font-mono text-[#a1a1aa] pt-2">
                  Adding these 6 domain keywords to your resume increases ATS invitation match rates by +42%.
                </p>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}

export default AiAnalysisSection;
