'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Legend
} from 'recharts';
import { Flame, TrendingUp, Calendar, Target, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#111827',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '10px 14px',
  },
  labelStyle: {
    color: '#cbd5e1',
    fontWeight: '600' as const,
    fontSize: '12px',
    marginBottom: '4px',
    fontFamily: 'Inter, sans-serif',
  },
  itemStyle: {
    color: '#f9fafb',
    fontSize: '12px',
    fontFamily: 'Inter, sans-serif',
    padding: '2px 0',
  },
};

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // 1. Fetch analytics summary
  const { 
    data: summaryQuery, 
    isLoading: isSummaryLoading, 
    error: summaryError 
  } = useQuery({ 
    queryKey: ['analyticsSummary'], 
    queryFn: () => api.get('/api/analytics/summary') 
  });

  // 2. Fetch study hours breakdown
  const { 
    data: studyHoursQuery, 
    isLoading: isHoursLoading, 
    error: hoursError 
  } = useQuery({ 
    queryKey: ['studyHours'], 
    queryFn: () => api.get('/api/analytics/hours') 
  });

  // 3. Fetch consistency
  const { 
    data: consistencyQuery, 
    isLoading: isConsistencyLoading, 
    error: consistencyError 
  } = useQuery({ 
    queryKey: ['consistency'], 
    queryFn: () => api.get('/api/analytics/consistency') 
  });

  // Handle error toasts
  useEffect(() => {
    if (summaryError) {
      toast.error('Failed to load analytics summary');
    }
  }, [summaryError]);

  useEffect(() => {
    if (hoursError) {
      toast.error('Failed to load study hours breakdown');
    }
  }, [hoursError]);

  useEffect(() => {
    if (consistencyError) {
      toast.error('Failed to load consistency data');
    }
  }, [consistencyError]);

  const isLoading = isSummaryLoading || isHoursLoading || isConsistencyLoading;

  if (!mounted || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Loader2 className="w-10 h-10 text-[#3b82f6] animate-spin" />
        <p className="text-sm text-[#94a3b8] font-sans">Loading analytics...</p>
      </div>
    );
  }

  const summaryData = summaryQuery?.data?.data || {};
  const studyHoursData = studyHoursQuery?.data?.data || [];
  const consistencyData = consistencyQuery?.data?.data || {};

  // Calculations for total hours and trends
  const totalCodingHours = studyHoursData.reduce((sum: number, d: any) => sum + (d.codingHours || 0), 0);
  const totalMLHours = studyHoursData.reduce((sum: number, d: any) => sum + (d.mlHours || 0), 0);
  const totalStudyHours = studyHoursData.reduce((sum: number, d: any) => sum + (d.studyHours || 0), 0);
  const calculatedGrandTotal = totalCodingHours + totalMLHours + totalStudyHours;

  const currentScore = summaryData.placementScore ?? 40;
  const scoreTrendVal = Math.round(currentScore - 40);

  // Formatting study hours data for date display on charts
  const formattedStudyHoursData = studyHoursData.map((d: any) => {
    let dateStr = d.date;
    try {
      const dateObj = new Date(d.date);
      dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {}
    return {
      ...d,
      date: dateStr,
    };
  });

  // Generate placement trend data based on studyHoursData and placementScore
  const placementTrendData = studyHoursData.map((d: any, idx: number) => {
    const ratio = studyHoursData.length > 1 ? idx / (studyHoursData.length - 1) : 1;
    const score = 40 + (currentScore - 40) * ratio;
    let dateStr = d.date;
    try {
      const dateObj = new Date(d.date);
      dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {}
    return {
      date: dateStr,
      score: Math.round(score),
    };
  });

  const finalPlacementTrend = placementTrendData.length > 0 
    ? placementTrendData 
    : [
        { date: 'Start', score: 40 },
        { date: 'Current', score: Math.round(currentScore) }
      ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h1 className="font-sans font-bold text-3xl text-[#f9fafb]">Analytics</h1>
        <p className="text-sm text-[#94a3b8] mt-1">Deep insights into your placement preparation journey</p>
      </motion.div>

      {/* KPI Cards / Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4, ease: 'easeOut' }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Streak Counter (Flame Card) */}
        <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Current Streak</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#f59e0b]/10">
              <Flame className="w-4 h-4 text-[#f59e0b]" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-[#f9fafb] font-sans">
            {consistencyData.currentStreak ?? 0} Days
          </div>
          <div className="text-xs text-[#94a3b8] mt-1">
            Best: {consistencyData.maxStreak ?? 0} days
          </div>
        </div>

        {/* Placement Score */}
        <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Placement Score</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#8b5cf6]/10">
              <Target className="w-4 h-4 text-[#8b5cf6]" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-[#f9fafb] font-sans">
            {Math.round(currentScore)}%
          </div>
          <div className="text-xs text-[#94a3b8] mt-1">
            Resume ATS: {summaryData.resumeScore ?? 0}%
          </div>
        </div>

        {/* Total Study Hours */}
        <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Total Study Hours</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#3b82f6]/10">
              <Calendar className="w-4 h-4 text-[#3b82f6]" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-[#f9fafb] font-sans">
            {calculatedGrandTotal.toFixed(0)}h
          </div>
          <div className="text-xs text-[#94a3b8] mt-1">
            Last 30 days
          </div>
        </div>

        {/* Score Trend */}
        <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Score Trend</span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#22c55e]/10">
              <TrendingUp className="w-4 h-4 text-[#22c55e]" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-[#f9fafb] font-sans">
            {scoreTrendVal >= 0 ? '+' : ''}{scoreTrendVal}%
          </div>
          <div className="text-xs text-[#94a3b8] mt-1">
            From baseline (40%)
          </div>
        </div>
      </motion.div>

      {/* Study Hours Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
        className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6"
      >
        <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-6">Daily Study Hours Breakdown</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedStudyHoursData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="gradCoding" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradML" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradStudy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE.contentStyle}
                labelStyle={TOOLTIP_STYLE.labelStyle}
                itemStyle={TOOLTIP_STYLE.itemStyle}
              />
              <Legend formatter={(value) => <span className="text-xs text-[#cbd5e1] font-sans font-medium">{value}</span>} />
              <Area type="monotone" dataKey="codingHours" stroke="#8b5cf6" fill="url(#gradCoding)" strokeWidth={2} name="Coding" />
              <Area type="monotone" dataKey="mlHours" stroke="#3b82f6" fill="url(#gradML)" strokeWidth={2} name="ML Study" />
              <Area type="monotone" dataKey="studyHours" stroke="#60a5fa" fill="url(#gradStudy)" strokeWidth={2} name="General Study" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placement Score Trend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
          className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6"
        >
          <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-6">Placement Score Trend</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={finalPlacementTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[30, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE.contentStyle}
                  labelStyle={TOOLTIP_STYLE.labelStyle}
                  itemStyle={TOOLTIP_STYLE.itemStyle}
                  formatter={(val) => [`${val}%`, 'Score']}
                />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#gradScore)" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4, stroke: '#1f2937', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Hours Distribution Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
          className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6"
        >
          <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-6">Hours Distribution (This Period)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedStudyHoursData.slice(-5)} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid vertical={false} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE.contentStyle}
                  labelStyle={TOOLTIP_STYLE.labelStyle}
                  itemStyle={TOOLTIP_STYLE.itemStyle}
                />
                <Bar dataKey="codingHours" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Coding" />
                <Bar dataKey="mlHours" fill="#3b82f6" radius={[4, 4, 0, 0]} name="ML" />
                <Bar dataKey="studyHours" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Study" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Consistency Calendar (compact heatmap) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4, ease: 'easeOut' }}
        className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Consistency Calendar</h2>
          <div className="flex items-center gap-2 text-xs text-[#cbd5e1]">
            <Flame className="w-4 h-4 text-[#f59e0b]" />
            <span className="font-semibold">{consistencyData.currentStreak ?? 0} day streak</span>
          </div>
        </div>
        
        {/* Heatmap Grid */}
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(28, minmax(0, 1fr))' }}>
          {Array.from({ length: 196 }).map((_, i) => {
            const offset = 196 - studyHoursData.length;
            let intensity = 0.08;
            let title = `Day ${i + 1}`;
            
            if (i >= offset && studyHoursData.length > 0) {
              const dayData = studyHoursData[i - offset];
              const dayTotal = (dayData?.codingHours || 0) + (dayData?.mlHours || 0) + (dayData?.studyHours || 0);
              intensity = dayTotal > 0 ? Math.min(0.2 + (dayTotal / 6) * 0.8, 1) : 0.08;
              title = `${dayData?.date || 'Unknown Date'}: ${dayTotal.toFixed(1)} hours spent`;
            } else {
              intensity = i % 13 === 0 ? 0.35 : i % 7 === 0 ? 0.2 : 0.08;
            }

            return (
              <div
                key={i}
                className="h-3 rounded-sm transition-colors duration-200 hover:ring-1 hover:ring-[#3b82f6]"
                style={{ backgroundColor: `rgba(59, 130, 246, ${intensity})` }}
                title={title}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] text-xs text-[#94a3b8]">
          <span>28 weeks of activity</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#94a3b8]">Less</span>
            {[0.08, 0.25, 0.5, 0.75, 1.0].map((o) => (
              <div
                key={o}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: `rgba(59, 130, 246, ${o})` }}
              />
            ))}
            <span className="text-[11px] text-[#94a3b8]">More</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
