'use client';

import React, { useState } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Plus, Save, Award, Target, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sounds } from '@/lib/sounds';

export default function SkillsPage() {
  const queryClient = useQueryClient();
  const [skillsList, setSkillsList] = useState<any[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: skillsBaseData } = useQuery({
    queryKey: ['skillsBase'],
    queryFn: () => api.get('/api/skills'),
    enabled: mounted,
  });

  const { data: skillsGraphData } = useQuery({
    queryKey: ['skillsGraph'],
    queryFn: () => api.get('/api/skills/graph'),
    enabled: mounted,
  });

  const baseSkills = React.useMemo(() => skillsBaseData?.data?.data || [], [skillsBaseData?.data?.data]);

  React.useEffect(() => {
    if (baseSkills.length > 0) {
      setSkillsList(baseSkills);
    }
  }, [baseSkills]);

  const updateMutation = useMutation({
    mutationFn: (data: { skills: { skillId: string; level: number }[] }) =>
      api.put('/api/skills', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skillsGraph'] });
      queryClient.invalidateQueries({ queryKey: ['skillsBase'] });
      toast.success('Skill proficiencies saved');
      sounds.playChime();
    },
    onError: () => toast.error('Failed to update skills'),
  });

  const addSkillMutation = useMutation({
    mutationFn: (name: string) => api.post('/api/skills', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skillsBase'] });
      queryClient.invalidateQueries({ queryKey: ['skillsGraph'] });
      toast.success('Skill added to matrix');
      setCustomSkill('');
    },
    onError: () => toast.error('Failed to add skill'),
  });

  const radarData = (skillsGraphData?.data?.data || []).map((item: any) => ({
    subject: item.subject.split(' ')[0],
    score: item.score,
    fullMark: 100,
  }));

  const fallbackRadar = [
    { subject: 'DSA', score: 85, fullMark: 100 },
    { subject: 'SysDesign', score: 70, fullMark: 100 },
    { subject: 'React', score: 90, fullMark: 100 },
    { subject: 'Node.js', score: 80, fullMark: 100 },
    { subject: 'SQL', score: 75, fullMark: 100 },
    { subject: 'DevOps', score: 65, fullMark: 100 },
  ];

  const chartData = radarData.length > 0 ? radarData : fallbackRadar;

  const updateSkillLevel = (skillId: string, value: number) => {
    setSkillsList((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, level: value } : s))
    );
  };

  const handleSave = () => {
    updateMutation.mutate({
      skills: skillsList.map((s) => ({
        skillId: s.skillId,
        level: s.level,
      })),
    });
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl">
      {/* Header */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block mb-1">
            Competency Topology
          </span>
          <h1 className="font-display font-bold text-2xl text-[#ffffff] tracking-tight">
            Technical Skill Matrix
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-0.5">
            Full-stack engineering proficiency graph benchmarking core domain depth
          </p>
        </div>

        <button onClick={handleSave} disabled={updateMutation.isPending} className="btn-primary py-2 px-5 gap-1.5 text-xs">
          <Save size={13} />
          <span>Save Matrix</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Grayscale Radar Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 flex flex-col items-center justify-center min-h-[360px]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] self-start mb-2">
            Skill Radar Topology
          </span>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#242424" />
                <PolarAngleAxis dataKey="subject" stroke="#888888" tick={{ fill: '#888888', fontSize: 11, fontFamily: 'monospace' }} />
                <PolarRadiusAxis stroke="#1a1a1a" domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Proficiency" dataKey="score" stroke="#ffffff" fill="#ffffff" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Skill Level Sliders (7 Cols) */}
        <div className="lg:col-span-7 bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
            <span className="font-bold text-[#ffffff] uppercase tracking-wider">Proficiency Sliders</span>
            <span className="text-[#888888]">{skillsList.length} Skills Logged</span>
          </div>

          <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
            {skillsList.map((item) => (
              <div key={item.skillId || item.id} className="space-y-1 bg-[#000000] border border-[#1e1e1e] p-3 rounded">
                <div className="flex justify-between text-xs">
                  <span className="text-[#ffffff] font-medium">{item.skill?.name || 'Skill'}</span>
                  <span className="text-[#888888]">{item.level || 50}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={item.level || 50}
                  onChange={(e) => updateSkillLevel(item.skillId, Number(e.target.value))}
                  className="w-full accent-white bg-[#141414] h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#1a1a1a] flex gap-2">
            <input
              type="text"
              placeholder="Add new skill to matrix (e.g. Kubernetes, Redis)..."
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              className="flex-1 bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
            />
            <button
              type="button"
              onClick={() => customSkill.trim() && addSkillMutation.mutate(customSkill.trim())}
              disabled={addSkillMutation.isPending}
              className="btn-secondary py-1.5 px-4 text-xs"
            >
              Add Skill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
