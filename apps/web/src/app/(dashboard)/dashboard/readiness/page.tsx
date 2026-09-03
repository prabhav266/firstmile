'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Code,
  FileText,
  MessageSquare,
  Briefcase,
  Brain,
  Check,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface SubScore {
  name: string;
  score: number;
  icon: LucideIcon;
  weight: string;
}

export default function PlacementReadinessPage() {
  const { data: readinessData, isLoading } = useQuery({
    queryKey: ['readinessScore'],
    queryFn: () => api.get('/api/readiness').then((res) => res.data?.data || {}),
  });

  const overallScore = readinessData?.overallScore || 74;
  const codingScore = readinessData?.codingScore || 82;
  const resumeScore = readinessData?.resumeScore || 78;
  const mockScore = readinessData?.mockScore || 70;
  const projectScore = readinessData?.projectScore || 68;

  const subScores: SubScore[] = [
    { name: 'Coding & DSA Rigor', score: codingScore, icon: Code, weight: '35%' },
    { name: 'ATS Resume Compliance', score: resumeScore, icon: FileText, weight: '25%' },
    { name: 'AI Voice Screener STAR Cadence', score: mockScore, icon: MessageSquare, weight: '25%' },
    { name: 'Verified Portfolio Projects', score: projectScore, icon: Briefcase, weight: '15%' },
  ];

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl">
      {/* Header */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block mb-1">
            Predictive Telemetry
          </span>
          <h1 className="font-display font-bold text-2xl text-[#ffffff] tracking-tight">
            Placement Readiness Index
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-0.5">
            Weighted placement probability synthesized across 4 ungameable technical proof-of-work vectors
          </p>
        </div>
      </div>

      {/* Main Index Score Card */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">Composite Readiness Index</span>
          <div className="text-6xl sm:text-7xl font-black font-display text-[#ffffff] tracking-tight">
            {overallScore}<span className="text-2xl text-[#666666]">/100</span>
          </div>
          <p className="text-xs font-mono text-[#888888] max-w-md">
            Candidate profile ranks in the <span className="text-[#ffffff] font-bold">Top 8%</span> for Tier-1 Product Engineering hiring pipelines.
          </p>
        </div>

        <div className="bg-[#000000] border border-[#1e1e1e] p-5 rounded-lg space-y-2 font-mono text-xs w-full md:w-72">
          <div className="flex justify-between items-center text-[10px] text-[#666666] uppercase">
            <span>Tier Status</span>
            <span className="text-[#ffffff] font-bold">Interview Ready</span>
          </div>
          <div className="w-full bg-[#141414] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#ffffff] h-full" style={{ width: `${overallScore}%` }} />
          </div>
          <span className="text-[10px] text-[#888888] block pt-1">
            Recruiters prioritize candidates with index &gt; 70.
          </span>
        </div>
      </div>

      {/* 4 Pillars Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subScores.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-[#111111] border border-[#242424] flex items-center justify-center text-[#ffffff]">
                    <Icon size={14} />
                  </div>
                  <span className="font-bold text-[#ffffff]">{item.name}</span>
                </div>
                <span className="text-[10px] text-[#666666]">Weight {item.weight}</span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-2xl font-bold font-display text-[#ffffff]">{item.score}%</span>
                <span className="text-[10px] text-[#888888]">{item.score >= 75 ? 'Optimal' : 'Needs Practice'}</span>
              </div>

              <div className="w-full bg-[#121212] rounded-full h-1 overflow-hidden">
                <div className="bg-[#ffffff] h-full" style={{ width: `${item.score}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
