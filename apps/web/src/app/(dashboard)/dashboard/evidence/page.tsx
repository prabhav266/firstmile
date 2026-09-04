'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { sounds } from '@/lib/sounds';
import {
  Shield,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Github,
  Code2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FolderGit2,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Award,
  Layers,
  FileCode2,
} from 'lucide-react';

interface EvidenceItem {
  id: string;
  type: string;
  title: string;
  description: string;
  strength: 'STRONG' | 'MODERATE' | 'SUPPORTING';
  url: string | null;
  verified: boolean;
  sourceDate: string;
}

interface SkillScoreItem {
  skillId: string;
  skillName: string;
  category: string;
  score: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  verificationStatus: 'VERIFIED' | 'PARTIALLY_VERIFIED' | 'SELF_REPORTED' | 'INSUFFICIENT_EVIDENCE';
  evidenceCount: number;
  explanation: string;
  evidenceItems: EvidenceItem[];
}

interface EvidenceProfile {
  userId: string;
  name: string;
  email: string;
  title: string;
  college: string;
  branch: string;
  year: number;
  targetCompany: string;
  githubUsername: string | null;
  leetcodeUsername: string | null;
  overallEvidenceScore: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  verificationCounts: {
    verified: number;
    partiallyVerified: number;
    selfReported: number;
    insufficient: number;
  };
  skills: SkillScoreItem[];
  engineeringEvidence: {
    totalProjects: number;
    productionProjects: number;
    githubRepoCount: number;
    githubStars: number;
    githubTopLanguages: Record<string, number>;
    lastActiveDate: string | null;
  };
  dsaEvidence: {
    totalSolved: number;
    platforms: string[];
    topTopics: string[];
    streakDays: number;
  };
  growthOpportunities: Array<{
    skillName: string;
    currentScore: number;
    recommendedAction: string;
  }>;
}

