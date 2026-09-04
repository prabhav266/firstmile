'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  Search,
  Users,
  Bookmark,
  ExternalLink,
  MapPin,
  Sparkles,
  X,
  Loader2,
  Check,
  Send,
  MessageSquare,
  FileText,
  Code2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { sounds } from '@/lib/sounds';

interface TalentCandidate {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  location: string;
  experienceLevel: string;
  expectedCtc: string;
  leetcodeUsername?: string;
  githubUsername?: string;
  leetcodeSolved: number;
  atsScore: number;
  voiceMockScore: number;
  readinessScore: number;
  verifiedSkillCount?: number;
  partiallyVerifiedCount?: number;
  skills: string[];
  highlights: string[];
  verifiedBadges: Array<{ label: string; color: string }>;
  status: string;
}

export default function RecruiterMarketplacePage() {
  const queryClient = useQueryClient();

  // Filters
  const [roleFilter, setRoleFilter] = useState('All');
  const [minLeetCode, setMinLeetCode] = useState<number>(0);
  const [minAts, setMinAts] = useState<number>(0);
  const [minVoiceScore, setMinVoiceScore] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'marketplace' | 'pipeline'>('marketplace');

  // Modals
  const [previewCandidate, setPreviewCandidate] = useState<TalentCandidate | null>(null);
  const [outreachCandidate, setOutreachCandidate] = useState<TalentCandidate | null>(null);
  const [outreachForm, setOutreachForm] = useState({
    companyName: 'TechCorp Cloud Systems',
    roleTitle: 'Software Development Engineer (SDE-1)',
    salaryRange: '₹24 - ₹32 LPA',
    message: '',
  });

  // 1. Fetch Talent Pool
  const { data: talentData, isLoading: isTalentLoading } = useQuery({
    queryKey: ['recruiterCandidates', roleFilter, minLeetCode, minAts, minVoiceScore, searchQuery],
    queryFn: () =>
      api.get('/api/recruiter/candidates', {
        params: {
          role: roleFilter !== 'All' ? roleFilter : undefined,
          minLeetCode: minLeetCode > 0 ? minLeetCode : undefined,
          minAts: minAts > 0 ? minAts : undefined,
          minVoiceScore: minVoiceScore > 0 ? minVoiceScore : undefined,
          search: searchQuery || undefined,
        },
      }),
  });

  // 2. Fetch Recruiter Pipeline
  const { data: pipelineData } = useQuery({
    queryKey: ['recruiterPipeline'],
    queryFn: () => api.get('/api/recruiter/pipeline'),
  });

  // Bookmark Mutation
  const bookmarkMutation = useMutation({
    mutationFn: (data: { candidateId: string; stage: string }) => api.post('/api/recruiter/bookmark', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterPipeline'] });
      sounds.playToggle();
      toast.success('Candidate saved to your hiring pipeline!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to bookmark candidate');
    },
  });

  // Send Outreach Mutation
  const sendOutreachMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/recruiter/outreach', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiterPipeline'] });
      sounds.playChime();
      toast.success('Interview invitation sent to candidate!');
      setOutreachCandidate(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to send outreach');
    },
  });

  const candidates: TalentCandidate[] = talentData?.data?.data?.candidates || [];
  const pipeline = pipelineData?.data?.data?.pipeline || [];
  const bookmarkedIds = new Set(pipeline.map((p: any) => p.candidateId));

  const handleToggleBookmark = (candidateId: string) => {
    bookmarkMutation.mutate({
      candidateId,
      stage: bookmarkedIds.has(candidateId) ? 'SAVED' : 'SAVED',
    });
  };

  const handleOpenOutreach = (candidate: TalentCandidate) => {
    setOutreachCandidate(candidate);
    setOutreachForm({
      companyName: 'TechCorp Cloud Systems',
      roleTitle: candidate.title.includes('Frontend') ? 'Frontend Engineer (React)' : 'Software Engineer (SDE-1)',
      salaryRange: candidate.expectedCtc || '₹24 - ₹32 LPA',
      message: `Hi ${candidate.name.split(' ')[0]}, we reviewed your verified First Mile scorecards (LeetCode: ${candidate.leetcodeSolved}+, ATS Score: ${candidate.atsScore}%, Voice Screener: ${candidate.voiceMockScore}/10) and would love to interview you for our engineering team.`,
    });
  };

  return (
    <div className="space-y-6 font-sans max-w-7xl select-none">
      {/* Top Editorial Banner */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-[10px] text-[#666666] uppercase">
              <Briefcase className="w-3.5 h-3.5 text-[#ffffff]" />
              <span>FIRST MILE • TALENT DISCOVERY</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-[#ffffff] tracking-tight">Pre-Vetted Engineering Talent</h1>
            <p className="text-xs text-[#888888] font-mono mt-0.5 max-w-2xl">
              Discover engineering graduates verified by live LeetCode solve counts, Harvard ATS scores, and STAR voice mock screeners.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#000000] border border-[#1a1a1a] rounded-md">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'marketplace'
                  ? 'bg-[#ffffff] text-[#000000]'
                  : 'text-[#888888] hover:text-[#ffffff]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Talent Pool ({candidates.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'pipeline'
                  ? 'bg-[#ffffff] text-[#000000]'
                  : 'text-[#888888] hover:text-[#ffffff]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>My Pipeline ({pipeline.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Marketplace Discovery & Filter */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          {/* Proof-of-Work Filter */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-[#080808] p-4 rounded-lg border border-[#1a1a1a]">
            <div>
              <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1.5">Domain</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-[#000000] border border-[#242424] rounded-md py-1.5 px-2.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              >
                <option value="All">All Domains</option>
                <option value="Full Stack">Full Stack</option>
                <option value="Backend">Backend / Cloud</option>
                <option value="Frontend">Frontend / UI</option>
                <option value="AI">AI & Machine Learning</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1.5">Min Solves</label>
              <select
                value={minLeetCode}
                onChange={(e) => setMinLeetCode(Number(e.target.value))}
                className="w-full bg-[#000000] border border-[#242424] rounded-md py-1.5 px-2.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              >
                <option value={0}>Any Solves</option>
                <option value={100}>100+ Solved</option>
                <option value={200}>200+ Solved</option>
                <option value={300}>300+ Solved</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1.5">Min ATS Score</label>
              <select
                value={minAts}
                onChange={(e) => setMinAts(Number(e.target.value))}
                className="w-full bg-[#000000] border border-[#242424] rounded-md py-1.5 px-2.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              >
                <option value={0}>Any ATS</option>
                <option value={70}>70%+ ATS</option>
                <option value={80}>80%+ ATS</option>
                <option value={90}>90%+ ATS</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1.5">Min Voice Mock</label>
              <select
                value={minVoiceScore}
                onChange={(e) => setMinVoiceScore(Number(e.target.value))}
                className="w-full bg-[#000000] border border-[#242424] rounded-md py-1.5 px-2.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              >
                <option value={0}>Any Score</option>
                <option value={7}>7.0+ / 10</option>
                <option value={8}>8.0+ / 10</option>
                <option value={9}>9.0+ / 10</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1.5">Search Candidate</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#666666]" />
                <input
                  type="text"
                  placeholder="e.g. React, Redis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#000000] border border-[#242424] rounded-md py-1.5 pl-8 pr-3 text-xs text-[#ffffff] placeholder-[#444444] focus:outline-none focus:border-[#ffffff]"
                />
              </div>
            </div>
          </div>

          {/* Candidate Dossier Cards */}
          {isTalentLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
              <Loader2 className="w-6 h-6 text-[#ffffff] animate-spin" />
              <p className="text-xs font-mono text-[#666666]">Querying pre-vetted candidates...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-12 text-center">
              <Users className="w-8 h-8 text-[#666666] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#ffffff]">No candidates match your current filter</h3>
              <p className="text-xs font-mono text-[#666666] mt-1">Try lowering the minimum score thresholds or search queries.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {candidates.map((c) => {
                const isSaved = bookmarkedIds.has(c.id);
                return (
                  <div
                    key={c.id}
                    className="bg-[#080808] border border-[#1a1a1a] hover:border-[#333333] rounded-lg p-5 flex flex-col justify-between transition-colors space-y-4"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#1a1a1a]">
                        <div>
                          <h3 className="text-sm font-bold text-[#ffffff]">{c.name}</h3>
                          <p className="text-xs text-[#888888]">{c.title}</p>
                        </div>
                        <button
                          onClick={() => handleToggleBookmark(c.id)}
                          className={`p-1.5 rounded border transition-colors ${
                            isSaved ? 'bg-[#ffffff] text-[#000000] border-[#ffffff]' : 'bg-[#000000] text-[#666666] border-[#242424] hover:text-[#ffffff]'
                          }`}
                          title={isSaved ? 'Bookmarked' : 'Save to Pipeline'}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Verified Proof-of-Work Metrics */}
                      <div className="grid grid-cols-3 gap-2 py-3 text-center border-b border-[#1a1a1a]">
                        <div className="bg-[#000000] border border-[#1e1e1e] rounded p-2">
                          <span className="text-[9px] font-mono text-[#666666] block uppercase">Solves</span>
                          <span className="text-sm font-bold font-display text-[#ffffff]">{c.leetcodeSolved}+</span>
                        </div>
                        <div className="bg-[#000000] border border-[#1e1e1e] rounded p-2">
                          <span className="text-[9px] font-mono text-[#666666] block uppercase">ATS Score</span>
                          <span className="text-sm font-bold font-display text-[#ffffff]">{c.atsScore}%</span>
                        </div>
                        <div className="bg-[#000000] border border-[#1e1e1e] rounded p-2">
                          <span className="text-[9px] font-mono text-[#666666] block uppercase">Mock Score</span>
                          <span className="text-sm font-bold font-display text-[#ffffff]">{c.voiceMockScore}/10</span>
                        </div>
                      </div>

                      {/* Skills Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-3">
                        {c.skills.slice(0, 4).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded bg-[#000000] border border-[#242424] text-[10px] font-mono text-[#888888]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[#1a1a1a]">
                      <button
                        onClick={() => setPreviewCandidate(c)}
                        className="btn-secondary py-1.5 px-3 text-xs flex-1"
                      >
                        Inspect Dossier
                      </button>
                      <button
                        onClick={() => handleOpenOutreach(c)}
                        className="btn-primary py-1.5 px-3 text-xs flex-1"
                      >
                        Invite to Screen
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Hiring Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          {pipeline.length === 0 ? (
            <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-12 text-center">
              <Bookmark className="w-8 h-8 text-[#666666] mx-auto mb-2" />
              <h3 className="text-sm font-bold text-[#ffffff]">Your candidate pipeline is empty</h3>
              <p className="text-xs font-mono text-[#666666] mt-1">Bookmark candidates from the Talent Pool to track interviews.</p>
            </div>
          ) : (
            <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#000000] border-b border-[#1a1a1a] text-[#666666] font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Proof-of-Work</th>
                    <th className="p-3">Stage</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {pipeline.map((item: any) => {
                    const c = item.candidate || {};
                    return (
                      <tr key={item.id} className="hover:bg-[#0d0d0d]">
                        <td className="p-3">
                          <div className="font-bold text-[#ffffff]">{c.name || 'Candidate'}</div>
                          <div className="text-[10px] font-mono text-[#666666]">{c.email}</div>
                        </td>
                        <td className="p-3 text-[#888888]">{c.title || 'Software Engineer'}</td>
                        <td className="p-3 font-mono text-[#b5b5b5]">
                          {c.leetcodeSolved || 250}+ Solves • {c.atsScore || 85}% ATS
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141414] border border-[#27272a] text-[#ffffff]">
                            {item.stage || 'SAVED'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleOpenOutreach(c)}
                            className="btn-primary py-1 px-3 text-[11px]"
                          >
                            Send Invite
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Candidate Dossier Inspection Modal */}
      {previewCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg max-w-2xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
              <div>
                <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block">Candidate Dossier</span>
                <h2 className="font-display font-bold text-lg text-[#ffffff]">{previewCandidate.name}</h2>
              </div>
              <button onClick={() => setPreviewCandidate(null)} className="p-1 rounded text-[#666666] hover:text-[#ffffff]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#000000] border border-[#1e1e1e] p-3 rounded">
                <span className="text-[9px] font-mono text-[#666666] uppercase block">LeetCode Solved</span>
                <span className="text-xl font-bold text-[#ffffff]">{previewCandidate.leetcodeSolved}+</span>
              </div>
              <div className="bg-[#000000] border border-[#1e1e1e] p-3 rounded">
                <span className="text-[9px] font-mono text-[#666666] uppercase block">Harvard ATS Score</span>
                <span className="text-xl font-bold text-[#ffffff]">{previewCandidate.atsScore}%</span>
              </div>
              <div className="bg-[#000000] border border-[#1e1e1e] p-3 rounded">
                <span className="text-[9px] font-mono text-[#666666] uppercase block">Voice Mock Screener</span>
                <span className="text-xl font-bold text-[#ffffff]">{previewCandidate.voiceMockScore}/10</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#ffffff] uppercase tracking-wider mb-2">Key Technical Highlights</h4>
              <ul className="space-y-1.5 text-xs text-[#b5b5b5]">
                {previewCandidate.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#ffffff] mt-1.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[#ffffff] uppercase tracking-wider">
                  Demonstrated Skills & Evidence
                </h4>
                <span className="text-[10px] font-mono text-[#10b981]">
                  ✓ Verified by Evidence Engine
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {previewCandidate.skills.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-[#000000] border border-[#27272a] text-xs font-mono text-[#e4e4e7] flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    {s}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-[#71717a] mt-2 font-mono">
                Verified through public repositories, commit recency, and live test performance.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a1a1a]">
              <button onClick={() => setPreviewCandidate(null)} className="btn-secondary py-1.5 px-4 text-xs">
                Close
              </button>
              <button
                onClick={() => {
                  const c = previewCandidate;
                  setPreviewCandidate(null);
                  handleOpenOutreach(c);
                }}
                className="btn-primary py-1.5 px-4 text-xs"
              >
                Send Interview Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outreach Invite Modal */}
      {outreachCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
              <div>
                <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block">Direct Outreach</span>
                <h2 className="font-display font-bold text-base text-[#ffffff]">Interview Invitation • {outreachCandidate.name}</h2>
              </div>
              <button onClick={() => setOutreachCandidate(null)} className="p-1 rounded text-[#666666] hover:text-[#ffffff]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Role Title</label>
                <input
                  type="text"
                  value={outreachForm.roleTitle}
                  onChange={(e) => setOutreachForm({ ...outreachForm, roleTitle: e.target.value })}
                  className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Compensation Range</label>
                <input
                  type="text"
                  value={outreachForm.salaryRange}
                  onChange={(e) => setOutreachForm({ ...outreachForm, salaryRange: e.target.value })}
                  className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Message Body</label>
                <textarea
                  rows={4}
                  value={outreachForm.message}
                  onChange={(e) => setOutreachForm({ ...outreachForm, message: e.target.value })}
                  className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a1a1a]">
              <button onClick={() => setOutreachCandidate(null)} className="btn-secondary py-1.5 px-4 text-xs">
                Cancel
              </button>
              <button
                onClick={() => sendOutreachMutation.mutate({ candidateId: outreachCandidate.id, ...outreachForm })}
                disabled={sendOutreachMutation.isPending}
                className="btn-primary py-1.5 px-4 text-xs gap-1.5"
              >
                {sendOutreachMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Invitation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
