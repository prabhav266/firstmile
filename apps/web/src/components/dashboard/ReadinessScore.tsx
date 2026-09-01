'use client';

import React from 'react';
import { motion } from 'motion/react';

interface ReadinessScoreProps {
  score: number;
}

export function ReadinessScore({ score }: ReadinessScoreProps) {
  const radius = 50;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl h-full">
      <h3 className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-6">Placement Readiness</h3>
      
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Animated Circular Gauge */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Base circle track */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx="72"
            cy="72"
            r={radius}
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Central percentage text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-bold font-sans text-[#f9fafb]">{Math.round(score)}%</span>
          <span className="text-[9px] uppercase font-bold tracking-widest text-[#3b82f6] mt-0.5">Ready</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] leading-relaxed text-[#94a3b8]">Overall score aggregates DSA profiles, active projects count, and resume suggestions metrics</p>
      </div>
    </div>
  );
}