export default function EvidenceGraphPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [githubInput, setGithubInput] = useState<string>('');

  // Fetch Evidence Profile
  const { data: profileRes, isLoading, refetch } = useQuery({
    queryKey: ['evidenceProfile'],
    queryFn: () => api.get('/api/evidence/profile'),
  });

  const profile: EvidenceProfile | null = profileRes?.data?.data || null;

  // Sync GitHub Mutation
  const syncGithubMutation = useMutation({
    mutationFn: (username: string) => api.post('/api/evidence/sync-github', { username }),
    onSuccess: (res) => {
      queryClient.setQueryData(['evidenceProfile'], res);
      sounds.playChime();
      toast.success('GitHub repositories analyzed & evidence graph updated');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to sync GitHub account';
      toast.error(msg);
    },
  });

  // Re-index Evidence Mutation
  const reindexMutation = useMutation({
    mutationFn: () => api.post('/api/evidence/recalculate'),
    onSuccess: (res) => {
      queryClient.setQueryData(['evidenceProfile'], res);
      sounds.playChime();
      toast.success('Evidence graph recalculated from all sources');
    },
    onError: () => toast.error('Failed to recalculate evidence'),
  });

  const handleSyncGithub = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUsername = githubInput.trim() || profile?.githubUsername;
    if (!targetUsername) {
      return toast.error('Please enter your GitHub username');
    }
    syncGithubMutation.mutate(targetUsername);
  };

  const categories = ['ALL', 'DEVELOPMENT', 'DSA', 'DATABASE', 'CLOUD', 'SYSTEM_DESIGN'];

  const filteredSkills = (profile?.skills || []).filter((s) => {
    if (selectedCategory === 'ALL') return true;
    return s.category === selectedCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-[#080808] border border-[#1a1a1a] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-[#080808] border border-[#1a1a1a] rounded-lg animate-pulse" />
          <div className="h-32 bg-[#080808] border border-[#1a1a1a] rounded-lg animate-pulse" />
          <div className="h-32 bg-[#080808] border border-[#1a1a1a] rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const score = profile?.overallEvidenceScore || 65;
  const verifiedCount = profile?.verificationCounts?.verified || 0;
  const partiallyCount = profile?.verificationCounts?.partiallyVerified || 0;
  const selfReportedCount = profile?.verificationCounts?.selfReported || 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider uppercase border border-[#2a2a2a] bg-[#111111] text-[#a1a1aa] flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-[#10b981]" />
                Evidence Infrastructure
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
                {profile?.confidence === 'HIGH'
                  ? '● High Confidence'
                  : profile?.confidence === 'MEDIUM'
                  ? '● Medium Confidence'
                  : '○ Baseline Confidence'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f4f4f5]">
              Candidate Evidence Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed">
              Anyone can claim a skill on a resume. FIRST MILE continuously verifies and scores your abilities
              through concrete proofs: public GitHub repositories, deployed systems, algorithmic problem solving, and technical interviews.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[#064e3b]/30 border border-[#059669]/40 text-[#34d399]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {verifiedCount} Verified Skills
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[#78350f]/30 border border-[#d97706]/40 text-[#fbbf24]">
                <AlertCircle className="w-3.5 h-3.5" />
                {partiallyCount} Partially Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[#1e1b4b]/30 border border-[#4338ca]/40 text-[#a5b4fc]">
                <HelpCircle className="w-3.5 h-3.5" />
                {selfReportedCount} Self Reported
              </span>
            </div>
          </div>

          {/* Overall Evidence Score Gauge */}
          <div className="flex items-center gap-6 self-center lg:self-auto bg-[#000000]/60 border border-[#222222] p-5 rounded-xl min-w-[220px]">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                Overall Evidence
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-mono text-[#f4f4f5]">
                  {score}
                </span>
                <span className="text-xs font-mono text-[#52525b]">/ 100</span>
              </div>
              <p className="text-[11px] text-[#10b981] font-mono">
                {score >= 80 ? 'Top Tier Verifiable' : score >= 65 ? 'Placement Ready' : 'In Progress'}
              </p>
            </div>
            <button
              onClick={() => reindexMutation.mutate()}
              disabled={reindexMutation.isPending}
              title="Recalculate evidence scores across all modules"
              className="p-2 rounded-lg bg-[#111111] border border-[#262626] text-[#a1a1aa] hover:text-[#ffffff] hover:border-[#3f3f46] transition-all"
            >
              <RefreshCw
                className={`w-4 h-4 ${reindexMutation.isPending ? 'animate-spin text-[#10b981]' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* GitHub Integration Block */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1a1a1a]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5 text-[#f4f4f5]" />
              <h2 className="text-base font-semibold text-[#f4f4f5]">
                GitHub Evidence Synchronization
              </h2>
              {profile?.githubUsername && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30">
                  Connected: @{profile.githubUsername}
                </span>
              )}
            </div>
            <p className="text-xs text-[#a1a1aa]">
              We scan your public repositories, language distribution, and commit recency to construct verifiable evidence for your engineering skills.
            </p>
          </div>

          <form onSubmit={handleSyncGithub} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <span className="absolute left-3 top-2.5 text-[#52525b] text-xs font-mono">@</span>
              <input
                type="text"
                placeholder={profile?.githubUsername || 'username'}
                value={githubInput}
                onChange={(e) => setGithubInput(e.target.value)}
                className="w-full bg-[#000000] border border-[#262626] rounded-lg py-2 pl-7 pr-3 text-xs text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-[#52525b] font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={syncGithubMutation.isPending}
              className="btn-primary py-2 px-3 text-xs gap-1.5 whitespace-nowrap disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${syncGithubMutation.isPending ? 'animate-spin' : ''}`}
              />
              <span>{syncGithubMutation.isPending ? 'Analyzing...' : 'Sync GitHub'}</span>
            </button>
          </form>
        </div>

        {/* Engineering Footprint Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#71717a]">Public Repositories</span>
            <div className="text-xl font-bold font-mono text-[#f4f4f5]">
              {profile?.engineeringEvidence?.githubRepoCount || 0}
            </div>
            <span className="text-[11px] text-[#71717a]">Indexed for code evidence</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#71717a]">Portfolio Projects</span>
            <div className="text-xl font-bold font-mono text-[#f4f4f5]">
              {profile?.engineeringEvidence?.totalProjects || 0}
            </div>
            <span className="text-[11px] text-[#10b981]">
              {profile?.engineeringEvidence?.productionProjects || 0} Deployed Live
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#71717a]">DSA Problems Solved</span>
            <div className="text-xl font-bold font-mono text-[#f4f4f5]">
              {profile?.dsaEvidence?.totalSolved || 0}
            </div>
            <span className="text-[11px] text-[#71717a]">
              Across {profile?.dsaEvidence?.platforms?.length || 1} platforms
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#71717a]">Top Languages</span>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {profile?.engineeringEvidence?.githubTopLanguages &&
              Object.keys(profile.engineeringEvidence.githubTopLanguages).length > 0 ? (
                Object.keys(profile.engineeringEvidence.githubTopLanguages)
                  .slice(0, 3)
                  .map((lang) => (
                    <span
                      key={lang}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#111111] border border-[#222222] text-[#e4e4e7]"
                    >
                      {lang}
                    </span>
                  ))
              ) : (
                <span className="text-xs text-[#52525b] font-mono">Sync to detect</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Evidence Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#f4f4f5]">Demonstrated Skill Matrix</h2>
            <p className="text-xs text-[#71717a]">
              Every score is backed by inspectable evidence items. Click any skill to inspect the proof.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-[11px] font-mono tracking-wider transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#ffffff] text-[#000000] font-semibold'
                    : 'bg-[#111111] text-[#71717a] hover:text-[#f4f4f5] border border-[#1f1f1f]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Skill Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredSkills.map((skill) => {
            const isExpanded = expandedSkillId === skill.skillId;
            const isVerified = skill.verificationStatus === 'VERIFIED';
            const isPartial = skill.verificationStatus === 'PARTIALLY_VERIFIED';

            return (
              <div
                key={skill.skillId}
                className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-4 sm:p-5 transition-all hover:border-[#2a2a2a]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-semibold text-[#f4f4f5]">
                        {skill.skillName}
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#141414] text-[#71717a] border border-[#222222]">
                        {skill.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#a1a1aa] leading-relaxed line-clamp-2">
                      {skill.explanation}
                    </p>
                  </div>

                  {/* Score & Status Pill */}
                  <div className="text-right flex-shrink-0 space-y-1">
                    <div className="text-lg font-mono font-bold text-[#f4f4f5]">
                      {skill.score}
                      <span className="text-[10px] text-[#52525b]">/100</span>
                    </div>
                    <div>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#064e3b]/30 border border-[#059669]/40 text-[#34d399]">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                        </span>
                      ) : isPartial ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#78350f]/30 border border-[#d97706]/40 text-[#fbbf24]">
                          <AlertCircle className="w-2.5 h-2.5" /> Partial Proof
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e1b4b]/30 border border-[#4338ca]/40 text-[#a5b4fc]">
                          Self Reported
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full bg-[#141414] h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isVerified
                        ? 'bg-[#10b981]'
                        : isPartial
                        ? 'bg-[#f59e0b]'
                        : 'bg-[#6366f1]'
                    }`}
                    style={{ width: `${Math.min(100, skill.score)}%` }}
                  />
                </div>

                {/* Evidence Drawer Toggle */}
                <div className="mt-4 pt-3 border-t border-[#141414] flex items-center justify-between">
                  <button
                    onClick={() => setExpandedSkillId(isExpanded ? null : skill.skillId)}
                    className="text-xs font-mono text-[#a1a1aa] hover:text-[#ffffff] flex items-center gap-1.5 transition-colors"
                  >
                    <span>
                      {skill.evidenceCount} Concrete Evidence Source{skill.evidenceCount === 1 ? '' : 's'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <span className="text-[10px] font-mono text-[#52525b]">
                    Confidence: {skill.confidence}
                  </span>
                </div>

                {/* Expanded Proof Drawer */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2.5 pt-3 overflow-hidden"
                    >
                      {skill.evidenceItems.length > 0 ? (
                        skill.evidenceItems.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-2.5 rounded-lg bg-[#000000] border border-[#1f1f1f] space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-[#e4e4e7] flex items-center gap-1.5">
                                {ev.type === 'GITHUB_REPO' && <Github className="w-3 h-3 text-[#38bdf8]" />}
                                {ev.type === 'PROJECT' && <FolderGit2 className="w-3 h-3 text-[#34d399]" />}
                                {ev.type === 'CODING_DSA' && <Code2 className="w-3 h-3 text-[#fbbf24]" />}
                                {ev.type === 'RESUME' && <FileCode2 className="w-3 h-3 text-[#a855f7]" />}
                                {ev.title}
                              </span>

                              {ev.url && (
                                <a
                                  href={ev.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#38bdf8] hover:underline flex items-center gap-0.5 text-[11px] font-mono"
                                >
                                  <span>Inspect</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-[#a1a1aa] text-[11px] leading-relaxed">
                              {ev.description}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 rounded-lg bg-[#000000] border border-[#1f1f1f] text-center space-y-1">
                          <p className="text-xs text-[#71717a]">
                            No independent code or assessment evidence yet.
                          </p>
                          <p className="text-[11px] text-[#52525b]">
                            Push code using this skill to GitHub or log a project to verify.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Growth Opportunities */}
      {profile?.growthOpportunities && profile.growthOpportunities.length > 0 && (
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#10b981]" />
            <h3 className="text-sm font-semibold text-[#f4f4f5]">
              Targeted Opportunities to Advance Your Evidence
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.growthOpportunities.map((gap, i) => (
              <div
                key={i}
                className="p-3.5 rounded-lg bg-[#000000] border border-[#1a1a1a] space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#f4f4f5]">{gap.skillName}</span>
                  <span className="text-[10px] font-mono text-[#71717a]">Score: {gap.currentScore}</span>
                </div>
                <p className="text-[#a1a1aa] leading-relaxed">{gap.recommendedAction}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
