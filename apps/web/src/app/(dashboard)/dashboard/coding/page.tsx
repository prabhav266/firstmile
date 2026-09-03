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
  Calendar,
  RefreshCw,
  Github,
  Check,
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
  'bg-[#121212]',
  'bg-[#444444]',
  'bg-[#777777]',
  'bg-[#b5b5b5]',
  'bg-[#ffffff]',
];

const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

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

  const inp = 'w-full bg-[#000000] border border-[#242424] rounded py-2 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff] transition-all placeholder:text-[#444444] font-mono';

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#080808] border border-[#1a1a1a] rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl font-sans"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
          <h2 className="text-sm font-bold text-[#ffffff]">Auto-Sync Coding Profile</h2>
          <button onClick={onClose} className="p-1 rounded text-[#666666] hover:text-[#ffffff]">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#000000] border border-[#1a1a1a] rounded">
            <button
              onClick={() => setSyncType('leetcode')}
              className={`py-1.5 px-3 rounded text-center transition-all ${
                syncType === 'leetcode' ? 'bg-[#ffffff] text-[#000000] font-bold' : 'text-[#888888] hover:text-[#ffffff]'
              }`}
            >
              LeetCode
            </button>
            <button
              onClick={() => setSyncType('github')}
              className={`py-1.5 px-3 rounded text-center transition-all ${
                syncType === 'github' ? 'bg-[#ffffff] text-[#000000] font-bold' : 'text-[#888888] hover:text-[#ffffff]'
              }`}
            >
              GitHub
            </button>
          </div>

          <div>
            <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">
              {syncType === 'leetcode' ? 'LeetCode Handle' : 'GitHub Username'}
            </label>
            <input
              type="text"
              placeholder={syncType === 'leetcode' ? 'e.g. tour_de_code' : 'e.g. torvalds'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSync()}
              className={inp}
            />
          </div>

          <p className="text-[10px] text-[#666666] leading-relaxed">
            First Mile will query {syncType === 'leetcode' ? 'LeetCode GraphQL' : 'GitHub Events'} to auto-populate your verified submission stats and activity heatmaps.
          </p>
        </div>

        <div className="flex gap-2 pt-3 border-t border-[#1a1a1a]">
          <button onClick={onClose} disabled={isPending} className="btn-secondary py-1.5 px-4 text-xs flex-1">
            Cancel
          </button>
          <button onClick={handleSync} disabled={isPending} className="btn-primary py-1.5 px-4 text-xs flex-1">
            {isPending ? 'Syncing...' : 'Sync Profile'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function LogSessionModal({
  onClose,
  onSave,
  isPending,
}: {
  onClose: () => void;
  onSave: (form: ModalForm) => void;
  isPending: boolean;
}) {
  const [platform, setPlatform] = useState('LEETCODE');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [problems, setProblems] = useState('3');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [topic, setTopic] = useState('Dynamic Programming');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ platform, date, problems, difficulty, topic, notes });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#080808] border border-[#1a1a1a] rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl font-sans"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
          <h2 className="text-sm font-bold text-[#ffffff]">Log Coding Problem Session</h2>
          <button onClick={onClose} className="p-1 rounded text-[#666666] hover:text-[#ffffff]">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-2 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              >
                <option value="LEETCODE">LeetCode</option>
                <option value="CODEFORCES">Codeforces</option>
                <option value="CODECHEF">CodeChef</option>
                <option value="STRIVER_A2Z">Striver A2Z</option>
                <option value="NEETCODE">NeetCode</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-2 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Problems Solved</label>
              <input
                type="number"
                min="1"
                value={problems}
                onChange={(e) => setProblems(e.target.value)}
                className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-2 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Topic</label>
            <input
              type="text"
              placeholder="e.g. Dynamic Programming, Graph BFS"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
            />
          </div>

          <div>
            <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Key Takeaways & Complexity</label>
            <textarea
              rows={2}
              placeholder="e.g. Optimized from O(N^2) to O(N log N) using monotonic stack..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
            />
          </div>

          <div className="flex gap-2 pt-3 border-t border-[#1a1a1a]">
            <button type="button" onClick={onClose} className="btn-secondary py-1.5 px-4 text-xs flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn-primary py-1.5 px-4 text-xs flex-1">
              {isPending ? 'Saving...' : 'Save Session'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function CodingTrackerPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Queries
  const { data: statsData } = useQuery({
    queryKey: ['codingStats'],
    queryFn: () => api.get('/api/coding/stats').then((res) => res.data?.data || {}),
  });

  const { data: heatmapData = {} } = useQuery<Record<string, number>>({
    queryKey: ['codingHeatmap'],
    queryFn: () => api.get('/api/coding/heatmap').then((res) => res.data?.data || {}),
  });

  const { data: consistencyData } = useQuery({
    queryKey: ['codingConsistency'],
    queryFn: () => api.get('/api/analytics/consistency').then((res) => res.data?.data || {}),
  });

  const { data: problemsData = [] } = useQuery<any[]>({
    queryKey: ['codingProblems', activeTab],
    queryFn: () =>
      api
        .get('/api/coding/problems', {
          params: { platform: activeTab !== 'All' ? activeTab.toUpperCase() : undefined },
        })
        .then((res) => res.data?.data || []),
  });

  // Mutations
  const logMutation = useMutation({
    mutationFn: (data: any) => api.post('/api/coding/problems', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codingStats'] });
      queryClient.invalidateQueries({ queryKey: ['codingHeatmap'] });
      queryClient.invalidateQueries({ queryKey: ['codingProblems'] });
      sounds.playToggle();
      toast.success('Session logged successfully');
      setShowModal(false);
    },
    onError: () => toast.error('Failed to log session'),
  });

  const syncLeetCodeMutation = useMutation({
    mutationFn: (username: string) => api.post('/api/coding/sync/leetcode', { username }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codingStats'] });
      queryClient.invalidateQueries({ queryKey: ['codingHeatmap'] });
      sounds.playChime();
      toast.success('LeetCode profile synced successfully');
      setShowSyncModal(false);
    },
    onError: () => toast.error('Failed to sync LeetCode profile'),
  });

  const syncGitHubMutation = useMutation({
    mutationFn: (username: string) => api.post('/api/coding/sync/github', { username }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codingStats'] });
      queryClient.invalidateQueries({ queryKey: ['codingHeatmap'] });
      sounds.playChime();
      toast.success('GitHub profile synced successfully');
      setShowSyncModal(false);
    },
    onError: () => toast.error('Failed to sync GitHub profile'),
  });

  const totalSolved = statsData?.totalSolved || 0;
  const easy = statsData?.easy || 0;
  const medium = statsData?.medium || 0;
  const hard = statsData?.hard || 0;
  const currentStreak = consistencyData?.currentStreak || 0;

  const getCellDate = (col: number, row: number) => {
    const d = new Date();
    const daysAgo = (27 - col) * 7 + (6 - row);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl">
      {/* Header */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block mb-1">
            Algorithmic Rigor
          </span>
          <h1 className="font-display font-bold text-2xl text-[#ffffff] tracking-tight">
            Coding & DSA Tracker
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-0.5">
            Verified problem logs across LeetCode, Striver A2Z & Codeforces
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#000000] border border-[#242424] text-[#ffffff]">
            <Flame size={13} className="text-[#ffffff]" />
            <span>{currentStreak} Days Streak</span>
          </div>

          <button onClick={() => setShowSyncModal(true)} className="btn-secondary py-1.5 px-3 gap-1.5">
            <RefreshCw size={13} />
            <span>Auto-Sync</span>
          </button>

          <button onClick={() => setShowModal(true)} className="btn-primary py-1.5 px-4 gap-1.5">
            <Plus size={13} />
            <span>Log Problem</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 font-mono">
          <span className="text-[10px] text-[#666666] uppercase block">Total Solved</span>
          <span className="text-2xl font-bold font-display text-[#ffffff]">{totalSolved}</span>
        </div>
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 font-mono">
          <span className="text-[10px] text-[#666666] uppercase block">Easy</span>
          <span className="text-2xl font-bold font-display text-[#ffffff]">{easy}</span>
        </div>
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 font-mono">
          <span className="text-[10px] text-[#666666] uppercase block">Medium</span>
          <span className="text-2xl font-bold font-display text-[#ffffff]">{medium}</span>
        </div>
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 font-mono">
          <span className="text-[10px] text-[#666666] uppercase block">Hard</span>
          <span className="text-2xl font-bold font-display text-[#ffffff]">{hard}</span>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-[#888888]">
            <Calendar size={13} />
            <span className="uppercase tracking-wider">196-Day Submission Calendar</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-[#666666]">
            <span>Less</span>
            {HEATMAP_COLORS.map((c, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-xs ${c}`} />
            ))}
            <span>More</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto py-2">
          <div className="flex flex-col gap-1 pt-0.5 text-[9px] font-mono text-[#666666] w-6">
            {DAY_LABELS.map((d, i) => (
              <div key={i} className="h-3 flex items-center">{d}</div>
            ))}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 28 }).map((_, col) => (
              <div key={col} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, row) => {
                  const cellDate = isMounted ? getCellDate(col, row) : '';
                  const solvedCount = isMounted ? heatmapData[cellDate] || 0 : 0;
                  let level = 0;
                  if (solvedCount > 0) {
                    if (solvedCount <= 2) level = 1;
                    else if (solvedCount <= 4) level = 2;
                    else if (solvedCount <= 7) level = 3;
                    else level = 4;
                  }
                  return (
                    <div
                      key={row}
                      className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 cursor-pointer ${HEATMAP_COLORS[level]}`}
                      title={isMounted ? `${cellDate}: ${solvedCount} problems` : ''}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Mastery Distribution */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4">
        <h3 className="text-xs font-bold font-mono text-[#888888] uppercase tracking-wider">Topic Mastery Benchmarks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOPIC_BENCHMARKS.map((topic) => {
            const solvedInTopic = problemsData.filter((p) =>
              topic.keywords.some((kw) => (p.topic || '').toLowerCase().includes(kw))
            ).reduce((acc, p) => acc + (p.problemsSolved || 1), 0);
            const pct = Math.min(100, Math.round((solvedInTopic / topic.total) * 100));

            return (
              <div key={topic.name} className="bg-[#000000] border border-[#1e1e1e] p-3.5 rounded space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#ffffff] font-medium">{topic.name}</span>
                  <span className="text-[#888888]">{solvedInTopic}/{topic.total}</span>
                </div>
                <div className="w-full bg-[#121212] rounded-full h-1 overflow-hidden">
                  <div className="bg-[#ffffff] h-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sync Modal */}
      {showSyncModal && (
        <SyncProfileModal
          onClose={() => setShowSyncModal(false)}
          onSyncLeetCode={(u) => syncLeetCodeMutation.mutate(u)}
          onSyncGitHub={(u) => syncGitHubMutation.mutate(u)}
          isPending={syncLeetCodeMutation.isPending || syncGitHubMutation.isPending}
        />
      )}

      {/* Log Modal */}
      {showModal && (
        <LogSessionModal
          onClose={() => setShowModal(false)}
          onSave={(f) => logMutation.mutate(f)}
          isPending={logMutation.isPending}
        />
      )}
    </div>
  );
}
