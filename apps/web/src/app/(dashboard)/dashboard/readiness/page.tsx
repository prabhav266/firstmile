'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Code,
  Monitor,
  Brain,
  Briefcase,
  FileText,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// ─── Types ──────────────────────────────────────────────────────────────────
interface SubScore {
  name: string;
  score: number;
  icon: LucideIcon;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const scoreBg = (s: number): string =>
  s > 75
    ? 'bg-[#22c55e]/10 border-[#22c55e]/20 text-[#22c55e]'
    : s > 50
    ? 'bg-[#f59e0b]/10 border-[#f59e0b]/20 text-[#f59e0b]'
    : 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]';

const urgencyMeta: Record<'HIGH' | 'MEDIUM' | 'LOW', { label: string; cls: string }> = {
  HIGH: { label: 'High Priority', cls: 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20' },
  MEDIUM: { label: 'Medium Priority', cls: 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20' },
  LOW: { label: 'Low Priority', cls: 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20' },
};

// ─── SVG Gauge ───────────────────────────────────────────────────────────────
function GaugeCircle({ score }: { score: number }) {
  const size = 112;
  const strokeWidth = 6;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const roundedScore = Math.round(score);
  const dashOffset = circumference - (circumference * roundedScore) / 100;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      {/* Center label */}
      <div className="relative flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="text-2xl font-bold text-[#F9FAFB] font-sans leading-none"
        >
          {roundedScore}
        </motion.span>
        <span className="text-[10px] text-[#94A3B8] font-semibold mt-0.5 tracking-wider uppercase font-sans">/ 100</span>
      </div>
    </div>
  );
}

// ─── Sub-score Card ───────────────────────────────────────────────────────────
function SubScoreCard({ item, index }: { item: SubScore; index: number }) {
  const Icon = item.icon;
  const badge = scoreBg(item.score);

  const barColor =
    item.score > 75
      ? '#22c55e'
      : item.score > 50
      ? '#f59e0b'
      : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 + 0.1, ease: 'easeOut' }}
      className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-[rgba(255,255,255,0.08)] bg-[#111827]">
            <Icon size={16} className="text-[#cbd5e1]" />
          </div>
          <span className="text-sm font-semibold text-[#f9fafb] font-sans">{item.name}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badge} font-sans`}>
          {item.score}%
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-[#111827] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${item.score}%` }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: index * 0.05 + 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
        />
      </div>
    </motion.div>
  );
}

