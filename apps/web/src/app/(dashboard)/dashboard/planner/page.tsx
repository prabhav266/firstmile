'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, Sparkles, Plus, Check, Trash2, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

type BlockType = 'CODING' | 'DSA' | 'REVISION' | 'PROJECTS' | 'INTERVIEW';

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

const DEFAULT_SCHEDULE: Schedule = {
  mon: [
    { time: '08:00 AM', task: 'Striver SDE Sheet: Binary Search Mediums', type: 'DSA' },
    { time: '05:00 PM', task: 'STAR AI Voice Screener: Rate Limiter', type: 'INTERVIEW' },
  ],
  tue: [
    { time: '09:00 AM', task: 'Dynamic Programming: 1D & 2D Memoization', type: 'CODING' },
    { time: '06:00 PM', task: 'Distributed Portfolio: gRPC Gateway Layer', type: 'PROJECTS' },
  ],
  wed: [
    { time: '08:30 AM', task: 'Graph Traversals: Topological Sort & Bridges', type: 'DSA' },
    { time: '07:00 PM', task: 'Harvard ATS Resume Keyword Alignment', type: 'REVISION' },
  ],
  thu: [
    { time: '09:00 AM', task: 'Sliding Window: Variable Window Maximums', type: 'DSA' },
    { time: '05:30 PM', task: 'Mock Interview Screener: Behavioral Cadence', type: 'INTERVIEW' },
  ],
  fri: [
    { time: '08:00 AM', task: 'Weekly DSA Contest Simulation (4 Problems)', type: 'CODING' },
    { time: '06:00 PM', task: 'Deploy Portfolio Redis Cache to Staging', type: 'PROJECTS' },
  ],
  sat: [
    { time: '10:00 AM', task: 'Striver Hard Problems Revision', type: 'REVISION' },
    { time: '04:00 PM', task: 'Peer Voice Mock & STAR Review', type: 'INTERVIEW' },
  ],
  sun: [
    { time: '11:00 AM', task: 'Weekly Readiness Telemetry Review', type: 'REVISION' },
  ],
};

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

export default function WeeklyPlannerPage() {
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [goals, setGoals] = useState<Goal[]>([
    { title: 'Solve 18 LeetCode Medium/Hard problems', completed: true },
    { title: 'Pass 2 AI Voice Mock Screeners (>8.5 STAR)', completed: true },
    { title: 'Implement Redis Caching in Portfolio Project', completed: false },
    { title: 'Audit ATS Resume against SDE-1 Job Descriptions', completed: false },
  ]);
  const [newGoal, setNewGoal] = useState('');

  const toggleGoal = (index: number) => {
    setGoals((prev) =>
      prev.map((g, i) => (i === index ? { ...g, completed: !g.completed } : g))
    );
  };

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setGoals((prev) => [...prev, { title: newGoal.trim(), completed: false }]);
    setNewGoal('');
    toast.success('Target added to sprint');
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl">
      {/* Header */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block mb-1">
            Sprint Cadence
          </span>
          <h1 className="font-display font-bold text-2xl text-[#ffffff] tracking-tight">
            Weekly Execution Planner
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-0.5">
            Synchronized preparation calendar balancing DSA rigor, mock screeners, and project builds
          </p>
        </div>
      </div>

      {/* Weekly Goals Sprint Card */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
          <h2 className="font-bold text-[#ffffff] uppercase tracking-wider">Weekly Sprint Deliverables</h2>
          <span className="text-[#888888]">
            {goals.filter((g) => g.completed).length}/{goals.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {goals.map((g, i) => (
            <div
              key={i}
              onClick={() => toggleGoal(i)}
              className={`p-3 rounded border cursor-pointer flex items-center justify-between transition-colors ${
                g.completed
                  ? 'bg-[#111111] border-[#333333] text-[#ffffff]'
                  : 'bg-[#000000] border-[#1e1e1e] text-[#888888] hover:text-[#ffffff]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-4 h-4 rounded-xs border flex items-center justify-center ${
                    g.completed ? 'bg-[#ffffff] border-[#ffffff] text-[#000000]' : 'border-[#444444]'
                  }`}
                >
                  {g.completed && <Check size={11} strokeWidth={3} />}
                </div>
                <span className={g.completed ? 'line-through text-[#666666]' : ''}>{g.title}</span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={addGoal} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Add new weekly sprint target..."
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            className="flex-1 bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
          />
          <button type="submit" className="btn-secondary py-1.5 px-4 text-xs">
            Add Sprint Target
          </button>
        </form>
      </div>

      {/* 7-Day Schedule Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS.map(({ key, label }) => {
          const blocks = schedule[key] || [];
          return (
            <div key={key} className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#1a1a1a]">
                <span className="font-bold text-[#ffffff] uppercase">{label}</span>
                <span className="text-[10px] text-[#666666]">{blocks.length} Blocks</span>
              </div>

              <div className="space-y-2">
                {blocks.map((b, idx) => (
                  <div key={idx} className="bg-[#000000] border border-[#1e1e1e] p-2.5 rounded space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#666666]">{b.time}</span>
                      <span className="px-1.5 py-0.2 rounded bg-[#111111] border border-[#27272a] text-[#ffffff] font-bold">
                        {b.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#b5b5b5] font-medium leading-tight">{b.task}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
