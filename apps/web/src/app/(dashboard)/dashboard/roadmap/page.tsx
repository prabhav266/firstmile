'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, Clock, Trophy, ChevronRight, X, Loader2, Trash2, Compass } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PlanDay {
  day: number;
  task: string;
  resource: string;
}

interface PlanWeek {
  week: number;
  topic: string;
  outcome: string;
}

interface PlanMonth {
  month: number;
  milestone: string;
  timeline?: string;
}

const DEFAULT_SKILLS = ['React', 'JavaScript', 'Python', 'SQL', 'Data Structures'];

export default function RoadmapPage() {
  const queryClient = useQueryClient();

  // Form states
  const [targetCompany, setTargetCompany] = React.useState('Google');
  const [targetPackage, setTargetPackage] = React.useState(24);
  const [currentYear, setCurrentYear] = React.useState('3');
  const [branch, setBranch] = React.useState('Computer Science');
  const [skillInput, setSkillInput] = React.useState('');
  const [skills, setSkills] = React.useState<string[]>(DEFAULT_SKILLS);
  const [activeTab, setActiveTab] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');

  // 1. Fetch roadmaps
  const roadmapsQuery = useQuery({
    queryKey: ['roadmaps'],
    queryFn: () => api.get('/api/roadmap'),
  });

  const roadmaps = roadmapsQuery.data?.data?.data || [];
  const latestRoadmap = roadmaps[0];
  const hasRoadmap = roadmaps.length > 0;

  React.useEffect(() => {
    if (latestRoadmap) {
      setTargetCompany(latestRoadmap.targetCompany || 'Google');
      setTargetPackage(latestRoadmap.targetPackage || 24);
      setCurrentYear(String(latestRoadmap.currentYear || 3));
      setBranch(latestRoadmap.branch || 'Computer Science');
      setSkills(latestRoadmap.knownSkills || DEFAULT_SKILLS);
    }
  }, [latestRoadmap]);

  // 2. Generate roadmap mutation
  const generateMutation = useMutation({
    mutationFn: (data: {
      targetCompany: string;
      targetPackage: number;
      currentYear: number;
      branch: string;
      knownSkills: string[];
    }) => api.post('/api/roadmap/generate', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      toast.success('Roadmap generated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate roadmap');
    },
  });

  // 3. Remove roadmap mutation
  const removeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/roadmap/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      toast.success('Roadmap cleared');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove roadmap');
    },
  });

  const addSkill = () => {
    const input = skillInput.trim();
    if (!input) return;
    if (skills.includes(input)) {
      toast.error('Skill already added');
      return;
    }
    setSkills([...skills, input]);
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate({
      targetCompany,
      targetPackage: Number(targetPackage),
      currentYear: Number(currentYear),
      branch,
      knownSkills: skills,
    });
  };

  const dailyPlan: PlanDay[] = (latestRoadmap?.dailyPlan as any) || [
    { day: 1, task: 'Master Binary Search boundaries & rotated sorted arrays', resource: 'LeetCode 33 & 153' },
    { day: 2, task: 'Sliding Window maximums & variable window patterns', resource: 'LeetCode 239' },
    { day: 3, task: 'Two Pointers container with most water & 3Sum', resource: 'LeetCode 11 & 15' },
    { day: 4, task: 'Tree BFS/DFS traversals and lowest common ancestor', resource: 'LeetCode 236' },
  ];

  const weeklyPlan: PlanWeek[] = (latestRoadmap?.weeklyPlan as any) || [
    { week: 1, topic: 'Arrays, Two Pointers & Sliding Window Rigor', outcome: 'Solve 25 Striver Sheet Medium problems' },
    { week: 2, topic: 'Trees, BST, Tries & Graph Traversals', outcome: 'Implement Topological Sort & Dijkstra' },
    { week: 3, topic: 'Dynamic Programming & Memoization Patterns', outcome: 'Master 1D & 2D Knapsack problems' },
    { week: 4, topic: 'System Design Fundamentals & Distributed Caching', outcome: 'Design Redis Rate Limiter architecture' },
  ];

  const monthlyPlan: PlanMonth[] = (latestRoadmap?.monthlyPlan as any) || [
    { month: 1, milestone: 'Complete 150 Core DSA Mediums & Harvard Resume Audit' },
    { month: 2, milestone: 'Pass 5 AI Voice Mock Technical Screens with 8.5+ STAR Score' },
    { month: 3, milestone: 'Ship Distributed Portfolio Project & Unlock Recruiter Discovery' },
  ];

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl">
      {/* Header */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block mb-1">
            Trajectory Planning
          </span>
          <h1 className="font-display font-bold text-2xl text-[#ffffff] tracking-tight">
            Career & Placement Roadmap
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-0.5">
            AI-synthesized preparation trajectory tailored to your target company and compensation goals
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (4 Cols) */}
        <div className="lg:col-span-4">
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4 font-mono text-xs">
            <h2 className="font-bold text-[#ffffff] uppercase tracking-wider text-xs pb-2 border-b border-[#1a1a1a]">
              Roadmap Parameters
            </h2>

            <form onSubmit={handleGenerate} className="space-y-3">
              <div>
                <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Target Company</label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Target Package (LPA)</label>
                <input
                  type="number"
                  value={targetPackage}
                  onChange={(e) => setTargetPackage(Number(e.target.value))}
                  className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Batch Year</label>
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                    className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-2 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
                  >
                    <option value="4">4th Year (2026)</option>
                    <option value="3">3rd Year (2027)</option>
                    <option value="2">2nd Year (2028)</option>
                    <option value="1">1st Year (2029)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-2 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
                  >
                    <option value="Computer Science">CSE</option>
                    <option value="Information Tech">IT</option>
                    <option value="Electronics">ECE</option>
                    <option value="AI & Data Science">AI/DS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Known Skills & Frameworks</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Docker, Redis"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    className="flex-1 bg-[#000000] border border-[#242424] rounded py-1.5 px-2.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
                  />
                  <button type="button" onClick={addSkill} className="btn-secondary py-1 px-3 text-xs">
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-[#000000] border border-[#242424] text-[10px] text-[#b5b5b5] flex items-center gap-1">
                      <span>{s}</span>
                      <button type="button" onClick={() => removeSkill(s)} className="hover:text-[#ffffff]">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="w-full btn-primary py-2 text-xs gap-1.5 mt-2"
              >
                {generateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5" />}
                <span>Synthesize Roadmap</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Plan View (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Plan Header Card */}
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block">Active Trajectory</span>
              <h3 className="font-bold text-base text-[#ffffff]">{targetCompany} Placement Target • ₹{targetPackage} LPA</h3>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded transition-all capitalize ${
                    activeTab === tab ? 'bg-[#ffffff] text-[#000000] font-bold' : 'text-[#888888] hover:text-[#ffffff]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-2.5">
            {activeTab === 'daily' && (
              <div className="space-y-2">
                {dailyPlan.map((d) => (
                  <div key={d.day} className="bg-[#080808] border border-[#1a1a1a] rounded p-4 flex items-start justify-between gap-4 font-mono text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#666666] uppercase block">Day 0{d.day}</span>
                      <p className="text-[#ffffff] font-medium">{d.task}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#000000] border border-[#242424] text-[10px] text-[#888888] shrink-0">
                      {d.resource}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'weekly' && (
              <div className="space-y-2">
                {weeklyPlan.map((w) => (
                  <div key={w.week} className="bg-[#080808] border border-[#1a1a1a] rounded p-4 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#666666] uppercase">Week 0{w.week}</span>
                      <span className="text-[10px] text-[#ffffff] font-bold">Verified Target</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#ffffff]">{w.topic}</h4>
                    <p className="text-[#888888]">{w.outcome}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'monthly' && (
              <div className="space-y-2">
                {monthlyPlan.map((m) => (
                  <div key={m.month} className="bg-[#080808] border border-[#1a1a1a] rounded p-4 flex items-start gap-3 font-mono text-xs">
                    <div className="w-8 h-8 rounded bg-[#111111] border border-[#242424] flex items-center justify-center text-[#ffffff] shrink-0">
                      <Trophy size={14} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[#666666] uppercase">Month 0{m.month} Milestone</span>
                      <p className="text-[#ffffff] font-bold">{m.milestone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