// ─── AI Suggestion Card ───────────────────────────────────────────────────────
function AiSuggestionCard({ suggestion, index }: { suggestion: string; index: number }) {
  const urgencies: ('HIGH' | 'MEDIUM' | 'LOW')[] = ['HIGH', 'MEDIUM', 'LOW'];
  const urgency = urgencies[index % urgencies.length];
  const meta = urgencyMeta[urgency];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 + 0.2, ease: 'easeOut' }}
      className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 flex flex-col justify-between gap-4 h-full"
    >
      <div className="flex flex-col gap-3">
        {/* Top bar with number and tag */}
        <div className="flex items-center justify-between">
          <div className="w-7 h-7 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-[#8b5cf6]">{index + 1}</span>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border tracking-wide font-sans ${meta.cls}`}>
            {meta.label}
          </span>
        </div>
        {/* Content */}
        <p className="text-sm text-[#cbd5e1] leading-relaxed font-sans mt-1">{suggestion}</p>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReadinessPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const readinessQuery = useQuery({
    queryKey: ['readinessScore'],
    queryFn: () => api.get('/api/readiness'),
  });

  // Handle toast errors
  useEffect(() => {
    if (readinessQuery.error) {
      toast.error('Failed to load placement readiness score');
    }
  }, [readinessQuery.error]);

  const isLoading = readinessQuery.isLoading;

  if (isLoading || !isMounted) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#94a3b8] text-sm font-medium animate-pulse font-sans">Loading placement readiness...</p>
      </div>
    );
  }

  const readinessData = readinessQuery.data?.data?.data;

  const overallScore = readinessData?.overall_score ?? 0;
  const dsaScore = readinessData?.dsa_score ?? 0;
  const devScore = readinessData?.dev_score ?? 0;
  const mlScore = readinessData?.ml_score ?? 0;
  const communicationScore = readinessData?.communication_score ?? 0;
  const projectScore = readinessData?.project_score ?? 0;
  const resumeScore = readinessData?.resume_score ?? 0;

  const subScores: SubScore[] = [
    { name: 'DSA & Algorithms', score: Math.round(dsaScore), icon: Code },
    { name: 'Development', score: Math.round(devScore), icon: Monitor },
    { name: 'Machine Learning', score: Math.round(mlScore), icon: Brain },
    { name: 'Communication', score: Math.round(communicationScore), icon: MessageSquare },
    { name: 'Portfolio Projects', score: Math.round(projectScore), icon: Briefcase },
    { name: 'Resume Quality', score: Math.round(resumeScore), icon: FileText },
  ];

  const strengths: string[] = readinessData?.strengths ?? [];
  const weaknesses: string[] = readinessData?.weaknesses ?? [];
  const suggestions: string[] = readinessData?.suggestions ?? [];

  const avgSubScore = subScores.length > 0 
    ? Math.round(subScores.reduce((sum, s) => sum + s.score, 0) / subScores.length) 
    : 0;

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f9fafb] p-6 lg:p-8 font-sans animate-fadeIn">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-[#f9fafb] tracking-tight font-sans">Placement Readiness Score</h1>
        <p className="text-sm text-[#cbd5e1] mt-1 font-sans">
          AI-analyzed score based on your skills, projects, and activity
        </p>
      </motion.div>

      {/* ── Gauge + Grade ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
        className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 lg:p-8 mb-8 flex flex-col lg:flex-row items-center gap-8"
      >
        {/* Gauge */}
        <div className="flex flex-col items-center gap-4 shrink-0">
          <GaugeCircle score={overallScore} />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-xs text-[#94a3b8] font-sans">Updated just now</span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px h-32 bg-[rgba(255,255,255,0.08)]" />

        {/* Right side info */}
        <div className="flex-1 flex flex-col gap-5 w-full">
          <div>
            <h2 className="text-xl font-bold text-[#f9fafb] font-sans">
              {overallScore >= 75 ? "You're placement-ready — keep going!" : "Keep practicing to improve your score!"}
            </h2>
            <p className="text-sm text-[#cbd5e1] mt-1.5 leading-relaxed font-sans">
              Your score of{' '}
              <span className="text-[#22c55e] font-semibold">{Math.round(overallScore)}/100</span> puts you
              in the top 28% of candidates on PathForge. Focus on the areas below to push past 90.
            </p>
          </div>

          {/* Score band */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#94a3b8]">
              <span className="font-sans">Overall Progress</span>
              <span className="text-[#22c55e] font-semibold font-sans">{Math.round(overallScore)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#111827] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallScore}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]"
              />
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Avg Sub-Score', value: `${avgSubScore}%`, color: 'text-[#3b82f6]' },
              { label: 'Strengths', value: `${strengths.length}`, color: 'text-[#22c55e]' },
              { label: 'Areas to Fix', value: `${weaknesses.length}`, color: 'text-[#ef4444]' },
            ].map((s) => (
              <div key={s.label} className="bg-[#111827] rounded-xl border border-[rgba(255,255,255,0.08)] px-4 py-3 text-center">
                <div className={`text-lg font-bold font-sans ${s.color}`}>{s.value}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold text-[#94a3b8] mt-1 font-sans">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Sub-scores ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-8"
      >
        <h2 className="text-base font-bold text-[#f9fafb] mb-4 flex items-center gap-2 font-sans">
          <span className="w-1 h-5 rounded-full bg-[#8b5cf6] inline-block" />
          Category Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subScores.map((item, i) => (
            <SubScoreCard key={item.name} item={item} index={i} />
          ))}
        </div>
      </motion.div>

      {/* ── Strengths + Weaknesses ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' }}
          className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 flex flex-col gap-4"
        >
          <h3 className="text-sm font-bold text-[#f9fafb] flex items-center gap-2 font-sans">
            <CheckCircle size={16} className="text-[#22c55e]" />
            Your Strengths
          </h3>
          {strengths.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {strengths.map((s, i) => (
                <motion.li
                  key={s}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 + 0.25, ease: 'easeOut' }}
                  className="flex items-center gap-3 text-sm text-[#cbd5e1] bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 font-sans"
                >
                  <div className="w-5 h-5 rounded-md bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-[#22c55e]" />
                  </div>
                  <span>{s}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-[#94a3b8] py-4 text-center font-sans border border-dashed border-[rgba(255,255,255,0.08)] rounded-xl bg-[#111827]">
              No strengths identified yet.
            </div>
          )}
        </motion.div>

        {/* Weaknesses */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' }}
          className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 flex flex-col gap-4"
        >
          <h3 className="text-sm font-bold text-[#f9fafb] flex items-center gap-2 font-sans">
            <AlertCircle size={16} className="text-[#ef4444]" />
            Areas to Improve
          </h3>
          {weaknesses.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {weaknesses.map((w, i) => (
                <motion.li
                  key={w}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 + 0.3, ease: 'easeOut' }}
                  className="flex items-center gap-3 text-sm text-[#cbd5e1] bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 font-sans"
                >
                  <div className="w-5 h-5 rounded-md bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-[#ef4444]" />
                  </div>
                  <span>{w}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-[#94a3b8] py-4 text-center font-sans border border-dashed border-[rgba(255,255,255,0.08)] rounded-xl bg-[#111827]">
              No weaknesses identified yet.
            </div>
          )}
        </motion.div>
      </div>

      {/* ── AI Suggestions ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: 'easeOut' }}
      >
        <h2 className="text-base font-bold text-[#f9fafb] mb-4 flex items-center gap-2 font-sans">
          <span className="w-1 h-5 rounded-full bg-[#3b82f6] inline-block" />
          AI Action Plan
        </h2>
        {suggestions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((s, i) => (
              <AiSuggestionCard key={i} suggestion={s} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-[#94a3b8] py-8 text-center font-sans border border-dashed border-[rgba(255,255,255,0.08)] rounded-2xl bg-[#1f2937]">
            No suggestions generated yet.
          </div>
        )}
      </motion.div>
    </div>
  );
}
