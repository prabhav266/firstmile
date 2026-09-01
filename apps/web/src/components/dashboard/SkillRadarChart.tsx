'use client';

import React from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const mockData = [
  { subject: 'DSA', score: 85, fullMark: 100 },
  { subject: 'Development', score: 75, fullMark: 100 },
  { subject: 'ML/AI', score: 60, fullMark: 100 },
  { subject: 'System Design', score: 50, fullMark: 100 },
  { subject: 'Cloud & DevOps', score: 40, fullMark: 100 },
  { subject: 'Resume Score', score: 80, fullMark: 100 },
];

export function SkillRadarChart() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: skillsGraphResponse } = useQuery({
    queryKey: ['skillsGraph'],
    queryFn: () => api.get('/api/skills/graph'),
    enabled: mounted,
  });

  const skillsData = skillsGraphResponse?.data?.data || [];
  
  // Format graph data to fit Recharts
  const chartData = skillsData.length > 0 
    ? skillsData.map((item: any) => ({
        subject: item.subject || item.name,
        score: item.score || item.level || 0,
        fullMark: 100
      }))
    : mockData;

  if (!mounted) {
    return (
      <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 h-[340px] flex items-center justify-center text-xs text-[#94a3b8]">
        Loading skills analysis...
      </div>
    );
  }

  return (
    <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 h-[340px] flex flex-col justify-between">
      <h3 className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Skill Proficiency Analysis</h3>
      
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="rgba(255, 255, 255, 0.04)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255, 255, 255, 0.2)', fontSize: 7 }} />
            <Radar
              name="Skills"
              dataKey="score"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.12}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default SkillRadarChart;
