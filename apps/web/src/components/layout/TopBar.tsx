'use client';

import React from 'react';
import { Search, Bell, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function TopBar() {
  const [searchValue, setSearchValue] = React.useState('');

  // Fetch resumes dynamically to display latest ATS Score in TopBar
  const { data: resumesResponse } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/api/resume'),
  });

  const resumes = resumesResponse?.data?.data || [];
  const latestResume = resumes[0];
  const atsScore = latestResume?.atsScore ? Math.round(latestResume.atsScore) : null;

  return (
    <header className="h-16 border-b border-[rgba(255,255,255,0.08)] bg-[#0f172a]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input bar */}
      <div className="relative w-80">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-[#94a3b8]" />
        </span>
        <input
          type="text"
          placeholder="Search features or logs... (Press '/')"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-lg py-2 pl-9 pr-4 text-xs text-[#f9fafb] placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#94a3b8] bg-[#0f172a] border border-[rgba(255,255,255,0.08)] rounded">
            /
          </kbd>
        </div>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-4">
        {/* Placement Readiness Badge */}
        {atsScore !== null && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[rgba(59,130,246,0.15)] bg-[rgba(59,130,246,0.05)] text-xs font-medium text-[#3b82f6]">
            <Sparkles className="w-3 h-3 text-[#3b82f6]" />
            Latest ATS: {atsScore}%
          </div>
        )}

        {/* Notifications Button */}
        <button className="p-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#111827] text-[#94a3b8] hover:text-[#f9fafb] hover:bg-[#1f2937] transition-all relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#3b82f6] border border-[#111827]" />
        </button>
      </div>
    </header>
  );
}
