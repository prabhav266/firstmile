'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, BookOpen, Clock, Trophy, ChevronRight, X, Loader, Trash2 } from 'lucide-react';
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

const DEFAULT_SKILLS = ['React', 'JavaScript', 'Python', 'SQL'];

export default function RoadmapPage() {
  const queryClient = useQueryClient();

  // Form states
  const [targetCompany, setTargetCompany] = React.useState('Google');
  const [targetPackage, setTargetPackage] = React.useState(18);
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

  // Sync form states with latest roadmap if available
  React.useEffect(() => {
    if (latestRoadmap) {
      setTargetCompany(latestRoadmap.targetCompany || '');
      setTargetPackage(latestRoadmap.targetPackage || 12);
      setCurrentYear(String(latestRoadmap.currentYear || 3));
      setBranch(latestRoadmap.branch || '');
      setSkills(latestRoadmap.knownSkills || []);
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
      toast.success('Roadmap generated!');
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
      toast.success('Roadmap removed!');
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
    setSkills(skills.filter(s => s !== skill));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCompany.trim() || !branch.trim() || skills.length === 0) {
      toast.error('Please complete all form fields');
      return;
    }

    generateMutation.mutate({
      targetCompany,
      targetPackage,
      currentYear: Number(currentYear),
      branch,
      knownSkills: skills,
    });
  };

  // Safe JSON extraction and casting
  const dailyPlan = Array.isArray(latestRoadmap?.dailyPlan)
    ? (latestRoadmap.dailyPlan as PlanDay[])
    : [];
  const weeklyPlan = Array.isArray(latestRoadmap?.weeklyPlan)
    ? (latestRoadmap.weeklyPlan as PlanWeek[])
    : [];
  const monthlyPlan = Array.isArray(latestRoadmap?.monthlyPlan)
    ? (latestRoadmap.monthlyPlan as PlanMonth[])
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <h1 className="font-sans font-bold text-3xl text-[#F9FAFB]">AI Roadmap Generator</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Get a customized daily, weekly, and monthly placement prep roadmap</p>
      </motion.div>

      {roadmapsQuery.isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-[#94A3B8]">
          <Loader className="w-8 h-8 animate-spin text-[#3b82f6]" />
          <span className="text-sm">Loading your custom roadmaps...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Form */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="lg:col-span-1 bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 h-fit space-y-6"
          >
            <h2 className="text-[10px] tracking-wider uppercase font-semibold text-[#94a3b8]">Configure Target</h2>

            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Target Company */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#CBD5E1] font-medium">Target Company</label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="Google, Stripe, Microsoft..."
                  className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2 px-3 text-sm text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all placeholder:text-[#94A3B8]/50"
                  required
                />
              </div>

              {/* Target Package Range */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-[#CBD5E1]">
                  <label className="font-medium">Target Package</label>
                  <span className="font-semibold text-[#3b82f6]">{targetPackage} LPA</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={targetPackage}
                  onChange={(e) => setTargetPackage(Number(e.target.value))}
                  className="w-full h-2 bg-[#111827] rounded-lg appearance-none cursor-pointer accent-[#3b82f6] border border-[rgba(255,255,255,0.08)]"
                />
              </div>

              {/* Current College Year */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#CBD5E1] font-medium">Current College Year</label>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2 px-3 text-sm text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              {/* Academic Branch */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#CBD5E1] font-medium">Academic Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science, Electronics"
                  className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2 px-3 text-sm text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all placeholder:text-[#94A3B8]/50"
                  required
                />
              </div>

              {/* Known Skills Tag Input */}
              <div className="space-y-2">
                <label className="text-xs text-[#CBD5E1] font-medium">Known Skills</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="e.g. React, C++, Docker"
                    className="flex-1 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2 px-3 text-sm text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all placeholder:text-[#94A3B8]/50"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 rounded-[12px] bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white transition-all text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                {/* Skills Tags list */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map(s => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#111827] text-xs text-[#CBD5E1] font-medium"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="text-[#94A3B8] hover:text-[#F9FAFB] transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={generateMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] active:bg-[#6d28d9] text-white rounded-[12px] py-3 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generateMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generateMutation.isPending ? 'Generating Roadmap...' : 'Generate Roadmap'}
              </button>
            </form>
          </motion.div>

          {/* Roadmap Display Area */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {!hasRoadmap ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="bg-[#1f2937] border border-dashed border-[rgba(255,255,255,0.08)] rounded-2xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]"
                >
                  <div className="w-12 h-12 rounded-full bg-[#3b82f6]/10 border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#3b82f6] mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#F9FAFB] mb-1">Generate Your Customized Learning Path</h3>
                  <p className="text-sm text-[#CBD5E1] max-w-sm">
                    Complete the target profile settings on the left panel to trigger the AI roadmap engine.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  {/* Generated Summary Card */}
                  <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <span className="text-[10px] tracking-wider uppercase font-semibold text-[#3b82f6] block">Plan Generated</span>
                      <h3 className="font-sans font-bold text-xl text-[#F9FAFB]">{latestRoadmap.targetCompany} Prep Path</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[#111827] text-xs font-semibold text-[#CBD5E1]">
                        <Clock className="w-3.5 h-3.5 text-[#3b82f6]" />
                        Timeline: {latestRoadmap.timeline}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this roadmap?')) {
                            removeMutation.mutate(latestRoadmap.id);
                          }
                        }}
                        disabled={removeMutation.isPending}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#EF4444] hover:text-white bg-[#111827] hover:bg-[#EF4444] border border-[rgba(255,255,255,0.08)] hover:border-transparent rounded-[12px] px-3.5 py-1.5 transition-all disabled:opacity-50"
                      >
                        {removeMutation.isPending ? <Loader className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Delete Plan
                      </button>
                    </div>
                  </div>

                  {/* Tab Switcher */}
                  <div className="flex bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl p-1">
                    {(['daily', 'weekly', 'monthly'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-xs font-semibold capitalize rounded-lg border transition-all ${
                          activeTab === tab
                            ? 'bg-[#1f2937] border-[rgba(255,255,255,0.08)] text-[#F9FAFB]'
                            : 'border-transparent text-[#94A3B8] hover:text-[#F9FAFB]'
                        }`}
                      >
                        {tab} Plan
                      </button>
                    ))}
                  </div>

                  {/* Tab Content Display */}
                  <div className="space-y-4">
                    {activeTab === 'daily' && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className="relative border-l border-[rgba(255,255,255,0.08)] ml-4 pl-8 space-y-6"
                      >
                        {dailyPlan.map((d, index) => (
                          <div key={`${d.day}-${index}`} className="relative">
                            {/* Timeline Node */}
                            <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-[#111827] border-2 border-[#3b82f6] flex items-center justify-center text-[10px] font-bold text-[#F9FAFB]">
                              {d.day}
                            </div>
                            {/* Card */}
                            <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[rgba(255,255,255,0.15)]">
                              <div className="space-y-1">
                                <span className="text-[10px] font-semibold text-[#3b82f6] uppercase tracking-wider block">Day {d.day}</span>
                                <p className="text-sm font-semibold text-[#F9FAFB]">{d.task}</p>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-[#CBD5E1] pt-3 md:pt-0 border-t md:border-t-0 border-[rgba(255,255,255,0.08)]">
                                <span className="flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5 text-[#3b82f6]" />
                                  {d.resource}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {activeTab === 'weekly' && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className="relative border-l border-[rgba(255,255,255,0.08)] ml-4 pl-8 space-y-6"
                      >
                        {weeklyPlan.map((w, index) => (
                          <div key={`${w.week}-${index}`} className="relative">
                            {/* Timeline Node */}
                            <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-[#111827] border-2 border-[#8b5cf6] flex items-center justify-center text-[10px] font-bold text-[#F9FAFB]">
                              {w.week}
                            </div>
                            {/* Card */}
                            <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[rgba(255,255,255,0.15)]">
                              <div className="space-y-1">
                                <span className="text-[10px] font-semibold text-[#8b5cf6] uppercase tracking-wider block">Week {w.week}</span>
                                <h4 className="text-sm font-semibold text-[#F9FAFB]">{w.topic}</h4>
                                <p className="text-xs text-[#CBD5E1]">Focus outcome: {w.outcome}</p>
                              </div>
                              <span className="inline-block self-start md:self-auto px-2.5 py-0.5 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 text-[10px] font-semibold text-[#22C55E]">
                                Verified Target
                              </span>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {activeTab === 'monthly' && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className="relative border-l border-[rgba(255,255,255,0.08)] ml-4 pl-8 space-y-6"
                      >
                        {monthlyPlan.map((m, index) => (
                          <div key={`${m.month}-${index}`} className="relative">
                            {/* Timeline Node */}
                            <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-[#111827] border-2 border-[#F59E0B] flex items-center justify-center text-[10px] font-bold text-[#F9FAFB]">
                              {m.month}
                            </div>
                            {/* Card */}
                            <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-[12px] p-5 flex items-start gap-4 transition-all hover:border-[rgba(255,255,255,0.15)]">
                              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] flex-shrink-0">
                                <Trophy className="w-4 h-4" />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] font-semibold text-[#F59E0B] uppercase tracking-wider block">Month {m.month} Milestone</span>
                                <p className="text-sm font-semibold text-[#F9FAFB] leading-relaxed">{m.milestone}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Topics Summary Footer */}
                  <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 space-y-3">
                    <h4 className="text-[10px] tracking-wider uppercase font-semibold text-[#94a3b8]">Key Topic Focus Areas</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {((latestRoadmap.knownSkills as string[]) || ['Data Structures', 'Algorithms', 'System Design', 'Web Technologies', 'Cloud & Deployments']).map((topic: string) => (
                        <span key={topic} className="px-2.5 py-1 rounded-lg bg-[#111827] border border-[rgba(255,255,255,0.08)] text-xs font-medium text-[#CBD5E1]">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
