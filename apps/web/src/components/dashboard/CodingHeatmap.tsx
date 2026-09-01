'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function CodingHeatmap() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real database coding heatmap aggregates dictionary { "YYYY-MM-DD": count }
  const { data: heatmapResponse } = useQuery({
    queryKey: ['codingHeatmap'],
    queryFn: () => api.get('/api/coding/heatmap'),
    enabled: mounted,
  });

  // Fetch consistency streak info
  const { data: consistencyResponse } = useQuery({
    queryKey: ['consistency'],
    queryFn: () => api.get('/api/analytics/consistency'),
    enabled: mounted,
  });

  const heatmapDataMap: Record<string, number> = heatmapResponse?.data?.data || {};
  const streak = consistencyResponse?.data?.data || { currentStreak: 0 };

  const columns = 28;
  const rows = 7;
  const totalBlocks = columns * rows;

  // Generate date strings array for the last 196 days leading to today
  const today = new Date();
  const dateBlocks = React.useMemo(() => {
    const blocks: { dateStr: string; formattedDate: string; count: number }[] = [];
    for (let i = totalBlocks - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const count = heatmapDataMap[dateStr] || 0;
      blocks.push({ dateStr, formattedDate, count });
    }
    return blocks;
  }, [heatmapDataMap]);

  if (!mounted) {
    return (
      <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 h-[340px] flex items-center justify-center text-xs text-[#94a3b8]">
        Loading contribution calendar...
      </div>
    );
  }

  return (
    <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 flex flex-col justify-between h-[340px]">
      <div>
        <h3 className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">Coding Logs Consistency</h3>
        <p className="text-[10px] text-[#94a3b8]">Contribution calendar tracking LeetCode, Codeforces, & CodeChef logs</p>
      </div>

      {/* The grid calendar container */}
      <div className="flex-1 flex items-center justify-center overflow-x-auto py-2">
        <div className="grid grid-flow-col gap-1.5" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
          {dateBlocks.map((block, i) => {
            const intensity = block.count;

            let bgClass = 'bg-[rgba(255,255,255,0.03)]';
            if (intensity === 1) bgClass = 'bg-[#3b82f6]/30';
            else if (intensity === 2) bgClass = 'bg-[#3b82f6]/50';
            else if (intensity === 3) bgClass = 'bg-[#3b82f6]/75';
            else if (intensity >= 4) bgClass = 'bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.5)]';

            return (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 hover:z-10 cursor-pointer ${bgClass}`}
                title={`${block.formattedDate}: ${intensity} problem${intensity !== 1 ? 's' : ''} solved`}
              />
            );
          })}
        </div>
      </div>

      {/* Legend bar */}
      <div className="flex items-center justify-between text-xs text-[#94a3b8] pt-2 border-t border-[rgba(255,255,255,0.04)]">
        <span className="text-[11px]">Current Streak: <strong className="text-[#f9fafb] font-semibold">{streak.currentStreak || 0} days</strong></span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-[rgba(255,255,255,0.03)]" />
          <div className="w-3 h-3 rounded-sm bg-[#3b82f6]/30" />
          <div className="w-3 h-3 rounded-sm bg-[#3b82f6]/60" />
          <div className="w-3 h-3 rounded-sm bg-[#3b82f6]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
export default CodingHeatmap;
