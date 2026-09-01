'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Terminal, Sparkles } from 'lucide-react';

const BOOT_LOGS = [
  'Initializing PathForge Career OS...',
  'Connecting local PostgreSQL API databases...',
  'Bootstrapping Gemini LLM vector models...',
  'Mapping resume keyword vector profiles...',
  'Calculating Placement Readiness score index...',
  'Synthesizing workspace widget nodes...',
  'Welcome back. Career OS Active.'
];

export function BootLoader() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [logIdx, setLogIdx] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Check if already booted in this browser session
    const hasBooted = sessionStorage.getItem('pathforge_career_os_booted') === 'true';
    if (!hasBooted) {
      setVisible(true);
      
      // Sequence logs
      const interval = setInterval(() => {
        setLogIdx((prev) => {
          if (prev < BOOT_LOGS.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            // Hide bootloader after final message
            setTimeout(() => {
              setVisible(false);
              sessionStorage.setItem('pathforge_career_os_booted', 'true');
            }, 800);
            return prev;
          }
        });
      }, 350);

      return () => clearInterval(interval);
    }
  }, []);

  if (!mounted || !visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 w-full h-full bg-[#09090b] z-[9999] flex flex-col items-center justify-center p-6 select-none cursor-none"
        >
          {/* Noise overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02] pointer-events-none" 
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px',
            }}
          />

          <div className="w-full max-w-md space-y-6">
            {/* Logo area */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#111827] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#3b82f6] animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-sans font-bold text-sm text-[#faFigure] tracking-wider text-[#faFafA]">PATHFORGE AI</h3>
                <span className="text-[9px] font-mono text-[#94a3b8] uppercase tracking-wider block">Career OS v2.0</span>
              </div>
            </div>

            {/* Console Screen */}
            <div className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl p-4 font-mono text-[10px] text-[#cbd5e1] space-y-2 h-44 overflow-y-auto">
              <div className="flex items-center gap-1.5 text-[9px] text-[#3b82f6] font-bold pb-1.5 border-b border-[rgba(255,255,255,0.04)] mb-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>INITIALIZATION LOGS</span>
              </div>

              <div className="space-y-1.5">
                {BOOT_LOGS.slice(0, logIdx + 1).map((log, index) => {
                  const isLast = index === logIdx;
                  return (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-[#3b82f6] shrink-0">&gt;</span>
                      <span className={index === BOOT_LOGS.length - 1 ? 'text-[#22c55e] font-semibold' : 'text-[#cbd5e1]'}>
                        {log}
                        {isLast && <span className="inline-block w-1.5 h-3 bg-[#cbd5e1] animate-pulse ml-1" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress indicator */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-bold text-[#cbd5e1] uppercase tracking-wider font-mono">
                <span>System status</span>
                <span>{Math.round(((logIdx + 1) / BOOT_LOGS.length) * 100)}%</span>
              </div>
              <div className="w-full bg-[#18181b] border border-[rgba(255,255,255,0.06)] rounded-full h-1">
                <motion.div
                  className="bg-[#3b82f6] h-full rounded-full"
                  style={{ width: `${((logIdx + 1) / BOOT_LOGS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default BootLoader;
