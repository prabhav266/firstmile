'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext: string;
  trend?: string;
  trendUp?: boolean;
}

export function StatsCard({ title, value, icon: Icon, subtext, trend }: StatsCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -1 }}
      className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 flex items-center justify-between transition-colors hover:border-[#333333]"
    >
      <div className="space-y-0.5">
        <span className="text-[9px] font-mono text-[#666666] uppercase tracking-wider block">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold font-display text-[#ffffff]">{value}</span>
          {trend && (
            <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-[#181818] border border-[#27272a] text-[#b5b5b5]">
              {trend}
            </span>
          )}
        </div>
        <p className="text-[10px] text-[#888888] font-mono">{subtext}</p>
      </div>

      <div className="w-8 h-8 rounded bg-[#111111] border border-[#242424] flex items-center justify-center text-[#ffffff] shrink-0">
        <Icon className="w-4 h-4" />
      </div>
    </motion.div>
  );
}
export default StatsCard;
