'use client';

import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CalendarDays } from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Types
type BlockType = 'CODING' | 'ML' | 'CLASSES' | 'GYM' | 'REVISION' | 'PROJECTS';

interface TimeBlock {
  time: string;
  task: string;
  type: BlockType;
}

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type Schedule = Record<DayKey, TimeBlock[]>;

interface Goal {
  title: string;
  completed: boolean;
}

interface PlannerWeek {
  id: string;
  userId: string;
  weekStart: string;
  schedule: Schedule;
  goals: Goal[];
  createdAt: string;
}

const EMPTY_SCHEDULE: Schedule = {
  mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [],
};

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

const BLOCK_STYLES: Record<BlockType, { card: string; badge: string; dot: string; label: string }> = {
  CODING:   { card: 'bg-[#1e293b] border border-[rgba(255,255,255,0.08)] border-l-2 border-l-[#3b82f6]', badge: 'text-[#3b82f6] bg-[#3b82f6]/10',   dot: 'bg-[#3b82f6]', label: 'Coding'   },
  ML:       { card: 'bg-[#1e293b] border border-[rgba(255,255,255,0.08)] border-l-2 border-l-[#8b5cf6]', badge: 'text-[#8b5cf6] bg-[#8b5cf6]/10',   dot: 'bg-[#8b5cf6]', label: 'ML / AI'  },
  CLASSES:  { card: 'bg-[#1e293b] border border-[rgba(255,255,255,0.08)] border-l-2 border-l-[#f59e0b]', badge: 'text-[#f59e0b] bg-[#f59e0b]/10',   dot: 'bg-[#f59e0b]', label: 'Classes'  },
  GYM:      { card: 'bg-[#1e293b] border border-[rgba(255,255,255,0.08)] border-l-2 border-l-[#22c55e]', badge: 'text-[#22c55e] bg-[#22c55e]/10',   dot: 'bg-[#22c55e]', label: 'Gym'      },
  REVISION: { card: 'bg-[#1e293b] border border-[rgba(255,255,255,0.08)] border-l-2 border-l-[#94a3b8]', badge: 'text-[#94a3b8] bg-[#94a3b8]/10',   dot: 'bg-[#94a3b8]', label: 'Revision' },
  PROJECTS: { card: 'bg-[#1e293b] border border-[rgba(255,255,255,0.08)] border-l-2 border-l-[#ef4444]', badge: 'text-[#ef4444] bg-[#ef4444]/10',   dot: 'bg-[#ef4444]', label: 'Projects' },
};

