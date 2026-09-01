'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Target, Zap, Activity } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export function HeroInfoPanel() {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    sounds.playTick();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="w-full lg:w-[320px] xl:w-[380px] space-y-6 text-[#fafafa] text-right pointer-events-auto">
      {/* Top Editorial Subtext */}
      <p className="text-xs font-mono tracking-wider text-[#a1a1aa] leading-relaxed uppercase">
        AI-POWERED CAREER NAVIGATION SYSTEM
        <br />
        <span className="text-[#fafafa]/80 normal-case font-sans block mt-1 text-xs">
          PathForge AI synthesizes your coding output, resume ATS score, and skill gaps into a real-time trajectory roadmap.
        </span>
      </p>

      {/* Interactive Visual Preview Card (#imagediv style) */}
      <motion.div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02, rotateX: 4, rotateY: -4 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-[180px] bg-[#18181b]/80 backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] cursor-pointer group"
      >
        {/* Animated Cybernetic Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20 group-hover:opacity-40 transition-opacity" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />
            <span className="text-[10px] font-mono text-[#a1a1aa] uppercase tracking-widest">Live Trajectory Vector</span>
          </div>
          <span className="text-[10px] font-mono text-[#8b5cf6] font-bold">94.8% PRECISION</span>
        </div>

        {/* Center Vector Graph Nodes Preview */}
        <div className="relative z-10 my-auto flex items-center justify-between px-2">
          <div className="text-center space-y-1">
            <div className="w-9 h-9 rounded-xl bg-[#3b82f6]/20 border border-[#3b82f6]/40 flex items-center justify-center mx-auto text-[#3b82f6]">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-mono text-[#a1a1aa] block uppercase">Skills</span>
          </div>

          <div className="h-[2px] flex-1 mx-2 bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#10b981] relative">
            <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
          </div>

          <div className="text-center space-y-1">
            <div className="w-9 h-9 rounded-xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center mx-auto text-[#8b5cf6]">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-mono text-[#a1a1aa] block uppercase">Goal</span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-[#a1a1aa] pt-2 border-t border-[rgba(255,255,255,0.06)]">
          <span className="flex items-center gap-1 text-[#10b981]">
            <Activity className="w-3 h-3" />
            <span>Streak: 12 Days</span>
          </span>
          <span className="text-white group-hover:text-[#8b5cf6] transition-colors">Hover to Inspect →</span>
        </div>
      </motion.div>

      {/* Secondary Information Text */}
      <p className="text-xs text-[#a1a1aa] leading-relaxed hidden sm:block">
        Continuously evaluates your DSA problem-solving frequency, project architecture ratings, and ATS resume standards against tier-1 tech benchmark requirements.
      </p>
    </div>
  );
}

export default HeroInfoPanel;
