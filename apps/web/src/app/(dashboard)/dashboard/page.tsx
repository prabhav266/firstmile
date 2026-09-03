'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Code, Flame, 
  GraduationCap, Loader2,
  CheckCircle2, AlertCircle, Briefcase,
  Play, Terminal, ArrowRight, Award, Trophy, MessageSquare
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
  const { xp, level, streak, unlockedBadges, addXp, incrementStreak, unlockBadge, syncUser } = useGamificationStore();

  // 1. Fetch profile info
  const { data: userProfile, isLoading: isUserLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/api/auth/me'),
    enabled: mounted,
  });

  // Sync user store when user loads
  React.useEffect(() => {
    if (userProfile?.data?.data?.id) {
      syncUser(userProfile.data.data.id);
    }
  }, [userProfile, syncUser]);

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

  // 6. Fetch project listings
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
      const { leveledUp } = addXp(50, 'Completed milestone');
      setXpNotify('+50 XP: Milestone Completed');
      setTimeout(() => setXpNotify(null), 3000);
      
      if (unlockedBadges.length === 0) {
        unlockBadge('first_scan');
      }
    },
  });

  const isLoading = !mounted || isUserLoading || isReadinessLoading || isSummaryLoading || isPlannerLoading || isHoursLoading || isProjectsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-[#000000] gap-3">
        <Loader2 className="w-6 h-6 text-[#ffffff] animate-spin" />
        <p className="text-xs font-mono text-[#666666]">INITIALIZING WORKSPACE...</p>
      </div>
    );
  }

  const user = userProfile?.data?.data || {};
  const readiness = readinessData?.data?.data || { overallScore: 0, resumeScore: 0 };
  const summary = summaryData?.data?.data || { streak: 0, codingHours: 0 };
  const planner = plannerData?.data?.data || { goals: [] };
  const projects = projectsResponse?.data?.data || [];
  const hoursDataRaw = studyHoursResponse?.data?.data || [];

  // Mapped stats metrics
  const resumeScoreVal = readiness.resumeScore ? `${Math.round(readiness.resumeScore)}%` : '0%';
  const placementScoreVal = readiness.overallScore ? `${Math.round(readiness.overallScore)}%` : '0%';
  const codingStreakVal = `${summary.streak || 0} Days`;
  const projectsCompletedCount = projects.filter((p: any) => p.status === 'COMPLETED').length;
  const projectsCompletedVal = `${projectsCompletedCount} Project${projectsCompletedCount !== 1 ? 's' : ''}`;

  // Filter study hours chart data
  const formattedHoursData = hoursDataRaw.slice(-7).map((item: any) => ({
    name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    Coding: item.codingHours || 0,
    Practice: item.studyHours || item.codingHours || 0,
  }));

  const chartData = formattedHoursData.length > 0 ? formattedHoursData : [
    { name: 'Mon', Coding: 3.0, Practice: 2.0 },
    { name: 'Tue', Coding: 3.5, Practice: 1.5 },
    { name: 'Wed', Coding: 2.0, Practice: 3.0 },
    { name: 'Thu', Coding: 4.5, Practice: 2.0 },
    { name: 'Fri', Coding: 3.0, Practice: 2.5 },
    { name: 'Sat', Coding: 4.0, Practice: 3.0 },
    { name: 'Sun', Coding: 2.0, Practice: 1.5 },
  ];

  const rawGoals = Array.isArray(planner.goals) ? planner.goals : [];

  // Level name mapping
  const levelNames = ['Novice Candidate', 'ATS Certified', 'DSA Scholar', 'Interview Ready', 'First Mile Fellow'];
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
        output = `[FIRST MILE • ATS AUDIT]\nResume Strength: ${resumeScoreVal}\nIdentified Keyword Focus: "Distributed Systems", "gRPC", "Query Optimization".\nAction: Quantify bullet metrics inside the Resume Analyzer module.`;
      } else if (cmdText.includes('roadmap') || cmdText.includes('dsa')) {
        output = `[FIRST MILE • ROADMAP TARGET]\nDiscipline: ${user.branch || 'CSE'} Target Track.\nCurrent Focus: Dynamic Programming & Graph BFS/DFS.\nConsistency: ${codingStreakVal} active streak.`;
      } else {
        output = `[FIRST MILE • DOSSIER DISPATCH]\nDrafting profile summary for target engineering roles...\n"Candidate currently indexed at ${placementScoreVal} readiness with ${projectsCompletedVal} completed."`;
      }
      setCopilotResult(output);

      let idx = 0;
      const interval = setInterval(() => {
        setStreamedText((prev) => prev + output.charAt(idx));
        idx++;
        if (idx >= output.length) {
          clearInterval(interval);
        }
      }, 8);
    }, 900);
  };

  const handleClaimReward = () => {
    sounds.playChime();
    const { leveledUp } = addXp(150, 'Claimed consistency bonus');
    setXpNotify('+150 XP Bonus Claimed');
    setTimeout(() => setXpNotify(null), 3000);
  };

  return (
    <div className="space-y-6 font-sans select-none">
      
      {/* ─── Rank & XP Status Bar ─── */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Animated XP notifications */}
        <AnimatePresence>
          {xpNotify && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute top-3 right-4 bg-[#ffffff] text-[#000000] px-2.5 py-1 rounded text-[11px] font-mono font-bold z-10"
            >
              {xpNotify}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <div className="w-10 h-10 rounded bg-[#111111] border border-[#242424] flex items-center justify-center text-[#ffffff] shrink-0 font-mono font-bold text-xs">
            0{level}
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono text-[#666666] uppercase tracking-widest block">Preparation Rank</span>
            <h3 className="font-bold text-xs text-[#ffffff] flex items-center gap-1.5 uppercase tracking-wider">
              Level {level} · <span className="text-[#b5b5b5] font-normal">{currentLevelName}</span>
            </h3>
          </div>
        </div>

        {/* Progress bar towards next rank */}
        <div className="flex-1 w-full max-w-md space-y-1.5">
          <div className="flex justify-between text-[9px] font-mono text-[#666666] uppercase tracking-wider">
            <span>XP: {xpInCurrentLevel} / 1000</span>
            <span>{Math.round(progressToNextLevel)}% to Next Rank</span>
          </div>
          <div className="w-full bg-[#121212] border border-[#1a1a1a] rounded-full h-1.5 overflow-hidden">
            <motion.div 
              className="bg-[#ffffff] h-full" 
              style={{ width: `${progressToNextLevel}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleClaimReward}
          className="btn-secondary text-xs py-1.5 px-3.5 w-full md:w-auto"
        >
          Claim Daily XP
        </button>
      </div>

      {/* Greeting & AI Command Terminal */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono text-[#666666] uppercase tracking-wider block">Candidate Command Center</span>
          <h1 className="font-display font-bold text-xl text-[#ffffff]">{user.name || 'Candidate'}</h1>
          <p className="text-xs text-[#888888] font-mono">Class of {user.year || '3rd'} Year · {user.branch || 'Computer Science'}</p>
        </div>

        {/* AI Command Input Bar */}
        <div className="flex-1 max-w-xl bg-[#000000] border border-[#242424] rounded-md p-2.5 space-y-2">
          <div className="flex items-center justify-between text-[9px] font-mono text-[#666666] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-[#ffffff]" />
              <span className="text-[#ffffff]">First Mile Assistant</span>
            </div>
            <span>Ready</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Query workspace: /resume, /roadmap, /dsa..."
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              className="flex-1 bg-transparent border-0 text-xs text-[#ffffff] placeholder-[#444444] focus:ring-0 focus:outline-none font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand(copilotInput)}
            />
            <button
              onClick={() => handleExecuteCommand(copilotInput || 'Audit my resume ATS')}
              disabled={isGenerating}
              className="btn-primary py-1.5 px-3 shrink-0"
              title="Run Assistant Query"
            >
              {isGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin text-current" />
              ) : (
                <Play className="w-3 h-3 fill-current text-current" />
              )}
            </button>
          </div>

          {/* Quick prompt buttons */}
          <div className="flex gap-1.5 pt-1">
            {[
              { label: 'Audit Resume', cmd: 'Audit my resume ATS' },
              { label: 'DSA Targets', cmd: 'Verify my DSA preparation roadmap' },
              { label: 'Profile Summary', cmd: 'Draft engineering profile summary' }
            ].map(btn => (
              <button
                key={btn.label}
                onClick={() => handleExecuteCommand(btn.cmd)}
                className="text-[9px] font-mono text-[#888888] hover:text-[#ffffff] bg-[#0d0d0d] hover:bg-[#141414] border border-[#242424] px-2 py-0.5 rounded transition-colors"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Copilot Terminal Output */}
      <AnimatePresence>
        {(isGenerating || copilotResult) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#050505] border border-[#242424] rounded-md p-4 font-mono text-[11px] text-[#b5b5b5] relative overflow-hidden"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2 py-1">
                <Loader2 className="w-3.5 h-3.5 text-[#ffffff] animate-spin" />
                <span className="text-[#888888] animate-pulse">Evaluating workspace telemetry...</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap leading-relaxed">{streamedText}</pre>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Row: 4 Primary Stats Cards (Pure Monochrome) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Resume Score" 
          value={resumeScoreVal} 
          icon={FileText} 
          subtext="ATS parse benchmark" 
        />
        <StatsCard 
          title="Readiness Index" 
          value={placementScoreVal} 
          icon={GraduationCap} 
          subtext="Placement probability" 
        />
        <StatsCard 
          title="Coding Streak" 
          value={codingStreakVal} 
          icon={Flame} 
          subtext="Consecutive active days" 
        />
        <StatsCard 
          title="Projects Verified" 
          value={projectsCompletedVal} 
          icon={Briefcase} 
          subtext="Completed portfolio items" 
        />
      </div>

      {/* Charts Grid: Radar, Heatmap, and BarChart in Grayscale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkillRadarChart />
        <CodingHeatmap />
        
        {/* Weekly study hours chart */}
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 flex flex-col justify-between h-[340px]">
          <div>
            <h3 className="text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-1">Weekly Engineering Effort</h3>
            <p className="text-[10px] text-[#666666]">Hours allocated across DSA solves & technical practice</p>
          </div>

          <div className="flex-1 w-full min-h-[200px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#666666', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666666', fontSize: 9 }} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ background: '#000000', border: '1px solid #242424', borderRadius: '4px' }}
                  labelStyle={{ color: '#ffffff', fontSize: 10 }}
                  itemStyle={{ fontSize: 10 }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Bar dataKey="Coding" fill="#ffffff" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Practice" fill="#555555" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Action Suggestions, Activities & Planner Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Focus Directives */}
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-[#1a1a1a] pb-2.5">
            <h3 className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">Focus Directives</h3>
          </div>

          <div className="space-y-2.5">
            {[
              { tag: 'Resume', text: 'Quantify metrics on your React portfolio project to raise ATS score.' },
              { tag: 'Coding', text: 'Lagging in Binary Search trees. Log 3 tree questions from Striver A2Z.' },
              { tag: 'Voice Mock', text: 'Pacing average is 155 WPM. Practice STAR structure to stabilize cadence.' }
            ].map((item, i) => (
              <div key={i} className="p-3 rounded bg-[#000000] border border-[#1e1e1e] space-y-1">
                <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider border border-[#333333] text-[#b5b5b5]">
                  {item.tag}
                </span>
                <p className="text-xs text-[#b5b5b5] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-[#1a1a1a] pb-2.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#ffffff]" />
            <h3 className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">Activity Log</h3>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Solved 4 LeetCode Mediums', time: '1 hour ago', desc: 'Graphs: BFS & Topological Sort' },
              { title: 'Completed AI Voice Mock Screen', time: 'Yesterday', desc: 'Score: 8.4 / 10 (STAR Method)' },
              { title: 'Uploaded resume draft v2', time: '2 days ago', desc: 'ATS Score generated: 84%' },
              { title: 'Finished Weekly Milestone Checklist', time: '3 days ago', desc: '100% target achieved' }
            ].map((item, i) => (
              <div key={i} className="flex gap-2.5 text-xs leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ffffff] mt-1.5 shrink-0" />
                <div className="space-y-0.5">
                  <h4 className="font-medium text-[#ffffff]">{item.title}</h4>
                  <p className="text-[10px] font-mono text-[#666666]">{item.desc} · {item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones / Upcoming Tasks */}
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-[#1a1a1a] pb-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-[#888888]" />
            <h3 className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">Upcoming Milestones</h3>
          </div>

          <div className="space-y-2">
            {rawGoals.length > 0 ? (
              rawGoals.slice(0, 4).map((goal: any, i: number) => (
                <div key={i} className="flex items-center gap-2.5 text-xs p-2 bg-[#000000] border border-[#1e1e1e] rounded">
                  <input
                    type="checkbox"
                    checked={goal.completed}
                    onChange={(e) => toggleGoalMutation.mutate({ goalId: goal.id, completed: e.target.checked })}
                    className="w-3.5 h-3.5 bg-[#000000] border border-[#333333] rounded focus:ring-0 cursor-pointer text-[#000000]"
                  />
                  <span className={goal.completed ? 'line-through text-[#555555]' : 'text-[#b5b5b5]'}>{goal.title || goal.t}</span>
                </div>
              ))
            ) : (
              ['Complete 10 Dynamic Programming questions', 'Practice STAR response on System Design mock', 'Publish distributed cache project repo'].map((task, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-[#b5b5b5] p-2 bg-[#000000] border border-[#1e1e1e] rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#888888]" />
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
