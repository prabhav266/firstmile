'use client';

import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, CheckCircle2, AlertCircle } from 'lucide-react';
import { sounds } from '@/lib/sounds';

const SKILL_DOMAINS = [
  { domain: 'Data Structures & Algorithms', current: 78, target: 92, status: 'On Track' },
  { domain: 'System Design & Architecture', current: 42, target: 85, status: 'Critical Gap' },
  { domain: 'Fullstack Microservices (React/Node)', current: 84, target: 80, status: 'Mastered' },
  { domain: 'DevOps & Docker Deployment', current: 35, target: 75, status: 'Critical Gap' },
  { domain: 'Database Performance Tuning & SQL', current: 65, target: 85, status: 'Moderate Gap' }
];

export function SkillGapSection() {
  const handleHover = () => {
    sounds.playTick();
  };

  return (
    <section className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <span className="text-xs font-mono text-[#10b981] uppercase tracking-widest block font-bold">05 — COMPETENCY MATRIX</span>
          <h2 className="text-3xl md:text-5xl font-black text-[#fafafa] tracking-tight uppercase leading-tight">
            Skill Gap Precision Matrix
          </h2>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">
            PathForge AI compares your current verified coding logs, project complexity, and resume content against real tier-1 hiring benchmarks to pinpoint exact technical skill gaps.
          </p>
          <div className="p-4 bg-[#18181b] border border-[rgba(255,255,255,0.06)] rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981] shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white uppercase block">Automated Skill Diagnosis</span>
              <span className="text-[10px] text-[#a1a1aa] font-mono">Updates dynamically with every LeetCode submission & project commit.</span>
            </div>
          </div>
        </div>

        {/* Right Bars Matrix Column */}
        <div className="lg:col-span-7 bg-[#18181b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl p-8 space-y-6 shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-4">
            <span className="text-xs font-mono text-[#a1a1aa] uppercase font-bold">Domain Skill Target vs Current</span>
            <span className="text-xs font-mono text-[#8b5cf6] font-bold">Role: Senior Software Engineer</span>
          </div>

          <div className="space-y-6">
            {SKILL_DOMAINS.map((item, idx) => (
              <motion.div
                key={item.domain}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                onMouseEnter={handleHover}
                className="space-y-2 group cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#fafafa] group-hover:text-[#3b82f6] transition-colors">{item.domain}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-[#a1a1aa]">Current: <strong className="text-white">{item.current}%</strong></span>
                    <span className="text-[#8b5cf6]">Target: <strong className="text-white">{item.target}%</strong></span>
                  </div>
                </div>

                <div className="relative w-full h-3 bg-[#09090b] rounded-full overflow-hidden border border-[rgba(255,255,255,0.04)]">
                  {/* Current Score Bar */}
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] rounded-full transition-all duration-700"
                    style={{ width: `${item.current}%` }}
                  />
                  {/* Target Marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-[#10b981] shadow-[0_0_8px_#10b981]"
                    style={{ left: `${item.target}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

export default SkillGapSection;
