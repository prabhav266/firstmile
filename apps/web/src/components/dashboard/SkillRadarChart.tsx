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
  { subject: 'System Design', score: 70, fullMark: 100 },
  { subject: 'Full Stack', score: 80, fullMark: 100 },
  { subject: 'Databases', score: 75, fullMark: 100 },
  { subject: 'Core CS', score: 65, fullMark: 100 },
  { subject: 'Resume Benchmark', score: 84, fullMark: 100 },
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
  
  const chartData = skillsData.length > 0 
    ? skillsData.map((item: any) => ({
        subject: item.subject || item.name,
        score: item.score || item.level || 0,
        fullMark: 100
      }))
    : mockData;

  if (!mounted) {
    return (
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 h-[340px] flex items-center justify-center text-xs font-mono text-[#666666]">
        Loading skills analysis...
      </div>
    );
  }

  return (
    <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 h-[340px] flex flex-col justify-between">
      <h3 className="text-[11px] font-mono text-[#888888] uppercase tracking-wider mb-2">Technical Skill Matrix</h3>
      
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#1a1a1a" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#888888', fontSize: 9 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#444444', fontSize: 7 }} />
            <Radar
              name="Skills"
              dataKey="score"
              stroke="#ffffff"
              fill="#ffffff"
              fillOpacity={0.08}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default SkillRadarChart;
