'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Loader, Cpu, Sparkles, Terminal } from 'lucide-react';
import { sounds } from '@/lib/sounds';

export function InteractiveDemoSection() {
  const [demoTab, setDemoTab] = useState<'resume' | 'roadmap' | 'interview'>('resume');
  const [isThinking, setIsThinking] = useState(false);
  const [demoResult, setDemoResult] = useState<any>(null);
  const [typedText, setTypedText] = useState('');

  const handleRunDemo = (type: 'resume' | 'roadmap' | 'interview') => {
    setDemoTab(type);
    setIsThinking(true);
    setDemoResult(null);
    setTypedText('');
    sounds.playTick();

    setTimeout(() => {
      setIsThinking(false);
      let res = '';
      if (type === 'resume') {
        res = `{\n  "ats_score": 88.5,\n  "missing_skills": ["System Design", "Redis", "Docker", "gRPC"],\n  "weak_bullets": ["Assisted in backend development" -> "Engineered event-driven microservices scaling query throughput by 35%"],\n  "placement_readiness": "Tier-1 Ready"\n}`;
      } else if (type === 'roadmap') {
        res = `{\n  "target_company": "Microsoft SDE",\n  "timeline": "6 Months",\n  "weekly_target": "DP variations, Graph BFS/DFS, Database Sharding",\n  "recommended_resources": ["Striver A2Z", "System Design Primer"]\n}`;
      } else {
        res = `{\n  "evaluation_score": 8.5,\n  "correctness": "Accurate definition of processes vs threads.",\n  "grammar": "Clean speech, concise articulation.",\n  "technical_feedback": "Explain virtual address spaces next time for deep impact."\n}`;
      }
      setDemoResult(res);

      let index = 0;
      const interval = setInterval(() => {
        setTypedText((prev) => prev + res.charAt(index));
        index++;
        if (index >= res.length) {
          clearInterval(interval);
          sounds.playChime();
        }
      }, 8);
    }, 1200);
  };

  return (
    <section id="demo" className="relative py-32 px-6 md:px-12 max-w-7xl mx-auto z-10">
      <div className="bg-[#18181b]/70 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-3xl p-8 md:p-12 overflow-hidden relative shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[rgba(255,255,255,0.06)] pb-8">
          <div className="space-y-2">
            <span className="text-xs font-mono text-[#3b82f6] uppercase tracking-widest block font-bold">08 — INTERACTIVE AI TERMINAL</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#fafafa] tracking-tight uppercase">Try PathForge AI Engine</h2>
          </div>
          <p className="text-xs text-[#a1a1aa] max-w-md leading-relaxed">
            Test live simulated queries against our AI microservice pipeline right in the browser.
          </p>
        </div>

        {/* Demo Selector Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => handleRunDemo('resume')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              demoTab === 'resume' ? 'bg-[#3b82f6] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-[#09090b] text-[#a1a1aa] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Audit Resume ATS</span>
          </button>
          <button
            onClick={() => handleRunDemo('roadmap')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              demoTab === 'roadmap' ? 'bg-[#8b5cf6] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'bg-[#09090b] text-[#a1a1aa] hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Generate Roadmap</span>
          </button>
          <button
            onClick={() => handleRunDemo('interview')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              demoTab === 'interview' ? 'bg-[#10b981] text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-[#09090b] text-[#a1a1aa] hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>AI Mock Interview</span>
          </button>
        </div>

        {/* Live Code Terminal Window */}
        <div className="bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden font-mono">
          <div className="bg-[#18181b] px-4 py-3 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
              <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
              <span className="w-3 h-3 rounded-full bg-[#10b981]" />
              <span className="text-xs text-[#a1a1aa] ml-2">pathforge-ai-engine.sh</span>
            </div>
            <span className="text-[10px] text-[#8b5cf6] font-bold uppercase">REST API Stream</span>
          </div>

          <div className="p-6 text-xs min-h-[220px] max-h-[320px] overflow-y-auto space-y-4">
            <div className="flex items-center gap-2 text-[#3b82f6]">
              <span>$</span>
              <span>pathforge-ai analyze --type={demoTab} --target=&quot;Tier-1 Tech SDE&quot;</span>
            </div>

            {isThinking && (
              <div className="flex items-center gap-3 text-[#a1a1aa] animate-pulse py-4">
                <Loader className="w-4 h-4 text-[#8b5cf6] animate-spin" />
                <span>Executing Gemini LLM prompt pipeline & NLP keyword extraction...</span>
              </div>
            )}

            {typedText && (
              <pre className="text-[#10b981] whitespace-pre-wrap font-mono leading-relaxed bg-[#18181b]/40 p-4 rounded-xl border border-[rgba(255,255,255,0.04)]">
                {typedText}
              </pre>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteractiveDemoSection;
