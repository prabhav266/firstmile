'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Flame,
  Plus,
  X,
  Code2,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Zap,
  Calendar,
  BarChart3,
  BookOpen,
  RefreshCw,
  Github,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sounds } from '@/lib/sounds';

interface ModalForm {
  platform: string;
  date: string;
  problems: string;
  difficulty: string;
  topic: string;
  notes: string;
}

const PLATFORMS = ['All', 'LeetCode', 'Codeforces', 'CodeChef', 'Striver A2Z', 'NeetCode'];

const TOPIC_BENCHMARKS = [
  { name: 'Arrays & Hashing', total: 100, keywords: ['array', 'hash', 'map', 'two pointer', 'sliding window'] },
  { name: 'Trees & BST', total: 80, keywords: ['tree', 'bst', 'trie', 'traversal'] },
  { name: 'Dynamic Programming', total: 90, keywords: ['dp', 'dynamic', 'memoization', 'knapsack'] },
  { name: 'Graphs & BFS/DFS', total: 70, keywords: ['graph', 'bfs', 'dfs', 'dijkstra', 'union'] },
  { name: 'Strings & Two Pointers', total: 75, keywords: ['string', 'palindrome', 'substring', 'anagram'] },
  { name: 'Math & Bit Manipulation', total: 60, keywords: ['math', 'bit', 'bitwise', 'geometry', 'matrix'] },
];

const HEATMAP_COLORS = [
  'bg-[#111827]',
  'bg-[#3b82f6]/20',
  'bg-[#3b82f6]/50',
  'bg-[#3b82f6]/80',
  'bg-[#3b82f6]',
];

const PLATFORM_BADGE_COLORS: Record<string, string> = {
  LeetCode: 'text-[#f59e0b] bg-[#f59e0b]/10',
  Codeforces: 'text-[#ef4444] bg-[#ef4444]/10',
  CodeChef: 'text-[#22c55e] bg-[#22c55e]/10',
  'Striver A2Z': 'text-[#3b82f6] bg-[#3b82f6]/10',
  NeetCode: 'text-[#8b5cf6] bg-[#8b5cf6]/10',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'text-[#22c55e] bg-[#22c55e]/10',
  Medium: 'text-[#f59e0b] bg-[#f59e0b]/10',
  Hard: 'text-[#ef4444] bg-[#ef4444]/10',
  Mixed: 'text-[#3b82f6] bg-[#3b82f6]/10',
};

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

const formatPlatform = (p: string) => {
  const mapping: Record<string, string> = {
    LEETCODE: 'LeetCode',
    CODEFORCES: 'Codeforces',
    CODECHEF: 'CodeChef',
    STRIVER_A2Z: 'Striver A2Z',
    NEETCODE: 'NeetCode',
  };
  return mapping[p] || p;
};

const formatDifficulty = (d: string) => {
  const mapping: Record<string, string> = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
  };
  return mapping[d] || d;
};

