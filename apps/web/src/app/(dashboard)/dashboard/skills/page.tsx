'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Plus, Save, Loader, Award, Star, Compass, Zap, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sounds } from '@/lib/sounds';

export default function SkillsPage() {
  const queryClient = useQueryClient();
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  // Fetch base skills
  const { data: skillsBaseData, isLoading: isBaseLoading } = useQuery({
    queryKey: ['skillsBase'],
    queryFn: () => api.get('/api/skills'),
    enabled: mounted,
  });

  // Fetch radar chart competency data
  const { data: skillsGraphData, isLoading: isGraphLoading } = useQuery({
    queryKey: ['skillsGraph'],
    queryFn: () => api.get('/api/skills/graph'),
    enabled: mounted,
  });

  const baseSkills = skillsBaseData?.data?.data || [];

  React.useEffect(() => {
    if (baseSkills.length > 0) {
      setSkillsList(baseSkills);
      // Default select first skill node
      if (baseSkills[0] && !selectedNodeId) {
        setSelectedNodeId(baseSkills[0].skillId);
      }
    }
  }, [baseSkills]);

  const updateMutation = useMutation({
    mutationFn: (data: { skills: { skillId: string; level: number }[] }) =>
      api.put('/api/skills', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skillsGraph'] });
      queryClient.invalidateQueries({ queryKey: ['skillsBase'] });
      toast.success('Skills database updated!');
      sounds.playChime();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update skills';
      toast.error(msg);
    }
  });

  const addSkillMutation = useMutation({
    mutationFn: (name: string) => api.post('/api/skills', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skillsBase'] });
      queryClient.invalidateQueries({ queryKey: ['skillsGraph'] });
      toast.success('New skill tree node unlocked!');
      sounds.playChime();
      setCustomSkill('');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to unlock node';
      toast.error(msg);
    }
  });

  const radarData = (skillsGraphData?.data?.data || []).map((item: any) => ({
    subject: item.subject.split(' ')[0],
    score: item.score,
    fullMark: 100,
  }));

  const updateSkillLevel = (skillId: string, value: number) => {
    setSkillsList(prev => prev.map(s => s.skillId === skillId ? { ...s, level: value } : s));
  };

  const addCustomSkill = () => {
    if (!customSkill.trim()) return;
    if (skillsList.find(s => s.skill?.name.toLowerCase() === customSkill.toLowerCase())) {
      toast.error('Node already exists in skill tree');
      return;
    }
    addSkillMutation.mutate(customSkill.trim());
  };

  const handleSave = () => {
    updateMutation.mutate({
      skills: skillsList.map(s => ({
        skillId: s.skillId,
        level: s.level,
      })),
    });
  };

  const getSkillColor = (level: number) => {
    if (level >= 75) return '#22C55E';
    if (level >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const handleNodeClick = (skillId: string) => {
    sounds.playTick();
    setSelectedNodeId(skillId);
  };

  const activeSkill = skillsList.find(s => s.skillId === selectedNodeId);

  // Group skills into tree branches
  const categories = [
    { title: 'Core Foundations', desc: 'Core programming and logical thinking bases', index: 0 },
    { title: 'Systems & Algorithms', desc: 'Core computer science theory bounds', index: 1 },
    { title: 'Fullstack Execution', desc: 'Web apps construction competencies', index: 2 }
  ];

  if (!mounted || isBaseLoading || isGraphLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#09090b]">
        <Loader className="w-8 h-8 text-[#3b82f6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header Panel */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-[#8b5cf6] uppercase tracking-widest block font-bold">Vector Graph Node</span>
          <h1 className="font-bold text-3xl text-[#fafafa] tracking-wide uppercase">AI Skill Tree</h1>
          <p className="text-xs text-[#a1a1aa]">Explore and optimize unlocked competencies mapped directly to career paths</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] active:bg-[#6d28d9] text-white rounded-xl py-2.5 px-5 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
        >
          {updateMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {updateMutation.isPending ? 'Syncing...' : 'Sync Skill Tree'}
        </button>
      </motion.div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: SVG Active Skill Tree Map (8 Columns) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-8 bg-[#18181b] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6 border-b border-[rgba(255,255,255,0.04)] pb-4">
            <h2 className="text-xs font-bold text-[#a1a1aa] uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#3b82f6]" />
              <span>Interactive Path Map</span>
            </h2>
            <span className="text-[9px] font-mono text-[#cbd5e1]/40 uppercase font-bold">Click node to audit level</span>
          </div>

          {/* Render the Tree Branches */}
          <div className="space-y-8 relative">
            
            {/* Draw a subtle vertical pathway line linking branches */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-[rgba(255,255,255,0.04)] z-0" />

            {categories.map((category) => {
              // Get skills matching this branch
              const branchSkills = skillsList.filter((_, idx) => idx % 3 === category.index);
              
              return (
                <div key={category.title} className="relative z-10 space-y-4">
                  <div className="pl-12">
                    <span className="text-[9px] font-mono text-[#8b5cf6]/60 uppercase tracking-widest font-bold block">Branch {category.index + 1}</span>
                    <h3 className="text-xs font-bold text-[#fafafa] uppercase tracking-wider">{category.title}</h3>
                    <p className="text-[10px] text-[#a1a1aa]">{category.desc}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 pl-12">
                    {branchSkills.map((userSkill) => {
                      const isSelected = selectedNodeId === userSkill.skillId;
                      const levelVal = userSkill.level;
                      
                      return (
                        <div
                          key={userSkill.skillId}
                          onClick={() => handleNodeClick(userSkill.skillId)}
                          className={`relative border cursor-pointer px-4 py-3 rounded-xl flex items-center gap-3 transition-all select-none ${
                            isSelected
                              ? 'bg-[#8b5cf6]/10 border-[#8b5cf6] text-[#fafafa] shadow-[0_4px_16px_rgba(139,92,246,0.1)] scale-[1.03]'
                              : 'bg-[#09090b] border-[rgba(255,255,255,0.06)] text-[#a1a1aa] hover:border-[rgba(255,255,255,0.15)] hover:text-[#fafafa]'
                          }`}
                        >
                          {/* Inner small status ring */}
                          <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" fill="transparent" />
                              <circle cx="8" cy="8" r="7" stroke={getSkillColor(levelVal)} strokeWidth="1.5" fill="transparent" strokeDasharray={44} strokeDashoffset={44 * (1 - levelVal / 100)} />
                            </svg>
                          </div>

                          <div className="text-left space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider block leading-none">{userSkill.skill?.name}</span>
                            <span className="text-[9px] font-mono text-[#cbd5e1]/40 block leading-none">Proficiency: {levelVal}%</span>
                          </div>

                          {isSelected && (
                            <div className="absolute top-[-3px] right-[-3px] w-2 h-2 rounded-full bg-[#8b5cf6] animate-ping" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add custom node to branch */}
          <div className="mt-8 pt-5 border-t border-[rgba(255,255,255,0.06)]">
            <h4 className="text-[9px] font-mono text-[#a1a1aa] uppercase tracking-widest font-bold mb-3">Unlock competency node</h4>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="e.g. Docker, Rust, System Design..."
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
                disabled={addSkillMutation.isPending}
                className="flex-1 bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-lg py-2 px-3 text-xs text-[#fafafa] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-all"
              />
              <button
                onClick={addCustomSkill}
                disabled={addSkillMutation.isPending}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all shrink-0"
              >
                {addSkillMutation.isPending ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Radar Graph & Node Level Adjuster Drawer (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Node Adjuster Drawer */}
          <AnimatePresence mode="wait">
            {activeSkill ? (
              <motion.div
                key={activeSkill.skillId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#18181b] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 space-y-6"
              >
                <div className="border-b border-[rgba(255,255,255,0.04)] pb-3 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#fafafa] uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[#8b5cf6]" />
                    <span>Audit Node</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#cbd5e1]/40 uppercase tracking-widest font-bold">Adjuster</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-[#cbd5e1]/40 uppercase block">Active Node</span>
                      <h4 className="text-base font-bold text-[#fafafa] uppercase tracking-wider">{activeSkill.skill?.name}</h4>
                    </div>
                    <div
                      className="text-2xl font-mono font-bold"
                      style={{ color: getSkillColor(activeSkill.level) }}
                    >
                      {activeSkill.level}%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-[#cbd5e1]/40 uppercase block">Set Proficiency level</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={activeSkill.level}
                      onChange={(e) => updateSkillLevel(activeSkill.skillId, Number(e.target.value))}
                      className="w-full h-1.5 bg-[#09090b] border border-slate-700 rounded-[10px] appearance-none cursor-pointer accent-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3b82f6]"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-[#09090b] rounded-xl border border-[rgba(255,255,255,0.04)] space-y-1.5">
                  <span className="text-[8px] font-mono text-[#cbd5e1]/40 uppercase font-bold tracking-widest block">AI Career Vector Recommendation</span>
                  <p className="text-[10px] text-[#a1a1aa] leading-relaxed">
                    Increasing this skill node value updates your holistic Placement Readiness score index instantly. Use trackers to verify.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#18181b] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 text-center text-xs text-[#a1a1aa] h-32 flex items-center justify-center">
                Select a competency node in the tree path to verify levels.
              </div>
            )}
          </AnimatePresence>

          {/* Mini Radar Graph */}
          <div className="bg-[#18181b] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 h-[280px] flex flex-col justify-between">
            <h3 className="text-xs font-bold text-[#a1a1aa] uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#8b5cf6]" />
              <span>Competency Radar</span>
            </h3>

            <div className="flex-1 w-full min-h-[180px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.04)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 8, fontFamily: 'sans-serif' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="rgba(255,255,255,0.04)" />
                  <Radar name="Skills" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
