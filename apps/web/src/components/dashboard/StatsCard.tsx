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

export function StatsCard({ title, value, icon: Icon, subtext, trend, trendUp }: StatsCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -1 }}
      className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 flex items-center justify-between transition-colors hover:border-[rgba(255,255,255,0.12)]"
    >
      <div className="space-y-1">
        <span className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider block">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-sans text-[#f9fafb]">{value}</span>
          {trend && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${trendUp ? 'text-[#22c55e] bg-[#22c55e]/10' : 'text-[#ef4444] bg-[#ef4444]/10'}`}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-[11px] text-[#94a3b8]">{subtext}</p>
      </div>

      <div className="w-10 h-10 rounded-lg bg-[#111827] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#3b82f6]">
        <Icon className="w-4.5 h-4.5" />
      </div>
    </motion.div>
  );
}
export default StatsCard;
