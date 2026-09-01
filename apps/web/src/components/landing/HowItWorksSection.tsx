'use client';

import React from 'react';
import { motion } from 'motion/react';
import { FileText, Compass, Activity, Award } from 'lucide-react';
import { sounds } from '@/lib/sounds';

const STEPS = [
  {
    phase: '01',
    title: 'Diagnostic ATS Audit',
    desc: 'Upload your current resume. Our NLP parsing engine extracts technical keywords, flags passive bullet points, and calculates your baseline ATS score.',
    icon: FileText,
    color: '#3b82f6'
  },
  {
    phase: '02',
    title: 'Adaptive Path Mapping',
    desc: 'Input your dream target company and LPA package. The system generates customized daily, weekly, and monthly milestones tailored to your current college year.',
    icon: Compass,
    color: '#8b5cf6'
  },
  {
    phase: '03',
    title: 'Practice & Consistency Logs',
    desc: 'Log problem-solving across LeetCode, Codeforces, and ML courses. Watch your contribution heatmap light up and maintain consistency streaks.',
    icon: Activity,
    color: '#10b981'
  },
  {
    phase: '04',
    title: 'Placement Readiness Index',
    desc: 'Simulate technical phone rounds with our AI Mock Interviewer and watch your single consolidated Placement Readiness Index cross the hiring benchmark.',
    icon: Award,
    color: '#f59e0b'
  }
];

export function HowItWorksSection() {
  const handleHover = () => {
    sounds.playTick();
  };

  return (
    <section id="how-it-works" className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6 border-b border-[rgba(255,255,255,0.06)] pb-8">
        <div className="space-y-2">
          <span className="text-xs font-mono text-[#8b5cf6] uppercase tracking-widest block font-bold">02 — ARCHITECTURE WORKFLOW</span>
          <h2 className="text-3xl md:text-5xl font-black text-[#fafafa] tracking-tight uppercase">How PathForge Works</h2>
        </div>
        <p className="text-xs text-[#a1a1aa] max-w-md leading-relaxed">
          From initial resume diagnostic to placement-ready execution in 4 systematic steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.phase}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onMouseEnter={handleHover}
              className="bg-[#18181b]/60 backdrop-blur-md border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 flex flex-col justify-between hover:border-[rgba(255,255,255,0.2)] transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-2xl font-mono font-black text-[#a1a1aa]/40 group-hover:text-[#8b5cf6] transition-colors">{step.phase}</span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all"
                    style={{ backgroundColor: `${step.color}15`, borderColor: `${step.color}40`, color: step.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-[#fafafa] mb-3 group-hover:text-[#3b82f6] transition-colors">{step.title}</h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">{step.desc}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-[rgba(255,255,255,0.04)] text-[10px] font-mono text-[#a1a1aa] uppercase tracking-widest flex items-center justify-between">
                <span>Phase {step.phase}</span>
                <span className="group-hover:translate-x-1 transition-transform text-[#fafafa]">Execute →</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default HowItWorksSection;
