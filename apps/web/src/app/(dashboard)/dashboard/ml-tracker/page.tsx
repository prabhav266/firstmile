'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Plus,
  X,
  Clock,
  ExternalLink,
  Zap,
  BookOpen,
  BarChart3,
  Play,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Course {
  id: string;
  name: string;
  platform: string;
  progress: number;
  hours: number;
  lastSession: string | null;
  color: string;
  icon: string;
}

interface MLLog {
  id: string;
  userId: string;
  course: string;
  date: string;
  hoursSpent: number;
  topicCovered: string | null;
  notebookUrl: string | null;
  projectName: string | null;
}

const COURSE_CONFIGS: Record<
  string,
  { name: string; platform: string; color: string; icon: string; targetHours: number }
> = {
  ANDREW_NG: {
    name: 'Machine Learning Specialization',
    platform: 'Coursera - Andrew Ng',
    color: '#3b82f6',
    icon: '🤖',
    targetHours: 40,
  },
  CAMPUSX: {
    name: 'Deep Learning Bootcamp',
    platform: 'CampusX YouTube',
    color: '#8b5cf6',
    icon: '🧠',
    targetHours: 30,
  },
  KAGGLE: {
    name: 'Kaggle ML Courses',
    platform: 'Kaggle',
    color: '#22c55e',
    icon: '🏆',
    targetHours: 20,
  },
  FAST_AI: {
    name: 'Practical Deep Learning',
    platform: 'Fast.ai',
    color: '#f59e0b',
    icon: '⚡',
    targetHours: 30,
  },
  CUSTOM: {
    name: 'Custom ML Project / Other',
    platform: 'Self-Directed',
    color: '#ec4899',
    icon: '🚀',
    targetHours: 25,
  },
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
interface MLLogModalProps {
  onClose: () => void;
  onSave: (data: {
    course: string;
    hoursSpent: number;
    topicCovered: string | null;
    notebookUrl: string | null;
    projectName: string | null;
  }) => void;
  isPending: boolean;
  selectedCourse: string;
}

function MLLogModal({ onClose, onSave, isPending, selectedCourse }: MLLogModalProps) {
  const [form, setForm] = useState({
    course: selectedCourse,
    hoursSpent: '',
    topicCovered: '',
    notebookUrl: '',
    projectName: '',
  });

  const inp = 'w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-4 text-sm text-[#F9FAFB] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-all placeholder:text-[#94A3B8]/50 font-sans';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 8 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-[#1F2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 w-full max-w-lg relative font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#3b82f6]" />
            </div>
            <div>
              <h3 className="text-[#F9FAFB] font-semibold text-base">Log ML Session</h3>
              <p className="text-[#94A3B8] text-xs">Record your learning progress</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#111827] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#94A3B8] hover:text-[#F9FAFB] hover:border-[#3b82f6]/50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Course */}
          <div>
            <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">Course</label>
            <select
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              className={inp}
            >
              {Object.entries(COURSE_CONFIGS).map(([key, config]) => (
                <option key={key} value={key} className="bg-[#111827]">
                  {config.name}
                </option>
              ))}
            </select>
          </div>

          {/* Hours + Topic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">Hours Spent</label>
              <input
                type="number"
                min={0.5}
                step={0.5}
                placeholder="e.g. 2"
                value={form.hoursSpent}
                onChange={(e) => setForm({ ...form, hoursSpent: e.target.value })}
                className={inp}
              />
            </div>
            <div>
              <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">Topic Covered</label>
              <input
                type="text"
                placeholder="e.g. CNNs, Gradient Descent"
                value={form.topicCovered}
                onChange={(e) => setForm({ ...form, topicCovered: e.target.value })}
                className={inp}
              />
            </div>
          </div>

          {/* Notebook URL */}
          <div>
            <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">Notebook URL (optional)</label>
            <input
              type="url"
              placeholder="https://colab.research.google.com/…"
              value={form.notebookUrl}
              onChange={(e) => setForm({ ...form, notebookUrl: e.target.value })}
              className={inp}
            />
          </div>

          {/* Project Name */}
          <div>
            <label className="text-xs text-[#94A3B8] mb-1.5 block font-medium">Project Name (optional)</label>
            <input
              type="text"
              placeholder="e.g. House Price Prediction"
              value={form.projectName}
              onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              className={inp}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111827] text-[#94A3B8] text-sm font-medium hover:border-[#94A3B8]/30 hover:text-[#F9FAFB] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!form.hoursSpent) {
                toast.error('Please enter hours spent');
                return;
              }
              onSave({
                course: form.course,
                hoursSpent: Number(form.hoursSpent),
                topicCovered: form.topicCovered || null,
                notebookUrl: form.notebookUrl || null,
                projectName: form.projectName || null,
              });
            }}
            disabled={isPending}
            className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white rounded-xl py-2.5 px-4 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
          >
            {isPending ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Save Session'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course, delay, onLog }: { course: Course; delay: number; onLog: () => void }) {
  const formatLastSession = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 flex flex-col gap-4 font-sans"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: `${course.color}18` }}
          >
            {course.icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-[#F9FAFB] font-semibold text-sm leading-tight truncate max-w-[180px]">
              {course.name}
            </h3>
            <p className="text-[#94A3B8] text-xs mt-0.5">{course.platform}</p>
          </div>
        </div>
        <div
          className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-lg"
          style={{ background: `${course.color}18`, color: course.color }}
        >
          {course.progress}%
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-1 bg-[#111827] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${course.progress}%` }}
            transition={{ delay: delay + 0.15, duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-[#8b5cf6]"
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-[#94A3B8]">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span>{course.hours}h logged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
          <span>Last: {formatLastSession(course.lastSession)}</span>
        </div>
      </div>

      {/* Log button */}
      <button
        onClick={onLog}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111827] text-[#CBD5E1] text-xs font-semibold hover:border-[#3b82f6]/50 hover:text-[#F9FAFB] hover:bg-[#3b82f6]/10 transition-colors"
      >
        <Play className="w-3.5 h-3.5 text-[#3b82f6]" />
        Log Session
      </button>
    </motion.div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function MLTrackerPage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('ANDREW_NG');
  const queryClient = useQueryClient();

  // Queries
  const logsQuery = useQuery({
    queryKey: ['mlLogs'],
    queryFn: async () => {
      const res = await api.get('/api/ml-logs');
      return res.data;
    },
  });

  const statsQuery = useQuery({
    queryKey: ['mlStats'],
    queryFn: async () => {
      const res = await api.get('/api/ml-logs/stats');
      return res.data;
    },
  });

  // Mutation
  const logSessionMutation = useMutation({
    mutationFn: (data: {
      course: string;
      hoursSpent: number;
      topicCovered: string | null;
      notebookUrl: string | null;
      projectName: string | null;
    }) => api.post('/api/ml-logs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlLogs'] });
      queryClient.invalidateQueries({ queryKey: ['mlStats'] });
      toast.success('ML session logged!');
      setShowModal(false);
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'Failed to log ML session';
      toast.error(errorMsg);
    },
  });

  if (logsQuery.isLoading || statsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4 font-sans">
        <div className="w-12 h-12 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#94A3B8] text-sm animate-pulse font-medium">Loading ML learning data...</p>
      </div>
    );
  }

  if (logsQuery.isError || statsQuery.isError) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center gap-4 font-sans">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 font-semibold text-lg">
          ⚠️
        </div>
        <p className="text-[#F9FAFB] text-base font-semibold">Failed to load tracker data</p>
        <button
          onClick={() => {
            logsQuery.refetch();
            statsQuery.refetch();
          }}
          className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-sm font-semibold transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const logs: MLLog[] = logsQuery.data?.data || [];
  const stats = statsQuery.data?.data;

  // Process course stats from database records
  const courses: Course[] = Object.entries(COURSE_CONFIGS).map(([key, config]) => {
    const hours =
      stats?.courseBreakdown?.[key] ??
      logs.filter((l) => l.course === key).reduce((sum, l) => sum + l.hoursSpent, 0);

    const courseLogs = logs.filter((l) => l.course === key);
    const lastSession = courseLogs.length > 0 ? courseLogs[0].date : null;
    const progress = Math.min(100, Math.round((hours / config.targetHours) * 100));

    return {
      id: key,
      name: config.name,
      platform: config.platform,
      progress,
      hours,
      lastSession,
      color: config.color,
      icon: config.icon,
    };
  });

  const totalHours = stats?.totalHours ?? logs.reduce((sum, l) => sum + l.hoursSpent, 0);
  const activeCoursesCount = courses.filter((c) => c.hours > 0).length;
  const avgProgress =
    courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length) : 0;

  // Generate last 7 days of hours aggregation dynamically
  const dailyHoursData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toDateString();

    const hours = logs
      .filter((l) => new Date(l.date).toDateString() === dateStr)
      .reduce((sum, l) => sum + l.hoursSpent, 0);

    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      hours,
    };
  });

  const thisWeekHours = dailyHoursData.reduce((sum, d) => sum + d.hours, 0);
  const maxHours = Math.max(...dailyHoursData.map((d) => d.hours), 1);

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <MLLogModal
            selectedCourse={selectedCourse}
            isPending={logSessionMutation.isPending}
            onClose={() => setShowModal(false)}
            onSave={(data) => logSessionMutation.mutate(data)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[#0F172A] p-6 space-y-6 font-sans">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F9FAFB]">ML Learning Tracker</h1>
              <p className="text-[#94A3B8] text-sm">Track courses, notebooks & ML milestones</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Total hours badge */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
              className="flex items-center gap-2 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-full px-4 py-2"
            >
              <Clock className="w-4 h-4 text-[#3b82f6]" />
              <span className="text-[#3b82f6] text-sm font-semibold">{totalHours}h total</span>
            </motion.div>

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
              onClick={() => {
                setSelectedCourse('ANDREW_NG');
                setShowModal(true);
              }}
              className="bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white rounded-xl py-2.5 px-5 font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log Session
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Hours', value: `${totalHours}h`, icon: Clock, color: '#3b82f6', delay: 0.05 },
            { label: 'Courses Active', value: `${activeCoursesCount}`, icon: BookOpen, color: '#8b5cf6', delay: 0.1 },
            { label: 'Avg Progress', value: `${avgProgress}%`, icon: TrendingUp, color: '#22c55e', delay: 0.15 },
            { label: 'This Week', value: `${thisWeekHours}h`, icon: BarChart3, color: '#f59e0b', delay: 0.2 },
          ].map(({ label, value, icon: Icon, color, delay }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay, duration: 0.3, ease: 'easeOut' }}
              whileHover={{ y: -2 }}
              className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 flex items-center gap-4"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs font-medium mb-0.5">{label}</p>
                <p className="text-[#F9FAFB] text-2xl font-bold">{value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Course Cards 2x2 */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-3 mb-4"
          >
            <BookOpen className="w-4 h-4 text-[#8b5cf6]" />
            <h2 className="text-[#F9FAFB] font-semibold text-sm">Active Courses</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {courses.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                delay={0.1 + i * 0.05}
                onLog={() => {
                  setSelectedCourse(course.id);
                  setShowModal(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Hours Overview — CSS bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3, ease: 'easeOut' }}
          className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4 text-[#8b5cf6]" />
              <h2 className="text-[#F9FAFB] font-semibold text-sm">Hours Overview — Last 7 Days</h2>
            </div>
            <span className="text-[#94A3B8] text-xs font-medium">Total: {thisWeekHours}h</span>
          </div>

          <div className="flex items-end justify-between gap-2 h-40">
            {dailyHoursData.map(({ day, hours }, i) => {
              const pct = (hours / maxHours) * 100;
              return (
                <div key={day} className="flex flex-col items-center gap-2 flex-1">
                  {/* Bar container */}
                  <div className="relative w-full flex items-end justify-center h-32">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ delay: 0.3 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
                      className="w-full max-w-[36px] rounded-t-lg relative group cursor-default"
                      style={{
                        background:
                          hours >= 2.5
                            ? 'linear-gradient(180deg, #8b5cf6, #6d28d9)'
                            : hours >= 1.5
                            ? 'linear-gradient(180deg, #3b82f6, #1d4ed8)'
                            : 'linear-gradient(180deg, #1f2937, #111827)',
                        minHeight: '4px',
                      }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-lg px-2 py-0.5 text-[#F9FAFB] text-xs whitespace-nowrap z-10 pointer-events-none">
                        {hours}h
                      </div>
                    </motion.div>
                  </div>
                  {/* Hour label */}
                  <span className="text-[#94A3B8] text-[10px] font-medium">{hours}h</span>
                  {/* Day label */}
                  <span className="text-[#CBD5E1] text-xs font-semibold">{day}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(180deg, #8b5cf6, #6d28d9)' }} />
              <span className="text-[#94A3B8] text-xs">High (≥ 2.5h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)' }} />
              <span className="text-[#94A3B8] text-xs">Medium (≥ 1.5h)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(180deg, #1f2937, #111827)' }} />
              <span className="text-[#94A3B8] text-xs">Low (&lt; 1.5h)</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Logs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3, ease: 'easeOut' }}
          className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <Zap className="w-4 h-4 text-[#f59e0b]" />
            <h2 className="text-[#F9FAFB] font-semibold text-sm">Recent Logs</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#111827]">
                <tr>
                  {['Date', 'Course', 'Hours', 'Topic', 'Notebook'].map((col) => (
                    <th
                      key={col}
                      className="text-left text-[10px] tracking-wider uppercase font-semibold text-[#94a3b8] py-3 px-4 first:rounded-l-lg last:rounded-r-lg"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 10).map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.04, duration: 0.2, ease: 'easeOut' }}
                    className="border-b border-[rgba(255,255,255,0.08)] last:border-0 hover:bg-[#111827]/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-[#CBD5E1] text-sm">
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#F9FAFB] text-sm font-semibold truncate max-w-[180px] block">
                        {COURSE_CONFIGS[log.course]?.name || log.course}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[#3b82f6] text-sm font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {log.hoursSpent}h
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#CBD5E1] text-sm">{log.topicCovered || '—'}</td>
                    <td className="py-3 px-4">
                      {log.notebookUrl ? (
                        <a
                          href={log.notebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#8b5cf6] text-xs font-semibold hover:text-[#a78bfa] cursor-pointer transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {log.projectName || 'View Notebook'}
                        </a>
                      ) : (
                        <span className="text-[#94A3B8] text-xs">No link</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#94A3B8] text-sm">
                      No ML sessions logged yet. Click "Log Session" to start tracking!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </>
  );
}

