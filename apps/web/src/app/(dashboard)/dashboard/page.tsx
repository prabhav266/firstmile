'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Code, Clock, Flame, 
  Sparkles, GraduationCap, Loader2,
  CheckCircle2, AlertCircle, CalendarRange, Briefcase,
  Play, Terminal, Cpu, ArrowRight, Award, Trophy, Check
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ReadinessScore } from '@/components/dashboard/ReadinessScore';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SkillRadarChart } from '@/components/dashboard/SkillRadarChart';
import { CodingHeatmap } from '@/components/dashboard/CodingHeatmap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useGamificationStore } from '@/lib/gamification';
import { sounds } from '@/lib/sounds';

export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false);

  // Copilot States
  const [copilotInput, setCopilotInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copilotResult, setCopilotResult] = useState('');
  const [streamedText, setStreamedText] = useState('');

  // Local XP notification states
  const [xpNotify, setXpNotify] = useState<string | null>(null);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Gamification Store hook
  const { xp, level, streak, unlockedBadges, addXp, incrementStreak, unlockBadge } = useGamificationStore();

  // 1. Fetch profile info
  const { data: userProfile, isLoading: isUserLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/api/auth/me'),
    enabled: mounted,
  });

  // 2. Fetch readiness
  const { data: readinessData, isLoading: isReadinessLoading } = useQuery({
    queryKey: ['readinessScore'],
    queryFn: () => api.get('/api/readiness'),
    enabled: mounted,
  });

  // 3. Fetch analytics summary
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: () => api.get('/api/analytics/summary'),
    enabled: mounted,
  });

  // 4. Fetch study hours breakdown
  const { data: studyHoursResponse, isLoading: isHoursLoading } = useQuery({
    queryKey: ['studyHours'],
    queryFn: () => api.get('/api/analytics/hours'),
    enabled: mounted,
  });

  // 5. Fetch planner weekly checklist
  const { data: plannerData, isLoading: isPlannerLoading } = useQuery({
    queryKey: ['plannerCurrent'],
    queryFn: () => api.get('/api/planner'),
    enabled: mounted,
  });

  // 6. Fetch project listings for Projects Completed metric
  const { data: projectsResponse, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/api/projects'),
    enabled: mounted,
  });

  // Update Goal completion status mutation
  const toggleGoalMutation = useMutation({
    mutationFn: (data: { goalId: string; completed: boolean }) =>
      api.put(`/api/planner/goals/${data.goalId}`, { completed: data.completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plannerCurrent'] });
      sounds.playToggle();
      // Reward XP on complete
      const { leveledUp } = addXp(50, 'Completed planner goal');
      setXpNotify('+50 XP: Task Completed!');
      setTimeout(() => setXpNotify(null), 3000);
      
      // Auto unlock badge if total badges criteria met
      if (unlockedBadges.length === 0) {
        unlockBadge('first_scan');
      }
    },
  });

  const isLoading = !mounted || isUserLoading || isReadinessLoading || isSummaryLoading || isPlannerLoading || isHoursLoading || isProjectsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-[#09090b] gap-3">
        <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
        <p className="text-xs text-[#94a3b8]">Initializing Career Workspace...</p>
      </div>
    );
  }

  const user = userProfile?.data?.data || {};
  const readiness = readinessData?.data?.data || { overallScore: 0, resumeScore: 0 };
  const summary = summaryData?.data?.data || { streak: 0, mlHours: 0, codingHours: 0 };
  const planner = plannerData?.data?.data || { goals: [] };
  const projects = projectsResponse?.data?.data || [];
  const hoursDataRaw = studyHoursResponse?.data?.data || [];

  // Mapped stats metrics
  const resumeScoreVal = readiness.resumeScore ? `${Math.round(readiness.resumeScore)}%` : '0%';
  const placementScoreVal = readiness.overallScore ? `${Math.round(readiness.overallScore)}%` : '0%';
  const codingStreakVal = `${summary.streak || 0} Days`;
  const projectsCompletedCount = projects.filter((p: any) => p.status === 'COMPLETED').length;
  const projectsCompletedVal = `${projectsCompletedCount} Project${projectsCompletedCount !== 1 ? 's' : ''}`;
  const mlProgressVal = `${(summary.mlHours || 0).toFixed(1)}h`;

  // Filter study hours chart data
  const formattedHoursData = hoursDataRaw.slice(-7).map((item: any) => ({
    name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    Coding: item.codingHours || 0,
    ML: item.mlHours || 0,
  }));

  // Default chart data if empty
  const chartData = formattedHoursData.length > 0 ? formattedHoursData : [
    { name: 'Mon', Coding: 2.5, ML: 1.5 },
    { name: 'Tue', Coding: 3.0, ML: 2.0 },
    { name: 'Wed', Coding: 1.5, ML: 2.5 },
    { name: 'Thu', Coding: 4.0, ML: 1.0 },
    { name: 'Fri', Coding: 2.0, ML: 3.0 },
    { name: 'Sat', Coding: 3.5, ML: 1.5 },
    { name: 'Sun', Coding: 1.0, ML: 2.0 },
  ];

  // Up-coming tasks & goals
  const rawGoals = Array.isArray(planner.goals) ? planner.goals : [];
  const totalTasks = rawGoals.length;
  const completedTasks = rawGoals.filter((g: any) => g.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Level name mapping
  const levelNames = ['Novice prep', 'ATS Candidate', 'DSA Scholar', 'Interview Ready', 'Career Master'];
  const currentLevelName = levelNames[Math.min(level - 1, levelNames.length - 1)];
  const xpInCurrentLevel = xp % 1000;
  const progressToNextLevel = (xpInCurrentLevel / 1000) * 100;

  // Handle Copilot execution
  const handleExecuteCommand = (cmdText: string) => {
    sounds.playTick();
    setCopilotInput(cmdText);
    setIsGenerating(true);
    setCopilotResult('');
    setStreamedText('');

    setTimeout(() => {
      setIsGenerating(false);
      let output = '';
      if (cmdText.includes('resume') || cmdText.includes('ats')) {
        output = `[PathForge AI: ATS Audit]\nResume ATS score: ${resumeScoreVal}\nPotential missing keywords detected: "Distributed Systems", "gRPC", "Kubernetes".\nRecommended: Quantify bullet descriptions inside the resume dashboard.`;
      } else if (cmdText.includes('roadmap') || cmdText.includes('dsa')) {
        output = `[PathForge AI: Preparations]\nActive target: ${user.branch || 'CSE'} roadmap.\nWeekly objective: Complete Dynamic Programming arrays logs.\nConsistency rating: Strong (${codingStreakVal} streak active).`;
      } else {
        output = `[PathForge AI: Cover Letter Draft]\nDrafting cover letter for target company SDE role...\n"Dear Hiring Team, as a CS candidate with a placement score of ${placementScoreVal} and ${projectsCompletedVal} completed, I am highly interested in..."`;
      }
      setCopilotResult(output);

      // Typing stream simulation
      let idx = 0;
      const interval = setInterval(() => {
        setStreamedText((prev) => prev + output.charAt(idx));
        idx++;
        if (idx >= output.length) {
          clearInterval(interval);
        }
      }, 10);
    }, 1200);
  };

  const handleClaimReward = () => {
    sounds.playChime();
    const { leveledUp } = addXp(150, 'Claimed daily consistency reward');
    setXpNotify('+150 XP: Daily Bonus Claimed!');
    setTimeout(() => setXpNotify(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* ─── Level & XP status bar ─── */}
      <div className="bg-[#18181b] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Animated XP notifications */}
        <AnimatePresence>
          {xpNotify && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="absolute top-3 right-4 bg-[#22c55e]/15 border border-[#22c55e]/30 px-3 py-1 rounded-lg text-xs font-bold text-[#22c55e] z-10"
            >
              {xpNotify}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-[#09090b] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#8b5cf6] shrink-0 shadow-inner">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-[#cbd5e1]/40 uppercase tracking-widest block">Preparation Rank</span>
            <h3 className="font-bold text-sm text-[#fafafa] flex items-center gap-1.5 uppercase tracking-wide">
              Level {level} · <span className="text-[#8b5cf6] font-semibold">{currentLevelName}</span>
            </h3>
          </div>
        </div>

        {/* Progress bar towards next rank */}
        <div className="flex-1 w-full max-w-md space-y-2">
          <div className="flex justify-between text-[9px] font-mono text-[#cbd5e1]/40 uppercase tracking-wider">
            <span>XP: {xpInCurrentLevel} / 1000</span>
            <span>Progress to Next Rank: {Math.round(progressToNextLevel)}%</span>
          </div>
          <div className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.06)] rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] h-full rounded-full" 
              style={{ width: `${progressToNextLevel}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleClaimReward}
          className="w-full md:w-auto bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(59,130,246,0.15)] hover:scale-[1.02] active:scale-[0.98]"
        >
          Claim Daily XP Bonus
        </button>
      </div>

      {/* Greeting & AI Workspace Copilot Input */}
      <div className="bg-[#18181b] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold text-[#3b82f6] uppercase tracking-wider block">Student Workspace</span>
          <h1 className="font-sans font-bold text-2xl text-[#fafafa]">Welcome back, {user.name || 'Student'}!</h1>
          <p className="text-xs text-[#cbd5e1]/60">Class of {user.year || '3rd'} Year · {user.branch || 'Computer Science'}</p>
        </div>

        {/* AI Copilot Command Input Bar */}
        <div className="flex-1 max-w-xl bg-[#09090b] border border-[rgba(255,255,255,0.06)] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider">
            <div className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span>AI Copilot Terminal</span>
            </div>
            <span className="text-[#cbd5e1]/40 font-mono text-[9px]">Active</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask Copilot: /resume, /roadmap, /letter..."
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              className="flex-1 bg-transparent border-0 text-xs text-[#cbd5e1] placeholder-[#cbd5e1]/40 focus:ring-0 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand(copilotInput)}
            />
            <button
              onClick={() => handleExecuteCommand(copilotInput || 'Audit my resume')}
              disabled={isGenerating}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white p-1.5 rounded-lg transition-all shrink-0"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            </button>
          </div>

          {/* Quick prompt buttons */}
          <div className="flex gap-1.5 pt-1">
            {[
              { label: 'Audit Resume', cmd: 'Audit my resume ATS' },
              { label: 'DSA Prep Roadmap', cmd: 'Verify my DSA preparation roadmap' },
              { label: 'Draft Cover Letter', cmd: 'Draft SDE cover letter' }
            ].map(btn => (
              <button
                key={btn.label}
                onClick={() => handleExecuteCommand(btn.cmd)}
                className="text-[9px] font-bold text-[#cbd5e1] hover:text-[#3b82f6] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.04)] px-2 py-1 rounded"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Copilot Dynamic Terminal Output */}
      <AnimatePresence>
        {(isGenerating || copilotResult) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 font-mono text-[11px] text-[#cbd5e1] relative overflow-hidden"
          >
            <div className="absolute top-2.5 right-3 text-[9px] uppercase font-bold text-[#94a3b8]/40 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#3b82f6]" />
              <span>Copilot Engine</span>
            </div>

            {isGenerating ? (
              <div className="flex items-center gap-2 py-1">
                <Loader2 className="w-3.5 h-3.5 text-[#3b82f6] animate-spin" />
                <span className="text-[#94a3b8] animate-pulse">Parsing workspace statistics...</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap leading-relaxed">{streamedText}</pre>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Row: 5 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatsCard 
          title="Resume Score" 
          value={resumeScoreVal} 
          icon={FileText} 
          subtext="Latest ATS review" 
        />
        <StatsCard 
          title="Placement Score" 
          value={placementScoreVal} 
          icon={GraduationCap} 
          subtext="Readiness score index" 
        />
        <StatsCard 
          title="Coding Streak" 
          value={codingStreakVal} 
          icon={Flame} 
          subtext="Daily active streak" 
        />
        <StatsCard 
          title="Projects Completed" 
          value={projectsCompletedVal} 
          icon={Briefcase} 
          subtext="Portfolio items" 
        />
        <StatsCard 
          title="ML Progress" 
          value={mlProgressVal} 
          icon={Clock} 
          subtext="Study hours logged" 
        />
      </div>

      {/* Charts Grid: Radar, Heatmap, and Recharts BarChart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkillRadarChart />
        <CodingHeatmap />
        
        {/* Weekly study hours chart */}
        <div className="bg-[#18181b] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 flex flex-col justify-between h-[340px]">
          <div>
            <h3 className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">Weekly Study Hours</h3>
            <p className="text-[10px] text-[#94a3b8]">Comparison of hours logged for Coding vs ML Tracker</p>
          </div>

          <div className="flex-1 w-full min-h-[200px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ background: '#09090b', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}
                  labelStyle={{ color: '#cbd5e1', fontSize: 10 }}
                  itemStyle={{ fontSize: 10 }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Bar dataKey="Coding" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ML" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: AI Suggestions & Activities & Planner Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendations */}
        <div className="bg-[#18181b] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.04)] pb-2.5">
            <Sparkles className="w-4 h-4 text-[#3b82f6]" />
            <h3 className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">AI Suggestions</h3>
          </div>

          <div className="space-y-3">
            {[
              { tag: 'Resume', text: 'Quantify impact metrics on your React Chat App project details.', color: 'text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/15' },
              { tag: 'Coding', text: 'Lagging in Binary Search trees. Log 3 tree logs from Striver A2Z.', color: 'text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/15' },
              { tag: 'Projects', text: 'Build a Distributed Cache engine to increase resume rating by +12%.', color: 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/15' }
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#09090b] border border-[rgba(255,255,255,0.04)] space-y-1.5">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${item.color}`}>
                  {item.tag}
                </span>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities list */}
        <div className="bg-[#18181b] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.04)] pb-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
            <h3 className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">Recent Activity</h3>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Logged 4 Leetcode medium problems', time: '1 hour ago', desc: 'Category: Graphs, Topic: BFS' },
              { title: 'Updated Skills graph sliders', time: 'Yesterday', desc: 'Saved 6 proficiency adjustments' },
              { title: 'Uploaded resume draft v2', time: '2 days ago', desc: 'ATS Score generated: 82%' },
              { title: 'Completed Weekly Goal checklist', time: '3 days ago', desc: '100% target solved' }
            ].map((item, i) => (
              <div key={i} className="flex gap-3 text-xs leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <h4 className="font-medium text-[#fafafa]">{item.title}</h4>
                  <p className="text-[10px] text-[#94a3b8]">{item.desc} · {item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Goals/Tasks */}
        <div className="bg-[#18181b] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-[rgba(255,255,255,0.04)] pb-2.5">
            <AlertCircle className="w-4 h-4 text-[#f59e0b]" />
            <h3 className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">Upcoming Tasks</h3>
          </div>

          <div className="space-y-3">
            {rawGoals.length > 0 ? (
              rawGoals.slice(0, 4).map((goal: any, i: number) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-[#cbd5e1] p-2 bg-[#09090b] border border-[rgba(255,255,255,0.04)] rounded-lg">
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={(e) => toggleGoalMutation.mutate({ goalId: goal.id, completed: e.target.checked })}
                    className="w-3.5 h-3.5 bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded focus:ring-0 cursor-pointer text-[#3b82f6]"
                  />
                  <span className={goal.completed ? 'line-through text-[#94a3b8]' : 'text-[#cbd5e1]'}>{goal.title || goal.t}</span>
                </div>
              ))
            ) : (
              ['Solve 15 Dynamic Programming questions', 'Complete ML specializations module 3', 'Log 2 portfolio projects updates'].map((task, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-[#cbd5e1] p-2.5 bg-[#09090b] border border-[rgba(255,255,255,0.04)] rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                  <span>{task}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
