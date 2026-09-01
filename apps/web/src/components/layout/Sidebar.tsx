'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { 
  LayoutDashboard, FileText, Compass, Code, Brain, 
  Briefcase, Star, Calendar, MessageSquare, BarChart, 
  Settings, ShieldAlert, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Resume Analyzer', href: '/dashboard/resume', icon: FileText },
  { name: 'Roadmap Generator', href: '/dashboard/roadmap', icon: Compass },
  { name: 'Coding Tracker', href: '/dashboard/coding', icon: Code },
  { name: 'ML Learning Tracker', href: '/dashboard/ml-tracker', icon: Brain },
  { name: 'Projects Recommend', href: '/dashboard/projects', icon: Briefcase },
  { name: 'Placement Readiness', href: '/dashboard/readiness', icon: Star },
  { name: 'Weekly Planner', href: '/dashboard/planner', icon: Calendar },
  { name: 'AI Mock Interview', href: '/dashboard/interview', icon: MessageSquare },
  { name: 'Skill Graph', href: '/dashboard/skills', icon: Settings },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Fetch actual user profile for top greeting / bottom avatar
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/api/auth/me'),
  });

  const user = userProfile?.data?.data || {};
  const isAdmin = user.role === 'ADMIN';

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'ST';
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
      router.push('/login');
    } catch (err) {
      console.error(err);
      router.push('/login');
    }
  };

  return (
    <aside className="h-screen fixed left-0 top-0 z-40 border-r border-[rgba(255,255,255,0.08)] bg-[#0f172a] flex flex-col justify-between w-60">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between px-5 py-5 border-b border-[rgba(255,255,255,0.08)]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-sans font-bold text-sm tracking-wider text-[#3b82f6]">PATHFORGE AI</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className="block">
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-xs transition-all cursor-pointer",
                  isActive 
                    ? "text-[#f9fafb] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.04)]" 
                    : "text-[#94a3b8] hover:text-[#f9fafb] hover:bg-[rgba(255,255,255,0.03)]"
                )}>
                  <item.icon className={cn("w-4 h-4", isActive ? "text-[#3b82f6]" : "text-[#94a3b8]")} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}

          {isAdmin && (
            <Link href="/admin" className="block pt-3 border-t border-[rgba(255,255,255,0.08)]">
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-xs text-[#8b5cf6] hover:bg-[rgba(139,92,246,0.05)] transition-all",
                pathname === '/admin' ? "bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.15)]" : ""
              )}>
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Panel</span>
              </div>
            </Link>
          )}
        </nav>
      </div>

      {/* User profile & logout info at bottom */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.08)] bg-[#111827]/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1f2937] border border-[rgba(255,255,255,0.08)] flex items-center justify-center font-bold text-xs text-[#3b82f6]">
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#f9fafb] truncate max-w-[100px]">{user.name || 'Student'}</span>
              <span className="text-[10px] text-[#94a3b8] capitalize">{user.role?.toLowerCase() || 'Student'}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-1.5 rounded-md hover:bg-[#ef4444]/10 text-[#94a3b8] hover:text-[#ef4444] transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
