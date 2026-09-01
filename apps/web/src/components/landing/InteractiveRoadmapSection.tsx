'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, CheckCircle2, ChevronRight, Target, Zap, Award } from 'lucide-react';
import { sounds } from '@/lib/sounds';

const ROADMAP_COMPANIES = [
  {
    id: 'microsoft',
    name: 'Microsoft',
    lpa: '18 - 24 LPA',
    color: '#3b82f6',
    phases: [
      { month: 'Month 1', topic: 'Arrays, Strings, Two Pointers & Hashing', count: '45 Problems Solved' },
      { month: 'Month 2', topic: 'Trees, Graphs BFS/DFS, & Dynamic Programming', count: '60 Problems Solved' },
      { month: 'Month 3', topic: 'System Design Fundamentals & Database Sharding', count: 'Architecture Ready' },
      { month: 'Month 4', topic: 'Full Mock OA Assessments & HR STAR Prep', count: 'Interview Ready' }
    ]
  },
  {
    id: 'google',
    name: 'Google SDE',
    lpa: '25 - 35 LPA',
    color: '#8b5cf6',
    phases: [
      { month: 'Month 1', topic: 'Advanced Graph Algorithms & Disjoint Set Union', count: '50 Hard Problems' },
      { month: 'Month 2', topic: 'Segment Trees, Trie Data Structures, & DP', count: '70 Hard Problems' },
      { month: 'Month 3', topic: 'Distributed Systems & Scalable Storage Systems', count: 'System Design Mastered' },
      { month: 'Month 4', topic: 'Google Specific OA Contests & AI Mock Phone Screen', count: 'Tier-1 Candidate' }
    ]
  },
  {
    id: 'startup',
    name: 'Unicorn AI Startup',
    lpa: '16 - 22 LPA',
    color: '#10b981',
    phases: [
      { month: 'Month 1', topic: 'FastAPI Microservices & Async WebSockets', count: 'Fullstack Foundation' },
      { month: 'Month 2', topic: 'Redis Rate Limiting & Docker CI/CD Pipeline', count: 'Containerized Deployment' },
      { month: 'Month 3', topic: 'Vector Databases (FAISS) & RAG LLM Pipelines', count: 'AI Engine Production' },
      { month: 'Month 4', topic: 'Live Product Demo Launch & Tech Screener', count: 'Founding Engineer Ready' }
    ]
  }
];

export function InteractiveRoadmapSection() {
  const [selectedCompany, setSelectedCompany] = useState('microsoft');

  const activeRoadmap = ROADMAP_COMPANIES.find(c => c.id === selectedCompany) || ROADMAP_COMPANIES[0];

  const handleSelect = (id: string) => {
    setSelectedCompany(id);
    sounds.playTick();
  };

  return (
    <section id="roadmap" className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-[rgba(255,255,255,0.06)] pb-8">
        <div className="space-y-2">
          <span className="text-xs font-mono text-[#8b5cf6] uppercase tracking-widest block font-bold">04 — ADAPTIVE PATH ENGINE</span>
          <h2 className="text-3xl md:text-5xl font-black text-[#fafafa] tracking-tight uppercase">Interactive Career Roadmap</h2>
        </div>
        <p className="text-xs text-[#a1a1aa] max-w-md leading-relaxed">
          Select your target hiring destination to dynamically generate customized preparation phases.
        </p>
      </div>

      {/* Target Selector Buttons */}
      <div className="flex flex-wrap gap-4 mb-12">
        {ROADMAP_COMPANIES.map((company) => (
          <button
            key={company.id}
            onClick={() => handleSelect(company.id)}
            className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-3 border ${
              selectedCompany === company.id
                ? 'bg-[#18181b] border-[#8b5cf6] text-[#fafafa] shadow-[0_0_24px_rgba(139,92,246,0.3)] scale-[1.02]'
                : 'bg-[#09090b] border-[rgba(255,255,255,0.06)] text-[#a1a1aa] hover:border-[rgba(255,255,255,0.15)] hover:text-white'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: company.color }} />
            <span>{company.name}</span>
            <span className="text-[10px] font-mono text-[#a1a1aa]">({company.lpa})</span>
          </button>
        ))}
      </div>

      {/* Roadmap Timeline Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCompany}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
          className="relative bg-[#18181b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl p-8 md:p-12 overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {activeRoadmap.phases.map((phase, idx) => (
              <div key={idx} className="relative space-y-4 group">
                
                {/* Connecting glowing timeline line */}
                {idx < activeRoadmap.phases.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-1/2 right-[-50%] h-[2px] bg-gradient-to-r from-[#3b82f6] to-[rgba(255,255,255,0.06)] z-0" />
                )}

                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#09090b] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-xs font-mono font-bold text-[#fafafa] group-hover:border-[#8b5cf6] transition-colors shadow-lg">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-mono text-[#8b5cf6] uppercase tracking-widest font-bold">{phase.month}</span>
                </div>

                <div className="bg-[#09090b] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 space-y-3 group-hover:border-[rgba(255,255,255,0.15)] transition-all">
                  <h4 className="text-sm font-bold text-[#fafafa] uppercase leading-snug">{phase.topic}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#10b981]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{phase.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#a1a1aa]">
              <Target className="w-4 h-4 text-[#3b82f6]" />
              <span>Target LPA Package: <strong className="text-white font-bold">{activeRoadmap.lpa}</strong></span>
            </div>
            <a
              href="/register"
              className="text-xs font-bold uppercase tracking-wider text-[#8b5cf6] hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Generate My Personal Roadmap</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

export default InteractiveRoadmapSection;
