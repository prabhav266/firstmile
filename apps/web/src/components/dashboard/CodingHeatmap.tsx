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
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 h-[340px] flex items-center justify-center text-xs font-mono text-[#666666]">
        Loading contribution calendar...
      </div>
    );
  }

  return (
    <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 flex flex-col justify-between h-[340px]">
      <div>
        <h3 className="text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-1">DSA Solve Consistency</h3>
        <p className="text-[10px] text-[#666666]">196-day log tracking verified LeetCode & Striver problem solves</p>
      </div>

      {/* The grid calendar container */}
      <div className="flex-1 flex items-center justify-center overflow-x-auto py-2">
        <div className="grid grid-flow-col gap-1.5" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}>
          {dateBlocks.map((block, i) => {
            const intensity = block.count;

            let bgClass = 'bg-[#121212]';
            if (intensity === 1) bgClass = 'bg-[#444444]';
            else if (intensity === 2) bgClass = 'bg-[#777777]';
            else if (intensity === 3) bgClass = 'bg-[#b5b5b5]';
            else if (intensity >= 4) bgClass = 'bg-[#ffffff] shadow-sm';

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
      <div className="flex items-center justify-between text-xs text-[#888888] pt-2 border-t border-[#1a1a1a] font-mono">
        <span className="text-[10px]">Active Streak: <strong className="text-[#ffffff] font-semibold">{streak.currentStreak || 0} days</strong></span>
        <div className="flex items-center gap-1.5 text-[9px]">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-[#121212]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#444444]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#777777]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#b5b5b5]" />
          <div className="w-2.5 h-2.5 rounded-sm bg-[#ffffff]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
export default CodingHeatmap;
