'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { sounds } from '@/lib/sounds';

interface StackedHeadlineProps {
  onCycle?: (index: number) => void;
}

export function StackedHeadline({ onCycle }: StackedHeadlineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentIndexRef = useRef(0);
  const animatingRef = useRef(false);
  const [activeState, setActiveState] = useState(0);

  // Headlines dataset tailored to PathForge AI
  const HEADLINE_LINES = [
    {
      line1: ['BUILD YOUR PATH.', 'DISCOVER YOUR EDGE.', 'MASTER YOUR SKILLS.', 'LAND YOUR FUTURE.'],
      line2: ['ENGINEER YOUR CAREER', 'SHARPEN YOUR VISION', 'ACCELERATE YOUR GROWTH', 'NAVIGATE YOUR POTENTIAL'],
      line3: ['WITH INTELLIGENT AI ENGINE', 'THROUGH REAL-TIME DATA', 'WITH ADAPTIVE ROADMAPS', 'FOR TOP TECH ROLES']
    }
  ];

  const lines = HEADLINE_LINES[0];

  const cycleHeadline = React.useCallback(() => {
    if (animatingRef.current || !containerRef.current) return;
    animatingRef.current = true;

    const elems = containerRef.current.querySelectorAll('.elem-stacked');
    const totalItems = lines.line1.length;
    const prevIndex = currentIndexRef.current;
    const nextIndex = (prevIndex + 1) % totalItems;

    sounds.playTick();

    // Animate each of the 3 stacked line containers cleanly with opacity mask
    elems.forEach((elem, elemIdx) => {
      const h1s = elem.querySelectorAll('.headline-item');
      const currentH1 = h1s[prevIndex];
      const nextH1 = h1s[nextIndex];

      if (currentH1 && nextH1) {
        // Move current OUT upwards with fade out
        gsap.to(currentH1, {
          yPercent: -120,
          opacity: 0,
          ease: 'expo.easeInOut',
          duration: 1.0,
          delay: elemIdx * 0.04,
          onComplete: () => {
            gsap.set(currentH1, { yPercent: 120, opacity: 0 });
          }
        });

        // Set next below with zero opacity and move IN to yPercent: 0, opacity: 1
        gsap.set(nextH1, { yPercent: 120, opacity: 0 });
        gsap.to(nextH1, {
          yPercent: 0,
          opacity: 1,
          ease: 'expo.easeInOut',
          duration: 1.0,
          delay: elemIdx * 0.04,
          onComplete: () => {
            if (elemIdx === elems.length - 1) {
              currentIndexRef.current = nextIndex;
              setActiveState(nextIndex);
              animatingRef.current = false;
              if (onCycle) onCycle(nextIndex);
            }
          }
        });
      }
    });
  }, [lines.line1.length, onCycle]);

  useEffect(() => {
    // Initial setup: position line items with zero opacity for inactive
    if (!containerRef.current) return;

    const elems = containerRef.current.querySelectorAll('.elem-stacked');
    elems.forEach((elem) => {
      const h1s = elem.querySelectorAll('.headline-item');
      h1s.forEach((h1, i) => {
        if (i === 0) {
          gsap.set(h1, { yPercent: 0, opacity: 1 });
        } else {
          gsap.set(h1, { yPercent: 120, opacity: 0 });
        }
      });
    });

    // Auto cycle pause duration (6 seconds for crisp readability)
    const interval = setInterval(() => {
      cycleHeadline();
    }, 6000);

    return () => clearInterval(interval);
  }, [cycleHeadline]);

  return (
    <div
      ref={containerRef}
      onClick={cycleHeadline}
      className="cursor-pointer select-none space-y-3 md:space-y-5 py-2"
      title="Click to cycle headline"
    >
      {/* Line 1 */}
      <div className="elem-stacked relative h-[56px] sm:h-[72px] md:h-[88px] lg:h-[104px] overflow-hidden">
        {lines.line1.map((text, idx) => (
          <h1
            key={idx}
            className="headline-item absolute top-0 left-0 text-[32px] sm:text-[48px] md:text-[64px] lg:text-[76px] font-black tracking-tight text-[#fafafa] uppercase font-sans leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
          >
            {text}
          </h1>
        ))}
      </div>

      {/* Line 2 */}
      <div className="elem-stacked relative h-[50px] sm:h-[66px] md:h-[82px] lg:h-[96px] overflow-hidden">
        {lines.line2.map((text, idx) => (
          <h1
            key={idx}
            className="headline-item absolute top-0 left-0 text-[28px] sm:text-[42px] md:text-[58px] lg:text-[70px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#6366f1] uppercase font-sans leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
          >
            {text}
          </h1>
        ))}
      </div>

      {/* Line 3 */}
      <div className="elem-stacked relative h-[36px] sm:h-[44px] md:h-[52px] lg:h-[60px] overflow-hidden">
        {lines.line3.map((text, idx) => (
          <h1
            key={idx}
            className="headline-item absolute top-0 left-0 text-[18px] sm:text-[24px] md:text-[32px] lg:text-[38px] font-bold tracking-widest text-[#a1a1aa] uppercase font-sans leading-none"
          >
            {text}
          </h1>
        ))}
      </div>

      {/* Cycle indicator dots */}
      <div className="flex items-center gap-2 pt-6">
        {lines.line1.map((_, idx) => (
          <div
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              if (idx !== currentIndexRef.current) cycleHeadline();
            }}
            className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
              idx === activeState ? 'w-10 bg-[#8b5cf6] shadow-[0_0_12px_#8b5cf6]' : 'w-2 bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.4)]'
            }`}
          />
        ))}
        <span className="text-[11px] font-mono text-[#a1a1aa] uppercase tracking-widest ml-3 font-semibold">
          Phase 0{activeState + 1} / 04 — Click to Cycle
        </span>
      </div>
    </div>
  );
}

export default StackedHeadline;
