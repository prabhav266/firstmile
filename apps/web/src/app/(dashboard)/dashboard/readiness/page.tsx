'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Code2,
  FolderGit2,
  Cpu,
  MessageSquare,
  FileText,
  Flame,
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ReadinessDimension {
  name: string;
  key: 'dsa' | 'engineering' | 'cs' | 'communication' | 'resume' | 'consistency';
  score: number;
  weight: number;
  benchmark: number;
  status: 'OPTIMAL' | 'ON_TRACK' | 'NEEDS_FOCUS';
  proofSummary: string;
}

interface MultiDimensionalReadiness {
  overallScore: number;
  targetTier: string;
  targetRole: string;
  tierBenchmark: number;
  tierStatus: string;
  percentile: number;
  dimensions: ReadinessDimension[];
  diagnosticExplanation: string;
  strengths: string[];
  gaps: string[];
  prioritizedOpportunities: Array<{
    title: string;
    topic: string;
    action: string;
    expectedImpact: string;
  }>;
  recentTrend: Array<{
    date: string;
    score: number;
  }>;
}

const DIMENSION_ICONS: Record<string, LucideIcon> = {
  dsa: Code2,
  engineering: FolderGit2,
  cs: Cpu,
  communication: MessageSquare,
  resume: FileText,
  consistency: Flame,
};

const TIERS = [
  { id: 'TIER_1', label: 'FAANG / Tier-1', benchmark: 84, desc: 'Heavy DSA & Systems rigor' },
  { id: 'STARTUP', label: 'High-Growth Startup', benchmark: 76, desc: 'High emphasis on live deployed code' },
  { id: 'PRODUCT', label: 'Product Engineering', benchmark: 80, desc: 'Balanced full-lifecycle engineering' },
  { id: 'SERVICE', label: 'Enterprise Consulting', benchmark: 70, desc: 'Communication & core problem solving' },
];

const ROLES = [
  { id: 'FULL_STACK', label: 'Full Stack' },
  { id: 'BACKEND', label: 'Backend' },
  { id: 'FRONTEND', label: 'Frontend' },
  { id: 'AI_ML', label: 'AI / ML' },
];

