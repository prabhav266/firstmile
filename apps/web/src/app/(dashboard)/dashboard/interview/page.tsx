'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Mic,
  MessageSquare,
  Activity,
  Award,
  Sparkles,
  Zap,
} from 'lucide-react';
import { VoiceMockScreener } from '@/components/interview/VoiceMockScreener';

export default function InterviewPage() {
  return (
    <div className="space-y-6 font-sans select-none max-w-7xl">
      {/* Header */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block mb-1">
            Voice Cadence & Technical Screener
          </span>
          <h1 className="font-display font-bold text-2xl text-[#ffffff] tracking-tight">
            AI Voice Phone Screen Suite
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-0.5">
            Real-time Web Audio speech analysis • STAR structured behavioral evaluations
          </p>
        </div>
      </div>

      {/* Embedded Live Screener */}
      <VoiceMockScreener />
    </div>
  );
}
