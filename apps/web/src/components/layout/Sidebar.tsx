'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  LayoutDashboard, FileText, Compass, Code,
  Briefcase, Star, Calendar, MessageSquare, BarChart, 
  Settings, ShieldAlert, LogOut, Building2, Users, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGamificationStore } from '@/lib/gamification';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

// 1. Student Navigation Menu (Clean & Laser-Focused on Placements)
const STUDENT_NAV: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Coding Tracker', href: '/dashboard/coding', icon: Code },
  { name: 'Voice Mock Screener', href: '/dashboard/interview', icon: MessageSquare },
  { name: 'Resume Analyzer', href: '/dashboard/resume', icon: FileText },
  { name: 'Career Roadmap', href: '/dashboard/roadmap', icon: Compass },
  { name: 'Portfolio Projects', href: '/dashboard/projects', icon: Briefcase },
  { name: 'Placement Readiness', href: '/dashboard/readiness', icon: Star },
  { name: 'Weekly Planner', href: '/dashboard/planner', icon: Calendar },
  { name: 'Skill Matrix', href: '/dashboard/skills', icon: Settings },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Profile Settings', href: '/dashboard/profile', icon: User },
];

// 2. Recruiter Navigation Menu (Monochrome Talent Search)
const RECRUITER_NAV: NavItem[] = [
  { name: 'Talent Discovery', href: '/dashboard/recruiter', icon: Users },
  { name: 'Resume Auditor', href: '/dashboard/resume', icon: FileText },
  { name: 'Voice Screener Suite', href: '/dashboard/interview', icon: MessageSquare },
  { name: 'Talent Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Profile Settings', href: '/dashboard/profile', icon: User },
];

// 3. University TPO Navigation Menu (Monochrome Placement Center)
const TPO_NAV: NavItem[] = [
  { name: 'Placement Cell', href: '/dashboard/tpo', icon: Building2 },
  { name: 'Mock Screener Center', href: '/dashboard/interview', icon: MessageSquare },
  { name: 'Resume Auditor', href: '/dashboard/resume', icon: FileText },
  { name: 'Cohort Analytics', href: '/dashboard/analytics', icon: BarChart },
  { name: 'Profile Settings', href: '/dashboard/profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Fetch actual user profile
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/api/auth/me'),
  });

  const user = userProfile?.data?.data || {};
  const role = (user.role || 'STUDENT') as 'STUDENT' | 'RECRUITER' | 'TPO' | 'ADMIN';
  const isAdmin = role === 'ADMIN';

  // Select navigation items by role
  let navItems = STUDENT_NAV;
  let homeRoute = '/dashboard';

  if (role === 'RECRUITER') {
    navItems = RECRUITER_NAV;
    homeRoute = '/dashboard/recruiter';
  } else if (role === 'TPO') {
    navItems = TPO_NAV;
    homeRoute = '/dashboard/tpo';
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'FM';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error(err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pathforge-career-os-gamification');
        localStorage.removeItem('auth-token');
        document.cookie = 'auth-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; SameSite=Lax';
      }
      useGamificationStore.getState().resetProgress();
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <aside className="h-screen fixed left-0 top-0 z-40 border-r border-[#1a1a1a] bg-[#000000] flex flex-col justify-between w-60 font-sans select-none">
      {/* Top Header & Brand Wordmark */}
      <div>
        <div className="px-5 py-4 border-b border-[#1a1a1a] flex items-center justify-between">
          <Link href={homeRoute} className="flex items-center gap-2 group">
            <span className="font-display font-black text-sm tracking-widest text-[#ffffff] uppercase group-hover:text-[#b5b5b5] transition-colors">
              FIRST MILE
            </span>
          </Link>
          <span className="px-2 py-0.5 rounded border border-[#27272a] bg-[#0d0d0d] text-[9px] font-mono font-bold uppercase tracking-wider text-[#b5b5b5]">
            {role}
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-4 space-y-0.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="block">
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md font-medium text-xs transition-all cursor-pointer",
                  isActive 
                    ? "text-[#ffffff] bg-[#121212] border border-[#242424]" 
                    : "text-[#888888] hover:text-[#ffffff] hover:bg-[#0a0a0a]"
                )}>
                  <item.icon className={cn("w-3.5 h-3.5", isActive ? "text-[#ffffff]" : "text-[#666666]")} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}

          {isAdmin && (
            <Link href="/admin" className="block pt-3 border-t border-[#1a1a1a] mt-3">
              <div className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md font-medium text-xs text-[#b5b5b5] hover:text-[#ffffff] hover:bg-[#0a0a0a] transition-all",
                pathname === '/admin' ? "bg-[#121212] border border-[#242424] text-white" : ""
              )}>
                <ShieldAlert className="w-3.5 h-3.5 text-[#888888]" />
                <span>Admin Console</span>
              </div>
            </Link>
          )}
        </nav>
      </div>

      {/* User profile link & logout at bottom */}
      <div className="p-3 border-t border-[#1a1a1a] bg-[#050505]">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
            title="Open Profile Settings"
          >
            <div className="w-7 h-7 rounded bg-[#111111] border border-[#242424] flex items-center justify-center font-mono font-bold text-[10px] text-[#ffffff] shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#ffffff] truncate">{user.name || 'User'}</span>
              <span className="text-[10px] text-[#666666] capitalize truncate">
                {role === 'STUDENT' ? user.branch || 'Student' : role === 'RECRUITER' ? user.company || 'Recruiter' : user.institutionName || 'Placement Officer'}
              </span>
            </div>
          </Link>

          <button 
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-[#1a1a1a] text-[#666666] hover:text-[#ffffff] transition-all shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