export default function PlacementReadinessPage() {
  const [selectedTier, setSelectedTier] = useState<string>('TIER_1');
  const [selectedRole, setSelectedRole] = useState<string>('FULL_STACK');

  const { data: readinessRes, isLoading } = useQuery({
    queryKey: ['multiDimensionalReadiness', selectedTier, selectedRole],
    queryFn: () =>
      api
        .get('/api/readiness/score', {
          params: { targetTier: selectedTier, targetRole: selectedRole },
        })
        .then((res) => res.data?.data as MultiDimensionalReadiness),
  });

  const data = readinessRes;

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-44 bg-[#080808] border border-[#1a1a1a] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-[#080808] border border-[#1a1a1a] rounded-xl animate-pulse" />
          <div className="h-32 bg-[#080808] border border-[#1a1a1a] rounded-xl animate-pulse" />
          <div className="h-32 bg-[#080808] border border-[#1a1a1a] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const score = data.overallScore;
  const benchmark = data.tierBenchmark;
  const gapDiff = score - benchmark;

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Target Selector */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider uppercase border border-[#2a2a2a] bg-[#111111] text-[#a1a1aa] flex items-center gap-1.5">
                <Target className="w-3 h-3 text-[#38bdf8]" />
                Target-Specific Telemetry
              </span>
              <span className="text-[11px] font-mono uppercase text-[#71717a]">
                Multi-Dimensional Model
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4f4f5]">
              Placement Readiness Index
            </h1>
            <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
              Readiness is never a generic number. We project your demonstrated proof against target employer benchmarks, re-weighting DSA, project codebases, and systems rigor to match hiring standards.
            </p>

            {/* Target Selectors */}
            <div className="pt-3 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] mr-1">
                  Employer Tier:
                </span>
                {TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                      selectedTier === tier.id
                        ? 'bg-[#ffffff] text-[#000000] font-bold shadow-sm'
                        : 'bg-[#111111] text-[#a1a1aa] hover:text-[#ffffff] border border-[#222222]'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] mr-1">
                  Target Role:
                </span>
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-all ${
                      selectedRole === role.id
                        ? 'bg-[#27272a] text-[#ffffff] font-semibold border border-[#3f3f46]'
                        : 'bg-[#000000] text-[#71717a] hover:text-[#d4d4d8] border border-[#1a1a1a]'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Composite Gauge Card */}
          <div className="bg-[#000000]/80 border border-[#222222] p-5 sm:p-6 rounded-xl min-w-[240px] space-y-3 text-center sm:text-left self-stretch sm:self-auto flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                Projected Readiness
              </span>
              <div className="flex items-baseline justify-center sm:justify-start gap-1">
                <span className="text-5xl font-black font-mono text-[#f4f4f5]">
                  {score}
                </span>
                <span className="text-xs font-mono text-[#52525b]">/ 100</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-mono">
                {gapDiff >= 0 ? (
                  <span className="text-[#10b981] font-bold">+{gapDiff} pts over target</span>
                ) : (
                  <span className="text-[#f59e0b] font-bold">{gapDiff} pts to benchmark ({benchmark})</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#1a1a1a] space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[#71717a]">Tier Status</span>
                <span className="text-[#f4f4f5] font-semibold">{data.tierStatus}</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-[#71717a]">Percentile</span>
                <span className="text-[#10b981] font-semibold">Top {100 - data.percentile}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explainability Diagnostic Banner */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#38bdf8] font-bold tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Deterministic Readiness Explanation</span>
        </div>
        <p className="text-xs sm:text-sm text-[#d4d4d8] leading-relaxed font-sans">
          {data.diagnosticExplanation}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#141414]">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#10b981] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Core Demonstrated Strengths
            </span>
            <ul className="text-xs text-[#a1a1aa] space-y-1 list-disc pl-4">
              {data.strengths.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#f59e0b] font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Critical Leverage Gaps
            </span>
            <ul className="text-xs text-[#a1a1aa] space-y-1 list-disc pl-4">
              {data.gaps.map((g, idx) => (
                <li key={idx}>{g}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* The 6 Core Dimensions Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#f4f4f5]">6-Dimensional Evaluation Matrix</h2>
            <p className="text-xs text-[#71717a]">
              Calibrated weights dynamically adjust based on your selected target employer.
            </p>
          </div>
          <span className="text-xs font-mono text-[#71717a] hidden sm:block">
            Benchmark: {benchmark}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.dimensions.map((dim) => {
            const Icon = DIMENSION_ICONS[dim.key] || Target;
            const isOptimal = dim.status === 'OPTIMAL';
            const isOnTrack = dim.status === 'ON_TRACK';

            return (
              <div
                key={dim.key}
                className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-5 space-y-3 hover:border-[#2a2a2a] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center text-[#f4f4f5]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[#f4f4f5]">{dim.name}</h3>
                      <span className="text-[10px] font-mono text-[#71717a]">
                        Weight: {dim.weight}% of target score
                      </span>
                    </div>
                  </div>

                  {isOptimal ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#064e3b]/30 border border-[#059669]/40 text-[#34d399]">
                      Optimal
                    </span>
                  ) : isOnTrack ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#78350f]/30 border border-[#d97706]/40 text-[#fbbf24]">
                      On Track
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#450a0a]/30 border border-[#dc2626]/40 text-[#f87171]">
                      Needs Focus
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold font-mono text-[#f4f4f5]">
                      {dim.score}
                    </span>
                    <span className="text-xs font-mono text-[#52525b]">/ 100</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#71717a]">
                    Target: {dim.benchmark}%
                  </span>
                </div>

                {/* Progress Bar with Benchmark Marker */}
                <div className="relative w-full bg-[#141414] h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOptimal
                        ? 'bg-[#10b981]'
                        : isOnTrack
                        ? 'bg-[#f59e0b]'
                        : 'bg-[#ef4444]'
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>

                <p className="text-[11px] font-mono text-[#71717a] line-clamp-2 pt-1">
                  {dim.proofSummary}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prioritized Action Opportunities */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#f59e0b]" />
            <h2 className="text-sm font-bold text-[#f4f4f5] uppercase tracking-wider">
              Prioritized Action Opportunities
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#71717a]">
            Fastest path to {benchmark}% benchmark
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {data.prioritizedOpportunities.map((opp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-[#000000] border border-[#1a1a1a] space-y-2 text-xs flex flex-col justify-between hover:border-[#2a2a2a] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#38bdf8] font-bold">
                    {opp.topic}
                  </span>
                  <span className="text-[10px] font-mono text-[#10b981] font-bold">
                    {opp.expectedImpact}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#f4f4f5]">{opp.title}</h4>
                <p className="text-[#a1a1aa] leading-relaxed">{opp.action}</p>
              </div>

              <div className="pt-2 border-t border-[#141414] flex items-center justify-end">
                <span className="text-[11px] font-mono text-[#71717a] flex items-center gap-1 hover:text-[#ffffff] cursor-pointer">
                  <span>Start action</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Telemetry Sparkline */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#10b981]" />
            <h3 className="text-sm font-semibold text-[#f4f4f5]">
              Readiness Progression Curve
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#71717a]">
            Historical telemetry snapshots
          </span>
        </div>

        <div className="flex items-end gap-2 h-24 pt-4 border-b border-[#1a1a1a]">
          {data.recentTrend.map((t, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <span className="text-[9px] font-mono text-[#71717a] opacity-0 group-hover:opacity-100 transition-opacity">
                {t.score}%
              </span>
              <div
                className="w-full bg-[#27272a] group-hover:bg-[#10b981] rounded-t transition-all"
                style={{ height: `${Math.max(15, t.score)}%` }}
              />
              <span className="text-[8px] font-mono text-[#52525b] truncate max-w-[40px]">
                {t.date}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] font-mono text-[#71717a] text-right">
          Every coding problem solved, project deployment, and mock interview logs a permanent verification milestone.
        </p>
      </div>
    </div>
  );
}
