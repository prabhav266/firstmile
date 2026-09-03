'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function TopBar() {
  const [searchValue, setSearchValue] = React.useState('');

  // Fetch resumes dynamically to display latest ATS Score in TopBar
  const { data: resumesResponse } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/api/resume'),
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/api/auth/me'),
  });

  const user = userProfile?.data?.data || {};
  const rawResumes = resumesResponse?.data?.data;
  const resumes = Array.isArray(rawResumes) ? rawResumes : [];
  const latestResume = resumes[0];
  const atsScore = latestResume?.atsScore ? Math.round(latestResume.atsScore) : null;

  return (
    <header className="h-14 border-b border-[#1a1a1a] bg-[#000000] px-8 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Search Input bar */}
      <div className="relative w-80">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 text-[#666666]" />
        </span>
        <input
          type="text"
          placeholder="Search modules, questions, roadmaps... ('/')"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full bg-[#0a0a0a] border border-[#242424] rounded-md py-1.5 pl-8 pr-4 text-xs text-[#ffffff] placeholder-[#666666] focus:outline-none focus:border-[#ffffff] transition-all font-mono"
        />
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-[#666666] bg-[#141414] border border-[#242424] rounded">
            /
          </kbd>
        </div>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-2.5">
        {/* ATS Score Badge */}
        {atsScore !== null && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#242424] bg-[#0d0d0d] text-[11px] font-mono text-[#b5b5b5]">
            <span className="text-[#666666]">ATS</span>
            <span className="font-bold text-[#ffffff]">{atsScore}%</span>
          </div>
        )}

        {/* Dual Mode Theme Switcher (Dark / Light) */}
        <ThemeToggle />

        {/* Notifications Button */}
        <button className="p-1.5 rounded border border-[#242424] bg-[#0a0a0a] text-[#888888] hover:text-[#ffffff] hover:border-[#444444] transition-all relative">
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#ffffff]" />
        </button>

        {/* Quick Profile Link */}
        <Link
          href="/dashboard/profile"
          className="p-1.5 rounded border border-[#242424] bg-[#0a0a0a] text-[#888888] hover:text-[#ffffff] hover:border-[#444444] transition-all"
          title="Profile Settings"
        >
          <User className="w-3.5 h-3.5" />
        </Link>
      </div>
    </header>
  );
}
