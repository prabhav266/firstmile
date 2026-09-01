'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Code, Cpu, Layers, Star, ArrowUpRight } from 'lucide-react';
import { sounds } from '@/lib/sounds';

const PROJECTS = [
  {
    title: 'Real-Time Vector RAG Search Engine',
    desc: 'Production-grade Retrieval-Augmented Generation pipeline parsing documentation PDFs into FAISS vector embeddings for semantic search retrieval.',
    difficulty: 'HARD',
    tech: ['Python', 'FastAPI', 'FAISS', 'LangChain', 'Docker', 'PostgreSQL'],
    arch: 'Event-Driven Microservices',
    impact: 95,
    color: '#8b5cf6'
  },
  {
    title: 'Distributed Rate-Limiting API Gateway',
    desc: 'High-throughput custom API gateway enforcing token bucket and sliding window algorithms for 50,000+ concurrent requests.',
    difficulty: 'HARD',
    tech: ['Node.js', 'TypeScript', 'Redis', 'Docker', 'Nginx', 'Prometheus'],
    arch: 'Reverse Proxy & Middleware Layer',
    impact: 94,
    color: '#3b82f6'
  },
  {
    title: 'Multi-User Collaborative Code IDE',
    desc: 'Interactive online workspace supporting synchronized cursor tracking, CRDT state resolution, and dynamic WebSockets state broadcasts.',
    difficulty: 'HARD',
    tech: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'WebSockets', 'Redis', 'Yjs'],
    arch: 'Client-Server Real-Time Broadcast',
    impact: 92,
    color: '#10b981'
  }
];

export function ProjectBlueprintsSection() {
  const handleHover = () => {
    sounds.playTick();
  };

  return (
    <section className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-[rgba(255,255,255,0.06)] pb-8">
        <div className="space-y-2">
          <span className="text-xs font-mono text-[#3b82f6] uppercase tracking-widest block font-bold">06 — HIGH-IMPACT BLUEPRINTS</span>
          <h2 className="text-3xl md:text-5xl font-black text-[#fafafa] tracking-tight uppercase">Recommended Projects</h2>
        </div>
        <p className="text-xs text-[#a1a1aa] max-w-md leading-relaxed">
          Bridge your exact skill gaps with production-grade system architecture projects rated for recruiter impact.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PROJECTS.map((proj, idx) => (
          <motion.div
            key={proj.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            onMouseEnter={handleHover}
            className="bg-[#18181b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl p-6 flex flex-col justify-between hover:border-[#8b5cf6]/50 transition-all group shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-[#8b5cf6]/10 border border-[#8b5cf6]/40 text-[#8b5cf6] rounded-full text-[10px] font-mono font-bold uppercase">
                  {proj.difficulty}
                </span>
                <span className="text-xs font-mono text-[#10b981] font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#10b981]" />
                  <span>{proj.impact}% Resume Impact</span>
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#fafafa] uppercase group-hover:text-[#3b82f6] transition-colors leading-snug">{proj.title}</h3>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">{proj.desc}</p>

              <div className="space-y-2 pt-2 border-t border-[rgba(255,255,255,0.04)]">
                <span className="text-[10px] font-mono text-[#a1a1aa] uppercase block">Architecture Pattern:</span>
                <span className="text-xs font-mono text-[#fafafa] font-bold block">{proj.arch}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {proj.tech.map((t, i) => (
                  <span key={i} className="px-2.5 py-1 bg-[#09090b] border border-[rgba(255,255,255,0.06)] text-[10px] font-mono text-[#a1a1aa] rounded-md">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs font-mono font-bold uppercase text-[#8b5cf6] group-hover:text-white transition-colors">
              <span>Inspect Architecture</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default ProjectBlueprintsSection;