function SyncProfileModal({
  onClose,
  onSyncLeetCode,
  onSyncGitHub,
  isPending,
}: {
  onClose: () => void;
  onSyncLeetCode: (username: string) => void;
  onSyncGitHub: (username: string) => void;
  isPending: boolean;
}) {
  const [syncType, setSyncType] = useState<'leetcode' | 'github'>('leetcode');
  const [username, setUsername] = useState('');

  const inp = 'w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-4 text-sm text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] transition-all placeholder:text-[#94A3B8]/40';

  const handleSync = () => {
    if (!username.trim()) {
      toast.error('Please enter a valid username');
      return;
    }
    if (syncType === 'leetcode') {
      onSyncLeetCode(username.trim());
    } else {
      onSyncGitHub(username.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        className="bg-[#1f2937] border border-[#8b5cf6]/30 rounded-2xl p-6 w-full max-w-md relative shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center text-[#8b5cf6]">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[#F9FAFB] font-semibold text-base">Auto-Sync Profile</h3>
              <p className="text-[#94A3B8] text-xs">Fetch live stats via API pipelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#111827] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#94A3B8] hover:text-[#F9FAFB] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSyncType('leetcode')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                syncType === 'leetcode'
                  ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                  : 'bg-[#111827] border-transparent text-[#94A3B8]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>LeetCode API</span>
            </button>
            <button
              onClick={() => setSyncType('github')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                syncType === 'github'
                  ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                  : 'bg-[#111827] border-transparent text-[#94A3B8]'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub API</span>
            </button>
          </div>

          <div>
            <label className="text-xs text-[#94A3B8] mb-1.5 block font-semibold">
              Enter {syncType === 'leetcode' ? 'LeetCode' : 'GitHub'} Username
            </label>
            <input
              type="text"
              placeholder={syncType === 'leetcode' ? 'e.g. neal_wu' : 'e.g. torvalds'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSync()}
              className={inp}
            />
          </div>

          <p className="text-[10px] text-[#94A3B8] leading-relaxed">
            PathForge AI will query {syncType === 'leetcode' ? 'LeetCode GraphQL API' : 'GitHub Events API'} to auto-populate your verified submission stats and activity heatmaps in real-time.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={isPending} className="flex-1 py-2.5 px-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111827] text-[#94A3B8] text-sm font-semibold hover:text-[#F9FAFB] transition-all">
            Cancel
          </button>
          <button onClick={handleSync} disabled={isPending} className="flex-1 bg-[#8b5cf6] text-white rounded-xl py-2.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#7c3aed] transition-all disabled:opacity-50">
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Syncing...
              </>
            ) : (
              'Sync Profile'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function LogSessionModal({
  onClose,
  onSave,
  isPending,
}: {
  onClose: () => void;
  onSave: (f: ModalForm) => void;
  isPending: boolean;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<ModalForm>({
    platform: 'LeetCode',
    date: today,
    problems: '',
    difficulty: 'Medium',
    topic: '',
    notes: '',
  });

  const inp = 'w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-4 text-sm text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all placeholder:text-[#94A3B8]/40';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/85 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-[#3b82f6]" />
            </div>
            <div>
              <h3 className="text-[#F9FAFB] font-semibold text-base font-sans">Log Coding Session</h3>
              <p className="text-[#94A3B8] text-xs font-sans">Track your progress</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[12px] bg-[#111827] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#94A3B8] hover:text-[#F9FAFB] hover:border-[#3b82f6]/50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#94A3B8] mb-1.5 block font-semibold font-sans">Platform</label>
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className={inp}>
                {PLATFORMS.filter((p) => p !== 'All').map((p) => (
                  <option key={p} value={p} className="bg-[#111827] text-[#F9FAFB]">{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#94A3B8] mb-1.5 block font-semibold font-sans">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inp} style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#94A3B8] mb-1.5 block font-semibold font-sans">Problems Solved</label>
              <input type="number" min={1} placeholder="e.g. 5" value={form.problems} onChange={(e) => setForm({ ...form, problems: e.target.value })} className={inp} />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8] mb-1.5 block font-semibold font-sans">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={inp}>
                {['Easy', 'Medium', 'Hard', 'Mixed'].map((d) => (
                  <option key={d} value={d} className="bg-[#111827] text-[#F9FAFB]">{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#94A3B8] mb-1.5 block font-semibold font-sans">Topic / Tag</label>
            <input type="text" placeholder="e.g. Binary Search, Trees, DP…" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className={inp} />
          </div>

          <div>
            <label className="text-xs text-[#94A3B8] mb-1.5 block font-semibold font-sans">Notes (optional)</label>
            <textarea rows={3} placeholder="Any insights, problems to revisit…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inp} resize-none`} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} disabled={isPending} className="flex-1 py-2.5 px-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111827] text-[#94A3B8] text-sm font-semibold hover:border-[rgba(255,255,255,0.15)] hover:text-[#F9FAFB] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
          <button onClick={() => onSave(form)} disabled={isPending} className="flex-1 bg-[#3b82f6] text-white rounded-xl py-2.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#2563eb] active:bg-[#1d4ed8] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Session'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, delay }: { label: string; value: number | string; icon: React.ElementType; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 flex items-center gap-4"
    >
      <div className="w-11 h-11 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[#3b82f6]" />
      </div>
      <div>
        <p className="text-[#94A3B8] text-xs font-medium mb-0.5">{label}</p>
        <p className="text-[#F9FAFB] text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}

export default function CodingTrackerPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logsQuery = useQuery({
    queryKey: ['codingLogs', activeTab],
    queryFn: () => api.get(`/api/coding/logs?platform=${activeTab === 'All' ? '' : activeTab}`)
  });

  const statsQuery = useQuery({
    queryKey: ['codingStats'],
    queryFn: () => api.get('/api/coding/stats')
  });

  const heatmapQuery = useQuery({
    queryKey: ['codingHeatmap'],
    queryFn: () => api.get('/api/coding/heatmap')
  });

  const consistencyQuery = useQuery({
    queryKey: ['codingConsistency'],
    queryFn: () => api.get('/api/analytics/consistency')
  });

  const logMutation = useMutation({
    mutationFn: (data: {
      platform: string;
      problemsSolved: number;
      difficulty: string;
      topic: string;
      notes?: string;
      date?: string;
    }) => api.post('/api/coding/logs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codingLogs'] });
      queryClient.invalidateQueries({ queryKey: ['codingStats'] });
      queryClient.invalidateQueries({ queryKey: ['codingHeatmap'] });
      queryClient.invalidateQueries({ queryKey: ['codingConsistency'] });
      sounds.playChime();
      toast.success('Coding session logged!');
      setShowModal(false);
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to log session';
      toast.error(errorMsg);
    }
  });

  const syncLeetCodeMutation = useMutation({
    mutationFn: (username: string) => api.post('/api/coding/sync-leetcode', { username }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['codingLogs'] });
      queryClient.invalidateQueries({ queryKey: ['codingStats'] });
      queryClient.invalidateQueries({ queryKey: ['codingHeatmap'] });
      queryClient.invalidateQueries({ queryKey: ['codingConsistency'] });
      sounds.playChime();
      const msg = res.data?.message || 'Synced LeetCode profile!';
      toast.success(msg);
      setShowSyncModal(false);
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || 'Failed to sync LeetCode profile';
      toast.error(errorMsg);
    }
  });

  const syncGitHubMutation = useMutation({
    mutationFn: (username: string) => api.post('/api/coding/sync-github', { username }),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['codingLogs'] });
      queryClient.invalidateQueries({ queryKey: ['codingStats'] });
      queryClient.invalidateQueries({ queryKey: ['codingHeatmap'] });
      queryClient.invalidateQueries({ queryKey: ['codingConsistency'] });
      sounds.playChime();
      const msg = res.data?.message || 'Synced GitHub commits!';
      toast.success(msg);
      setShowSyncModal(false);
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.message || 'Failed to sync GitHub profile';
      toast.error(errorMsg);
    }
  });

  const isLoading = logsQuery.isLoading || statsQuery.isLoading || heatmapQuery.isLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#94A3B8] text-sm font-medium animate-pulse">Loading your coding journey...</p>
      </div>
    );
  }

  const totalSolved = statsQuery.data?.data?.data?.totalSolved || 0;
  const difficultyDistribution = statsQuery.data?.data?.data?.difficultyDistribution || {};

  const easy = difficultyDistribution.EASY || 0;
  const medium = difficultyDistribution.MEDIUM || 0;
  const hard = difficultyDistribution.HARD || 0;

  const easyPct = totalSolved > 0 ? Math.round((easy / totalSolved) * 100) : 0;
  const mediumPct = totalSolved > 0 ? Math.round((medium / totalSolved) * 100) : 0;
  const hardPct = totalSolved > 0 ? Math.round((hard / totalSolved) * 100) : 0;

  const logs = logsQuery.data?.data?.data || [];
  const heatmapData = heatmapQuery.data?.data?.data || {};
  const currentStreak = consistencyQuery.data?.data?.data?.currentStreak || 0;

  // Dynamically compute topic breakdown based on real logged problems
  const dynamicTopics = TOPIC_BENCHMARKS.map((topicDef) => {
    let count = 0;
    for (const log of logs) {
      const topicLower = (log.topic || '').toLowerCase();
      const matched = topicDef.keywords.some((kw) => topicLower.includes(kw));
      if (matched) {
        count += log.problemsSolved || 0;
      }
    }
    // If user has general synced problems without specific topic tag, allocate proportional progress
    if (count === 0 && totalSolved > 0) {
      if (topicDef.name === 'Arrays & Hashing') count = Math.min(topicDef.total, Math.round(totalSolved * 0.35));
      else if (topicDef.name === 'Trees & BST') count = Math.min(topicDef.total, Math.round(totalSolved * 0.2));
      else if (topicDef.name === 'Dynamic Programming') count = Math.min(topicDef.total, Math.round(totalSolved * 0.15));
      else if (topicDef.name === 'Graphs & BFS/DFS') count = Math.min(topicDef.total, Math.round(totalSolved * 0.12));
      else if (topicDef.name === 'Strings & Two Pointers') count = Math.min(topicDef.total, Math.round(totalSolved * 0.1));
      else count = Math.min(topicDef.total, Math.round(totalSolved * 0.08));
    }
    return {
      name: topicDef.name,
      done: count,
      total: topicDef.total,
    };
  });

  const getCellDate = (col: number, row: number) => {
    const d = new Date();
    const daysAgo = (27 - col) * 7 + (6 - row);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const handleSaveSession = (form: ModalForm) => {
    if (!form.problems || parseInt(form.problems, 10) <= 0) {
      toast.error('Please enter a valid number of problems solved');
      return;
    }
    logMutation.mutate({
      platform: form.platform,
      problemsSolved: parseInt(form.problems, 10),
      difficulty: form.difficulty,
      topic: form.topic,
      notes: form.notes,
      date: form.date,
    });
  };

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <LogSessionModal
            onClose={() => setShowModal(false)}
            onSave={handleSaveSession}
            isPending={logMutation.isPending}
          />
        )}
        {showSyncModal && (
          <SyncProfileModal
            onClose={() => setShowSyncModal(false)}
            onSyncLeetCode={(username) => syncLeetCodeMutation.mutate(username)}
            onSyncGitHub={(username) => syncGitHubMutation.mutate(username)}
            isPending={syncLeetCodeMutation.isPending || syncGitHubMutation.isPending}
          />
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-[#0F172A] p-6 space-y-6 font-sans">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center">
              <Code2 className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F9FAFB] font-sans">Coding Tracker</h1>
              <p className="text-[#94A3B8] text-sm font-sans">Monitor your competitive programming journey</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-full px-4 py-2">
              <Flame className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]/20" />
              <span className="text-[#f59e0b] text-sm font-semibold">{currentStreak} day streak</span>
            </div>

            <button
              onClick={() => setShowSyncModal(true)}
              className="bg-[#18181b] border border-[#8b5cf6]/40 hover:border-[#8b5cf6] text-[#8b5cf6] hover:text-white rounded-xl py-2.5 px-4 font-semibold text-sm flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(139,92,246,0.2)]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Auto-Sync Profile</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white rounded-xl py-2.5 px-5 font-semibold text-sm flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Session</span>
            </button>
          </div>
        </header>

        {/* Platform Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {PLATFORMS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1f2937] border-[rgba(255,255,255,0.12)] text-[#F9FAFB]'
                    : 'bg-[#111827] border-transparent text-[#94A3B8] hover:bg-[#1f2937] hover:text-[#F9FAFB]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Coding statistics">
          <StatCard label="Total Problems" value={totalSolved} icon={Code2} delay={0.05} />
          <StatCard label="Easy" value={easy} icon={CheckCircle2} delay={0.1} />
          <StatCard label="Medium" value={medium} icon={TrendingUp} delay={0.15} />
          <StatCard label="Hard" value={hard} icon={AlertCircle} delay={0.2} />
        </section>

        {/* Heatmap */}
        <section className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6" aria-label="Activity heatmap">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#3b82f6]" />
              <h2 className="text-[#F9FAFB] font-semibold text-sm font-sans">Activity Heatmap</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#94A3B8] text-xs">Less</span>
              {[0, 1, 2, 3, 4].map((lvl) => (
                <div key={lvl} className={`w-3 h-3 rounded-full ${HEATMAP_COLORS[lvl]}`} />
              ))}
              <span className="text-[#94A3B8] text-xs">More</span>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col gap-0.5 pt-0">
              {DAY_LABELS.map((d, i) => (
                <div key={i} className="h-3.5 text-[#94A3B8] text-[10px] flex items-center w-6">{d}</div>
              ))}
            </div>
            <div className="flex gap-0.5 overflow-x-auto">
              {Array.from({ length: 28 }).map((_, col) => (
                <div key={col} className="flex flex-col gap-0.5">
                  {Array.from({ length: 7 }).map((_, row) => {
                    const cellDate = isMounted ? getCellDate(col, row) : '';
                    const solvedCount = isMounted ? (heatmapData[cellDate] || 0) : 0;
                    let level = 0;
                    if (solvedCount > 0) {
                      if (solvedCount <= 2) level = 1;
                      else if (solvedCount <= 4) level = 2;
                      else if (solvedCount <= 7) level = 3;
                      else level = 4;
                    }
                    return (
                      <motion.div
                        key={row}
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 0.1 }}
                        className={`w-3.5 h-3.5 rounded-[2px] cursor-pointer ${HEATMAP_COLORS[level]}`}
                        title={isMounted ? `${cellDate}: ${solvedCount} problems` : ''}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Difficulty + Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6" aria-label="Difficulty distribution">
            <div className="flex items-center gap-3 mb-5">
              <BarChart3 className="w-4 h-4 text-[#3b82f6]" />
              <h2 className="text-[#F9FAFB] font-semibold text-sm font-sans">Difficulty Distribution</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Easy', count: easy, color: '#22c55e', pct: easyPct },
                { label: 'Medium', count: medium, color: '#f59e0b', pct: mediumPct },
                { label: 'Hard', count: hard, color: '#ef4444', pct: hardPct },
              ].map(({ label, count, color, pct }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[#CBD5E1] text-sm font-sans">{label}</span>
                    <div className="flex items-center gap-3 font-sans">
                      <span className="text-[#94A3B8] text-xs">{count} problems</span>
                      <span className="text-[#F9FAFB] text-sm font-semibold w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1 bg-[#111827] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full" style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-around">
              {[
                { label: 'Easy', color: '#22c55e', pct: easyPct },
                { label: 'Medium', color: '#f59e0b', pct: mediumPct },
                { label: 'Hard', color: '#ef4444', pct: hardPct },
              ].map(({ label, color, pct }) => (
                <div key={label} className="flex items-center gap-2 font-sans">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[#94A3B8] text-xs">{label} {pct}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6" aria-label="Topic progress">
            <div className="flex items-center gap-3 mb-5">
              <BookOpen className="w-4 h-4 text-[#8b5cf6]" />
              <h2 className="text-[#F9FAFB] font-semibold text-sm font-sans">Topic Progress</h2>
            </div>
            <div className="space-y-3.5">
              {dynamicTopics.map(({ name, done, total }, i) => {
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#CBD5E1] text-sm font-sans">{name}</span>
                      <div className="flex items-center gap-2 font-sans">
                        <span className="text-[#94A3B8] text-xs">{done}/{total}</span>
                        <span className="text-[#F9FAFB] text-xs font-semibold w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1 bg-[#111827] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Recent Logs */}
        <section className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6" aria-label="Recent coding sessions">
          <div className="flex items-center gap-3 mb-5">
            <Zap className="w-4 h-4 text-[#3b82f6]" />
            <h2 className="text-[#F9FAFB] font-semibold text-sm font-sans">Recent Sessions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[#111827]">
                  {['Date', 'Platform', 'Problems', 'Difficulty', 'Topic'].map((col) => (
                    <th key={col} className="text-left text-[#94a3b8] text-[10px] tracking-wider uppercase font-semibold py-3 px-4">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#94A3B8] text-sm font-sans">
                      No coding sessions logged yet. Click &quot;Log Session&quot; or &quot;Auto-Sync Profile&quot; to start tracking!
                    </td>
                  </tr>
                ) : (
                  logs.map((log: any, i: number) => {
                    const displayPlatform = formatPlatform(log.platform);
                    const displayDifficulty = formatDifficulty(log.difficulty);
                    return (
                      <motion.tr
                        key={log.id || i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.03, duration: 0.2, ease: 'easeOut' }}
                        className="border-b border-[rgba(255,255,255,0.08)] last:border-0 hover:bg-[#111827]/40 transition-colors"
                      >
                        <td className="py-3 px-4 text-[#CBD5E1] text-xs font-sans">
                          {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ${PLATFORM_BADGE_COLORS[displayPlatform] ?? 'text-[#CBD5E1] bg-[#111827]'}`}>
                            {displayPlatform}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#F9FAFB] text-xs font-semibold font-sans">{log.problemsSolved}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ${DIFFICULTY_COLORS[displayDifficulty] || 'text-[#CBD5E1] bg-[#111827]'}`}>
                            {displayDifficulty}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#CBD5E1] text-xs font-sans">{log.topic}</td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
