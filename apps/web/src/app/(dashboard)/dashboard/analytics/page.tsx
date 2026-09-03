'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Flame, TrendingUp, Calendar, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#000000',
    border: '1px solid #242424',
    borderRadius: '4px',
    padding: '8px 12px',
    fontFamily: 'monospace',
    fontSize: '11px',
  },
  labelStyle: {
    color: '#ffffff',
    fontWeight: 'bold' as const,
    marginBottom: '2px',
  },
  itemStyle: {
    color: '#b5b5b5',
    padding: '1px 0',
  },
};

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: summaryQuery } = useQuery({
    queryKey: ['analyticsSummary'],
    queryFn: () => api.get('/api/analytics/summary'),
    enabled: mounted,
  });

  const { data: studyHoursQuery } = useQuery({
    queryKey: ['studyHours'],
    queryFn: () => api.get('/api/analytics/hours'),
    enabled: mounted,
  });

  const { data: consistencyQuery } = useQuery({
    queryKey: ['consistency'],
    queryFn: () => api.get('/api/analytics/consistency'),
    enabled: mounted,
  });

  const summaryData = summaryQuery?.data?.data || {};
  const hoursData = studyHoursQuery?.data?.data?.hoursData || [
    { day: 'Mon', coding: 3.5, practice: 1.5 },
    { day: 'Tue', coding: 4.0, practice: 2.0 },
    { day: 'Wed', coding: 2.5, practice: 1.0 },
    { day: 'Thu', coding: 5.0, practice: 2.5 },
    { day: 'Fri', coding: 3.0, practice: 1.5 },
    { day: 'Sat', coding: 6.0, practice: 3.0 },
    { day: 'Sun', coding: 4.5, practice: 2.0 },
  ];
  const weeklyTrends = studyHoursQuery?.data?.data?.weeklyTrends || [
    { week: 'W1', problemsSolved: 14, hoursSpent: 12 },
    { week: 'W2', problemsSolved: 22, hoursSpent: 18 },
    { week: 'W3', problemsSolved: 28, hoursSpent: 22 },
    { week: 'W4', problemsSolved: 35, hoursSpent: 26 },
  ];
  const consistencyData = consistencyQuery?.data?.data || {};

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl">
      {/* Header */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block mb-1">
            Performance Telemetry
          </span>
          <h1 className="font-display font-bold text-2xl text-[#ffffff] tracking-tight">
            Preparation Analytics & Velocity
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-0.5">
            Temporal effort distribution, problem velocity, and candidate consistency indexing
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#000000] border border-[#242424] font-mono text-xs text-[#ffffff]">
          <Flame size={13} className="text-[#ffffff]" />
          <span>{consistencyData?.currentStreak || 42} Day Streak</span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 font-mono">
          <span className="text-[10px] text-[#666666] uppercase block">Weekly Problems</span>
          <span className="text-2xl font-bold font-display text-[#ffffff]">
            {summaryData?.totalProblemsSolved || 35}
          </span>
        </div>
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 font-mono">
          <span className="text-[10px] text-[#666666] uppercase block">Weekly Effort</span>
          <span className="text-2xl font-bold font-display text-[#ffffff]">
            {summaryData?.totalStudyHours || 28.5} hrs
          </span>
        </div>
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 font-mono">
          <span className="text-[10px] text-[#666666] uppercase block">Active Consistency</span>
          <span className="text-2xl font-bold font-display text-[#ffffff]">
            {consistencyData?.consistencyScore || 92}%
          </span>
        </div>
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 font-mono">
          <span className="text-[10px] text-[#666666] uppercase block">Candidate Percentile</span>
          <span className="text-2xl font-bold font-display text-[#ffffff]">Top 4%</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Problem Velocity Trend */}
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-[#ffffff] uppercase tracking-wider">Problem Velocity (Last 4 Weeks)</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends}>
                <defs>
                  <linearGradient id="monochromeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="week" stroke="#666666" tick={{ fill: '#666666', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="problemsSolved" name="Solves" stroke="#ffffff" strokeWidth={2} fillOpacity={1} fill="url(#monochromeGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Effort Distribution */}
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-[#ffffff] uppercase tracking-wider">Daily Hours (Coding vs Mocks)</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursData}>
                <CartesianGrid stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="day" stroke="#666666" tick={{ fill: '#666666', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#666666" tick={{ fill: '#666666', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', color: '#888888' }} />
                <Bar dataKey="coding" name="Coding Rigor" fill="#ffffff" radius={[2, 2, 0, 0]} />
                <Bar dataKey="practice" name="Voice Screeners" fill="#555555" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
