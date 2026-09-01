'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Target, CheckCircle, ShieldCheck } from 'lucide-react';
import { sounds } from '@/lib/sounds';

const DESTINATIONS = [
  { company: 'FAANG & Big Tech', lpa: '24 - 45 LPA', req: '150+ Solved, Graph Algorithms, System Design Sharding', tag: 'High Competition' },
  { company: 'Unicorn AI Startups', lpa: '18 - 30 LPA', req: 'FastAPI, Docker, Microservices, RAG Vector Search', tag: 'High Growth' },
  { company: 'Quant & High-Frequency Trading', lpa: '35 - 60 LPA', req: 'Low-latency C++, Modern Memory Management, Math', tag: 'Elite Tech' },
  { company: 'Cloud Infrastructure & SaaS', lpa: '16 - 28 LPA', req: 'Kubernetes, Redis Caching, Prometheus, CI/CD', tag: 'High Demand' }
];

export function CareerDestinationsSection() {
  const handleHover = () => {
    sounds.playTick();
  };

  return (
    <section className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 border-b border-[rgba(255,255,255,0.06)] pb-8">
        <div className="space-y-2">
          <span className="text-xs font-mono text-[#8b5cf6] uppercase tracking-widest block font-bold">07 — TARGET DESTINATIONS</span>
          <h2 className="text-3xl md:text-5xl font-black text-[#fafafa] tracking-tight uppercase">Career Destinations</h2>
        </div>
        <p className="text-xs text-[#a1a1aa] max-w-md leading-relaxed">
          Benchmark your skills against exact technical requirements of top-tier hiring markets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DESTINATIONS.map((dest, idx) => (
          <motion.div
            key={dest.company}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            onMouseEnter={handleHover}
            className="bg-[#18181b]/60 backdrop-blur-xl border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 flex flex-col justify-between hover:border-[#3b82f6]/40 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#8b5cf6] font-bold uppercase">{dest.tag}</span>
                <span className="text-sm font-mono text-[#10b981] font-bold">{dest.lpa}</span>
              </div>
              <h3 className="text-xl font-bold text-[#fafafa] uppercase group-hover:text-[#3b82f6] transition-colors">{dest.company}</h3>
              <p className="text-xs text-[#a1a1aa] flex items-start gap-2 pt-2 border-t border-[rgba(255,255,255,0.04)]">
                <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                <span><strong className="text-white font-semibold">Benchmark:</strong> {dest.req}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default CareerDestinationsSection;
