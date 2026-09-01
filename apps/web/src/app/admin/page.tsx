'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Users, UserPlus, Activity, ShieldAlert,
  Search, TrendingUp, Server, Database, Cpu
} from 'lucide-react';

const MOCK_USERS = [
  { id: '1', name: 'Prabhav Sharma', email: 'prabhav@iit.ac.in', college: 'IIT Delhi', year: 3, score: 82, createdAt: '2025-01-15', role: 'STUDENT' },
  { id: '2', name: 'Ananya Reddy', email: 'ananya@bits.ac.in', college: 'BITS Pilani', year: 4, score: 91, createdAt: '2025-01-20', role: 'STUDENT' },
  { id: '3', name: 'Rohan Gupta', email: 'rohan@nit.ac.in', college: 'NIT Trichy', year: 3, score: 68, createdAt: '2025-02-01', role: 'STUDENT' },
  { id: '4', name: 'Shreya Patel', email: 'shreya@vit.ac.in', college: 'VIT Vellore', year: 2, score: 55, createdAt: '2025-02-10', role: 'STUDENT' },
  { id: '5', name: 'Karthik Nair', email: 'karthik@amrita.ac.in', college: 'Amrita University', year: 3, score: 74, createdAt: '2025-03-05', role: 'STUDENT' },
];

export default function AdminPage() {
  const [search, setSearch] = React.useState('');

  const filtered = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.college.toLowerCase().includes(search.toLowerCase())
  );

  const avgScore = Math.round(MOCK_USERS.reduce((s, u) => s + u.score, 0) / MOCK_USERS.length);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/30 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-[#06b6d4]" />
        </div>
        <div>
          <h1 className="font-display font-bold text-3xl text-[#f8fafc]">Admin Panel</h1>
          <p className="text-sm text-[#94a3b8]">Platform management and analytics overview</p>
        </div>
      </motion.div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '2,847', icon: Users, color: '#7c3aed', sub: 'All time' },
          { label: 'New This Week', value: '184', icon: UserPlus, color: '#10b981', sub: '+12% vs last week' },
          { label: 'Avg Readiness', value: `${avgScore}%`, icon: TrendingUp, color: '#f59e0b', sub: 'Across all users' },
          { label: 'API Calls Today', value: '12.4k', icon: Activity, color: '#06b6d4', sub: '98.5% success rate' },
        ].map((kpi) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">{kpi.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}20` }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
            </div>
            <div className="text-2xl font-mono font-bold text-[#f8fafc]">{kpi.value}</div>
            <div className="text-xs text-[#94a3b8] mt-1">{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'API Server', status: 'Operational', icon: Server, load: 34 },
          { label: 'ML Service', status: 'Operational', icon: Cpu, load: 58 },
          { label: 'PostgreSQL DB', status: 'Operational', icon: Database, load: 22 },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <s.icon className="w-4 h-4 text-[#94a3b8]" />
                <span className="text-sm font-medium text-[#f8fafc]">{s.label}</span>
              </div>
              <span className="text-xs font-semibold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full">
                {s.status}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[#94a3b8]">
                <span>CPU Load</span>
                <span>{s.load}%</span>
              </div>
              <div className="h-1.5 bg-[#1e2433] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#10b981] transition-all duration-500"
                  style={{ width: `${s.load}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-[#94a3b8] uppercase tracking-wider">Registered Students</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#181d2e] border border-[#1e2433] rounded-xl py-2 pl-9 pr-3 text-sm text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#7c3aed] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider border-b border-[#1e2433]">
                <th className="pb-3 text-left">Student</th>
                <th className="pb-3 text-left">College</th>
                <th className="pb-3 text-center">Year</th>
                <th className="pb-3 text-center">Readiness</th>
                <th className="pb-3 text-left">Joined</th>
                <th className="pb-3 text-center">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2433]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[#181d2e]/50 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#06b6d4] flex items-center justify-center text-xs font-bold text-white">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-[#f8fafc]">{user.name}</div>
                        <div className="text-xs text-[#94a3b8]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-[#94a3b8]">{user.college}</td>
                  <td className="py-3.5 text-center text-[#94a3b8]">Year {user.year}</td>
                  <td className="py-3.5 text-center">
                    <span className={`font-mono font-bold ${user.score >= 75 ? 'text-[#10b981]' : user.score >= 50 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                      {user.score}%
                    </span>
                  </td>
                  <td className="py-3.5 text-[#94a3b8] text-xs">{user.createdAt}</td>
                  <td className="py-3.5 text-center">
                    <span className="text-xs px-2.5 py-0.5 rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/10 text-[#7c3aed] font-semibold">
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-[#1e2433] flex items-center justify-between text-xs text-[#94a3b8]">
          <span>Showing {filtered.length} of {MOCK_USERS.length} users</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded-lg border border-[#1e2433] hover:bg-[#181d2e] transition-all">Prev</button>
            <button className="px-3 py-1.5 rounded-lg border border-[#7c3aed]/30 bg-[#7c3aed]/10 text-[#7c3aed]">1</button>
            <button className="px-3 py-1.5 rounded-lg border border-[#1e2433] hover:bg-[#181d2e] transition-all">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