function getWeekRange(): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(mon)} - ${fmt(sun)}`;
}

function getWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d.getDate().toString();
  });
}

function TimeBlockCard({ block, index }: { block: TimeBlock; index: number }) {
  const styles = BLOCK_STYLES[block.type] || BLOCK_STYLES.CODING;
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.03 }}
      className={`p-2 flex flex-col gap-1 cursor-default text-left select-none rounded ${styles.card}`}
    >
      <span className="text-[9px] font-mono text-[#94a3b8] leading-none">{block.time}</span>
      <span className="text-xs font-semibold text-[#f9fafb] leading-snug line-clamp-2">{block.task}</span>
      <span className={`self-start text-[9px] font-bold px-1.5 py-0.5 rounded-full ${styles.badge}`}>
        {block.type}
      </span>
    </motion.div>
  );
}

export default function PlannerPage() {
  const queryClient = useQueryClient();
  const weekRange = getWeekRange();
  const weekDates = getWeekDates();

  // 1. Fetch planner week
  const { data: plannerResponse, isLoading, isError } = useQuery({
    queryKey: ['plannerWeek'],
    queryFn: () => api.get('/api/planner'),
  });

  const plannerWeek = plannerResponse?.data?.data as PlannerWeek | undefined;
  const schedule = (plannerWeek?.schedule as Schedule) || EMPTY_SCHEDULE;
  const goals = (plannerWeek?.goals as Goal[]) || [];

  // Helper safely checking array type
  const getDayBlocks = (key: DayKey): TimeBlock[] => {
    const daySchedule = schedule[key];
    return Array.isArray(daySchedule) ? daySchedule : [];
  };

  // Get all unique times in the schedule and sort them
  const getUniqueTimes = (): string[] => {
    const timesSet = new Set<string>(['08:00', '09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00']);
    Object.values(schedule).forEach((dayBlocks) => {
      if (Array.isArray(dayBlocks)) {
        dayBlocks.forEach((block) => {
          if (block.time) {
            const match = block.time.match(/^(\d{2}):/);
            if (match) {
              timesSet.add(`${match[1]}:00`);
            } else {
              timesSet.add(block.time);
            }
          }
        });
      }
    });
    return Array.from(timesSet).sort();
  };

  const timeSlots = getUniqueTimes();

  // 2. Optimize planner
  const optimizeMutation = useMutation({
    mutationFn: () => api.post('/api/planner/generate'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plannerWeek'] });
      toast.success('Planner optimized by AI!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to optimize planner');
    },
  });

  // 3. Toggle weekly goal
  const toggleGoalMutation = useMutation({
    mutationFn: ({ id, index, completed }: { id: string; index: number; completed: boolean }) =>
      api.put(`/api/planner/goal/${id}`, { index, completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plannerWeek'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update goal');
    },
  });

  const isGenerating = optimizeMutation.isPending;
  const isGenerated = !!plannerWeek && Object.values(schedule).some((day) => Array.isArray(day) && day.length > 0);

  const handleGenerateSchedule = () => {
    optimizeMutation.mutate();
  };

  const handleToggleGoal = (index: number, completed: boolean) => {
    if (!plannerWeek?.id) return;
    toggleGoalMutation.mutate({
      id: plannerWeek.id,
      index,
      completed,
    });
  };

  const completedCount = goals.filter((g) => g.completed).length;
  const progressPct = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#3b82f6]/20 border-t-[#3b82f6] rounded-full animate-spin" />
          <span className="text-sm text-[#cbd5e1] font-medium animate-pulse">Loading planner data...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 bg-[#1f2937] border border-[rgba(255,255,255,0.08)] p-6 rounded-2xl max-w-sm text-center">
          <p className="text-sm text-red-400 font-medium">Failed to load weekly planner</p>
          <p className="text-xs text-[#cbd5e1] mt-1">Please try refreshing the page or check your connection.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#3b82f6]/10 border border-[#3b82f6]/20">
            <CalendarDays className="w-5 h-5 text-[#3b82f6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#f9fafb] leading-none">Weekly Planner</h1>
            <p className="text-sm text-[#94a3b8] mt-1.5">Organise your week with AI precision</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-[#111827] border border-[rgba(255,255,255,0.08)] text-[#cbd5e1]">
            <CalendarDays className="w-3.5 h-3.5 text-[#3b82f6]" />
            {weekRange}
          </span>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateSchedule}
            disabled={isGenerating}
            className="bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white rounded-[12px] py-2.5 px-5 font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <motion.div
              animate={isGenerating ? { rotate: 360 } : { rotate: 0 }}
              transition={isGenerating ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            {isGenerating ? 'Generating...' : isGenerated ? 'Regenerate Schedule' : 'AI Generate Schedule'}
          </motion.button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* LEFT: Weekly Calendar Grid (3/4) */}
        <div className="w-full lg:flex-[3] min-w-0">
          <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 overflow-x-auto">
            <div className="grid grid-cols-[80px_repeat(7,_1fr)] min-w-[800px] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden bg-[#111827]">
              {/* Column Headers */}
              <div className="p-3 border-r border-b border-[rgba(255,255,255,0.08)] bg-[#111827] text-[10px] tracking-wider uppercase font-semibold text-[#94a3b8] flex items-center justify-center">
                Time
              </div>
              {DAYS.map(({ key, label }, i) => {
                const dateNum = weekDates[i];
                const dayMap: Record<DayKey, number> = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 };
                const isToday = new Date().getDay() === dayMap[key];
                return (
                  <div
                    key={key}
                    className={`p-3 border-b border-[rgba(255,255,255,0.08)] ${
                      i < 6 ? 'border-r' : ''
                    } bg-[#111827] flex flex-col items-center justify-center gap-1`}
                  >
                    <span className={`text-[10px] tracking-wider uppercase font-semibold ${isToday ? 'text-[#3b82f6]' : 'text-[#94a3b8]'}`}>
                      {label}
                    </span>
                    <span className={`text-xs font-bold ${isToday ? 'text-[#3b82f6]' : 'text-[#f9fafb]'}`}>
                      {dateNum}
                    </span>
                  </div>
                );
              })}

              {/* Grid Rows */}
              {timeSlots.map((slot) => (
                <Fragment key={slot}>
                  {/* Time slots column */}
                  <div className="p-3 border-r border-b border-[rgba(255,255,255,0.08)] bg-[#111827] text-xs font-mono text-[#cbd5e1] flex items-center justify-center">
                    {slot}
                  </div>
                  {/* 7-day columns */}
                  {DAYS.map(({ key }, dayIdx) => {
                    const dayBlocks = getDayBlocks(key);
                    const block = dayBlocks.find((b) => {
                      if (!b.time) return false;
                      if (b.time === slot) return true;
                      const bHour = b.time.split(':')[0];
                      const sHour = slot.split(':')[0];
                      return bHour === sHour;
                    });
                    return (
                      <div
                        key={key}
                        className={`p-2 border-b border-[rgba(255,255,255,0.08)] ${
                          dayIdx < 6 ? 'border-r' : ''
                        } bg-[#0f172a] min-h-[85px] flex flex-col justify-start gap-1`}
                      >
                        <AnimatePresence>
                          {block && (
                            <TimeBlockCard block={block} index={dayIdx} />
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>

            {/* Empty state prompt */}
            <AnimatePresence>
              {!isGenerated && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-4 flex flex-col items-center justify-center gap-2 py-6 border border-dashed border-[rgba(255,255,255,0.08)] rounded-xl bg-[#111827]"
                >
                  <Sparkles className="w-7 h-7 text-[#cbd5e1]" />
                  <p className="text-sm text-[#cbd5e1] text-center">
                    Click <span className="text-[#3b82f6] font-semibold">AI Generate Schedule</span> to fill your week
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex items-center justify-center gap-3 py-6"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut', repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-[#3b82f6]"
                    />
                  ))}
                </div>
                <span className="text-sm text-[#cbd5e1]">AI is crafting your schedule...</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* RIGHT: Goals Sidebar (1/4) */}
        <div className="w-full lg:flex-[1] lg:min-w-[220px] lg:max-w-[280px] flex flex-col gap-4">
          {/* Goals Panel */}
          <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-[#f9fafb]">Weekly Goals</h2>
            {goals.length === 0 ? (
              <p className="text-xs text-[#cbd5e1] italic">No weekly goals set.</p>
            ) : (
              <ul className="space-y-2.5">
                {goals.map((goal, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ x: 2 }}
                    onClick={() => handleToggleGoal(i, !goal.completed)}
                    className="flex items-start gap-2.5 cursor-pointer group select-none"
                  >
                    <div
                      role="checkbox"
                      aria-checked={goal.completed}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleToggleGoal(i, !goal.completed);
                        }
                      }}
                      className={`mt-0.5 shrink-0 w-4 h-4 rounded border border-[rgba(255,255,255,0.08)] bg-[#111827] flex items-center justify-center transition-all ${
                        goal.completed ? 'border-[#3b82f6] bg-[#3b82f6]' : 'group-hover:border-[#3b82f6]/50'
                      }`}
                    >
                      {goal.completed && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs leading-snug transition-all ${goal.completed ? 'line-through text-[#94a3b8]' : 'text-[#cbd5e1] group-hover:text-[#f9fafb]'}`}>
                      {goal.title}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#94a3b8] font-medium uppercase tracking-wide">Progress</span>
                <span className="text-xs font-bold text-[#3b82f6]">{completedCount}/{goals.length}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#111827] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[10px] text-[#94a3b8]">
                {completedCount === goals.length && goals.length > 0 ? 'All goals completed!' : `${goals.length - completedCount} remaining`}
              </p>
            </div>
          </div>

          {/* Color Legend Panel */}
          <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 space-y-3">
            <h2 className="text-base font-semibold text-[#f9fafb]">Color Legend</h2>
            <ul className="space-y-2">
              {(Object.entries(BLOCK_STYLES) as [BlockType, typeof BLOCK_STYLES[BlockType]][]).map(([type, styles]) => (
                <li key={type} className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${styles.dot}`} />
                  <span className="text-xs text-[#cbd5e1]">{styles.label}</span>
                  <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${styles.badge}`}>
                    {type}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
