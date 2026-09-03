'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Users,
  Award,
  Download,
  Plus,
  Calendar,
  Sparkles,
  Search,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { sounds } from '@/lib/sounds';

interface StudentCandidate {
  id: string;
  name: string;
  email: string;
  department: string;
  graduationYear: number;
  leetcodeUsername?: string;
  githubUsername?: string;
  leetcodeSolved: number;
  atsScore: number;
  readinessScore: number;
  tier: string;
  status: string;
}

interface CampusDrive {
  id: string;
  companyName: string;
  role: string;
  packageLpa: number;
  driveDate: string;
  minReadinessCut: number;
  minLeetCodeCut: number;
  minAtsCut: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  eligibleBranches: string[];
  description?: string;
}

export default function CampusTpoPage() {
  const queryClient = useQueryClient();

  // Filter States
  const [department, setDepartment] = useState('All');
  const [minReadiness, setMinReadiness] = useState<number>(0);
  const [minLeetCode, setMinLeetCode] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'roster' | 'drives' | 'analytics'>('roster');

  // Modal States
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // New Drive Form
  const [driveForm, setDriveForm] = useState({
    companyName: '',
    role: '',
    packageLpa: '',
    driveDate: '',
    minReadinessCut: 75,
    minLeetCodeCut: 100,
    minAtsCut: 75,
    description: '',
  });

  // 1. Fetch TPO Overview Batch Analytics
  const { data: overviewData, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['tpoOverview'],
    queryFn: () => api.get('/api/tpo/overview'),
  });

  // 2. Fetch Students Roster with active filters
  const { data: studentsData, isLoading: isStudentsLoading } = useQuery({
    queryKey: ['tpoStudents', department, minReadiness, minLeetCode, searchQuery],
    queryFn: () =>
      api.get('/api/tpo/students', {
        params: {
          department,
          minReadiness: minReadiness > 0 ? minReadiness : undefined,
          minLeetCode: minLeetCode > 0 ? minLeetCode : undefined,
          search: searchQuery || undefined,
        },
      }),
  });

  // 3. Fetch Campus Drives
  const { data: drivesData, isLoading: isDrivesLoading } = useQuery({
    queryKey: ['tpoDrives'],
    queryFn: () => api.get('/api/tpo/drives'),
  });

  // Schedule Drive Mutation
  const createDriveMutation = useMutation({
    mutationFn: (formData: any) => api.post('/api/tpo/drives', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tpoDrives'] });
      queryClient.invalidateQueries({ queryKey: ['tpoOverview'] });
      sounds.playChime();
      toast.success('Campus recruitment drive scheduled!');
      setShowDriveModal(false);
      setDriveForm({
        companyName: '',
        role: '',
        packageLpa: '',
        driveDate: '',
        minReadinessCut: 75,
        minLeetCodeCut: 100,
        minAtsCut: 75,
        description: '',
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to schedule campus drive');
    },
  });

  // Export CSV Dossier
  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const res = await api.get('/api/tpo/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FirstMile_Campus_Candidate_Dossier_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      sounds.playChime();
      toast.success('Candidate Dossier exported successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export candidate dossier');
    } finally {
      setIsExporting(false);
    }
  };

  const overview = overviewData?.data?.data || {};
  const summary = overview.summary || {
    totalEnrolled: 450,
    avgReadiness: 76,
    avgAts: 79,
    avgLeetCode: 168,
    activeDrivesCount: 4,
    tier1EliteCount: 128,
    tier2ReadyCount: 194,
    needsInterventionCount: 128,
  };
  const departmentStats = overview.departmentStats || [];
  const students: StudentCandidate[] = studentsData?.data?.data?.students || [];
  const drives: CampusDrive[] = drivesData?.data?.data || [];

  return (
    <div className="space-y-6 font-sans max-w-7xl select-none">
      {/* Top Editorial Banner */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-mono text-[10px] text-[#666666] uppercase">
              <Building2 className="w-3.5 h-3.5 text-[#ffffff]" />
              <span>FIRST MILE • CAMPUS PLACEMENT COMMAND</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-[#ffffff] tracking-tight">University Placement Center</h1>
            <p className="text-xs text-[#888888] font-mono mt-0.5 max-w-2xl">
              Monitor multi-department student readiness, coordinate visiting corporate drives, and export candidate dossiers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              disabled={isExporting}
              className="btn-secondary py-2 px-3 text-xs gap-1.5"
            >
              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowDriveModal(true)}
              className="btn-primary py-2 px-3.5 text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Drive</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4">
          <span className="text-[9px] font-mono text-[#666666] uppercase tracking-wider block">Total Batch Enrolled</span>
          <div className="text-2xl font-bold font-display text-[#ffffff] mt-1">{summary.totalEnrolled} Candidates</div>
          <span className="text-[10px] font-mono text-[#888888]">Across 4 Engineering Branches</span>
        </div>

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4">
          <span className="text-[9px] font-mono text-[#666666] uppercase tracking-wider block">Batch Avg Readiness</span>
          <div className="text-2xl font-bold font-display text-[#ffffff] mt-1">{summary.avgReadiness}% Index</div>
          <span className="text-[10px] font-mono text-[#888888]">Readiness distribution score</span>
        </div>

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4">
          <span className="text-[9px] font-mono text-[#666666] uppercase tracking-wider block">Avg LeetCode Solves</span>
          <div className="text-2xl font-bold font-display text-[#ffffff] mt-1">{summary.avgLeetCode} Solves</div>
          <span className="text-[10px] font-mono text-[#888888]">Per verified student profile</span>
        </div>

        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4">
          <span className="text-[9px] font-mono text-[#666666] uppercase tracking-wider block">Active Corporate Drives</span>
          <div className="text-2xl font-bold font-display text-[#ffffff] mt-1">{summary.activeDrivesCount} Scheduled</div>
          <span className="text-[10px] font-mono text-[#888888]">Tier-1 visiting recruiters</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#1a1a1a] pb-2 text-xs font-mono">
        {[
          { id: 'roster', label: `Candidate Roster (${students.length})` },
          { id: 'drives', label: `Corporate Drives (${drives.length})` },
          { id: 'analytics', label: 'Departmental Matrix' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === tab.id
                ? 'bg-[#ffffff] text-[#000000] font-bold'
                : 'text-[#888888] hover:text-[#ffffff]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Candidate Roster */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#080808] p-3.5 rounded-lg border border-[#1a1a1a]">
            <div>
              <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-2.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              >
                <option value="All">All Branches</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="IT">Information Tech (IT)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="AI">AI & Data Science (AI/DS)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Min Readiness Index</label>
              <select
                value={minReadiness}
                onChange={(e) => setMinReadiness(Number(e.target.value))}
                className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-2.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              >
                <option value={0}>Any Readiness</option>
                <option value={70}>70%+ Readiness</option>
                <option value={80}>80%+ Readiness</option>
                <option value={90}>90%+ Tier-1 Elite</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Min DSA Solves</label>
              <select
                value={minLeetCode}
                onChange={(e) => setMinLeetCode(Number(e.target.value))}
                className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-2.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              >
                <option value={0}>Any Solves</option>
                <option value={100}>100+ Solves</option>
                <option value={200}>200+ Solves</option>
                <option value={300}>300+ Solves</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Search Student</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#666666]" />
                <input
                  type="text"
                  placeholder="Student name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 pl-8 pr-3 text-xs text-[#ffffff] placeholder-[#444444] focus:outline-none focus:border-[#ffffff]"
                />
              </div>
            </div>
          </div>

          {/* Student Table */}
          {isStudentsLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-2">
              <Loader2 className="w-6 h-6 text-[#ffffff] animate-spin" />
              <p className="text-xs font-mono text-[#666666]">Querying student cohort...</p>
            </div>
          ) : (
            <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#000000] border-b border-[#1a1a1a] text-[#666666] font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">LeetCode Solves</th>
                    <th className="p-3">ATS Score</th>
                    <th className="p-3">Readiness Index</th>
                    <th className="p-3">Placement Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-[#0d0d0d]">
                      <td className="p-3">
                        <div className="font-bold text-[#ffffff]">{s.name}</div>
                        <div className="text-[10px] font-mono text-[#666666]">{s.email}</div>
                      </td>
                      <td className="p-3 font-mono text-[#888888]">{s.department}</td>
                      <td className="p-3 font-mono text-[#ffffff] font-semibold">{s.leetcodeSolved}+ Solved</td>
                      <td className="p-3 font-mono text-[#ffffff] font-semibold">{s.atsScore}%</td>
                      <td className="p-3 font-mono text-[#ffffff] font-bold">{s.readinessScore}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                          s.tier === 'TIER_1_ELITE'
                            ? 'bg-[#ffffff] text-[#000000] font-bold'
                            : 'bg-[#141414] border border-[#27272a] text-[#b5b5b5]'
                        }`}>
                          {s.tier === 'TIER_1_ELITE' ? 'Tier 1 Elite' : s.tier === 'TIER_2_READY' ? 'Tier 2 Ready' : 'Needs Practice'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Drives */}
      {activeTab === 'drives' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drives.map((d) => (
            <div key={d.id} className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-[#1a1a1a]">
                <div>
                  <h3 className="text-base font-bold text-[#ffffff]">{d.companyName}</h3>
                  <p className="text-xs text-[#888888]">{d.role}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-display text-[#ffffff]">₹{d.packageLpa} LPA</div>
                  <div className="text-[10px] font-mono text-[#666666]">{d.driveDate}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 text-center bg-[#000000] border border-[#1e1e1e] rounded font-mono text-xs">
                <div>
                  <span className="text-[9px] text-[#666666] block">Min Readiness</span>
                  <span className="font-bold text-[#ffffff]">{d.minReadinessCut}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#666666] block">Min DSA</span>
                  <span className="font-bold text-[#ffffff]">{d.minLeetCodeCut}+</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#666666] block">Min ATS</span>
                  <span className="font-bold text-[#ffffff]">{d.minAtsCut}%</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {d.eligibleBranches.map((b) => (
                  <span key={b} className="px-2 py-0.5 rounded bg-[#000000] border border-[#242424] text-[10px] font-mono text-[#888888]">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Departmental Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentStats.map((dep: any) => (
            <div key={dep.name} className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#ffffff]">{dep.name}</h3>
              <div className="space-y-1.5 font-mono text-xs text-[#888888]">
                <div className="flex justify-between">
                  <span>Enrolled:</span>
                  <span className="text-[#ffffff] font-bold">{dep.count}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Readiness:</span>
                  <span className="text-[#ffffff] font-bold">{dep.avgReadiness}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Solves:</span>
                  <span className="text-[#ffffff] font-bold">{dep.avgLeetCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Placement Rate:</span>
                  <span className="text-[#ffffff] font-bold">{dep.placedRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Drive Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
              <div>
                <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block">Drive Configuration</span>
                <h2 className="font-display font-bold text-base text-[#ffffff]">Schedule Campus Recruitment Drive</h2>
              </div>
              <button onClick={() => setShowDriveModal(false)} className="p-1 rounded text-[#666666] hover:text-[#ffffff]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Goldman Sachs"
                  value={driveForm.companyName}
                  onChange={(e) => setDriveForm({ ...driveForm, companyName: e.target.value })}
                  className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Role Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={driveForm.role}
                    onChange={(e) => setDriveForm({ ...driveForm, role: e.target.value })}
                    className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Package (LPA)</label>
                  <input
                    type="number"
                    placeholder="e.g. 24"
                    value={driveForm.packageLpa}
                    onChange={(e) => setDriveForm({ ...driveForm, packageLpa: e.target.value })}
                    className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#888888] uppercase tracking-wider block mb-1">Drive Date</label>
                <input
                  type="date"
                  value={driveForm.driveDate}
                  onChange={(e) => setDriveForm({ ...driveForm, driveDate: e.target.value })}
                  className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a1a1a]">
              <button onClick={() => setShowDriveModal(false)} className="btn-secondary py-1.5 px-4 text-xs">
                Cancel
              </button>
              <button
                onClick={() => createDriveMutation.mutate(driveForm)}
                disabled={createDriveMutation.isPending || !driveForm.companyName || !driveForm.role}
                className="btn-primary py-1.5 px-4 text-xs gap-1.5 disabled:opacity-50"
              >
                {createDriveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Publish Drive</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
