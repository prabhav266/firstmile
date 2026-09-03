'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  Code2,
  Github,
  Briefcase,
  Save,
  Check,
  RefreshCw,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { sounds } from '@/lib/sounds';

export default function ProfilePage() {
  const queryClient = useQueryClient();

  // Fetch current user data
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => api.get('/api/auth/me'),
  });

  const user = React.useMemo(() => userProfile?.data?.data || {}, [userProfile?.data?.data]);
  const role = (user.role || 'STUDENT') as 'STUDENT' | 'RECRUITER' | 'TPO' | 'ADMIN';

  // Form State
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState<number | string>('3');
  const [targetCompany, setTargetCompany] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  
  // Recruiter fields
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [hiringDomain, setHiringDomain] = useState('');

  // TPO fields
  const [institutionName, setInstitutionName] = useState('');

  // Populate form with fetched profile
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCollege(user.college || '');
      setBranch(user.branch || '');
      setYear(user.year || '3');
      setTargetCompany(user.targetCompany || '');
      setLeetcodeUsername(user.leetcodeUsername || '');
      setGithubUsername(user.githubUsername || '');
      setCompany(user.company || '');
      setDesignation(user.designation || '');
      setHiringDomain(user.hiringDomain || '');
      setInstitutionName(user.institutionName || '');
    }
  }, [user]);

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put('/api/auth/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      sounds.playChime();
      toast.success('Profile updated successfully');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');

    updateMutation.mutate({
      name,
      college,
      branch,
      year: year ? Number(year) : undefined,
      targetCompany,
      leetcodeUsername,
      githubUsername,
      company,
      designation,
      hiringDomain,
      institutionName,
    });
  };

  const getInitials = (n: string) => {
    if (!n) return 'FM';
    return n
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const inputClass =
    'w-full bg-[#000000] border border-[#242424] rounded py-2 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff] transition-all font-mono placeholder:text-[#444444]';

  return (
    <div className="space-y-6 font-sans select-none max-w-5xl">
      {/* Header Banner */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-[#111111] border border-[#242424] flex items-center justify-center font-mono font-black text-xl text-[#ffffff]">
            {getInitials(user.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-2xl text-[#ffffff] tracking-tight">
                {user.name || 'User Profile'}
              </h1>
              <span className="px-2 py-0.5 rounded border border-[#27272a] bg-[#111111] text-[10px] font-mono font-bold uppercase tracking-wider text-[#ffffff]">
                {role}
              </span>
            </div>
            <p className="text-xs text-[#888888] font-mono mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="btn-primary py-2 px-5 gap-1.5 text-xs font-mono"
        >
          <Save size={13} />
          <span>{updateMutation.isPending ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Identity */}
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4 font-mono text-xs">
          <h2 className="font-bold text-[#ffffff] uppercase tracking-wider text-xs pb-2 border-b border-[#1a1a1a] flex items-center gap-2">
            <User size={13} />
            <span>01. Core Identity</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-[#888888] uppercase block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Prabhav Sharma"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-[#888888] uppercase block mb-1">Verified Email Address</label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full bg-[#050505] border border-[#1a1a1a] rounded py-2 px-3 text-xs text-[#666666] cursor-not-allowed font-mono"
              />
            </div>
          </div>
        </div>

        {/* Persona-Specific Section: STUDENT */}
        {role === 'STUDENT' && (
          <>
            {/* Academic Credentials */}
            <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4 font-mono text-xs">
              <h2 className="font-bold text-[#ffffff] uppercase tracking-wider text-xs pb-2 border-b border-[#1a1a1a] flex items-center gap-2">
                <GraduationCap size={13} />
                <span>02. Academic & Placement Trajectory</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#888888] uppercase block mb-1">University / College</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. National Institute of Technology"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#888888] uppercase block mb-1">Engineering Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select Branch</option>
                    <option value="Computer Science">Computer Science (CSE)</option>
                    <option value="Information Technology">Information Technology (IT)</option>
                    <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                    <option value="Artificial Intelligence">AI & Data Science (AI/DS)</option>
                    <option value="Electrical Engineering">Electrical Engineering (EE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#888888] uppercase block mb-1">Batch Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className={inputClass}
                  >
                    <option value="4">4th Year (Graduating 2026)</option>
                    <option value="3">3rd Year (Graduating 2027)</option>
                    <option value="2">2nd Year (Graduating 2028)</option>
                    <option value="1">1st Year (Graduating 2029)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#888888] uppercase block mb-1">Target Dream Company</label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder="e.g. Google, Microsoft, Atlassian, Uber"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Coding & Platform Handles */}
            <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4 font-mono text-xs">
              <h2 className="font-bold text-[#ffffff] uppercase tracking-wider text-xs pb-2 border-b border-[#1a1a1a] flex items-center gap-2">
                <Code2 size={13} />
                <span>03. Verified Platform Proof-of-Work</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-[#888888] uppercase block mb-1">LeetCode Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={leetcodeUsername}
                      onChange={(e) => setLeetcodeUsername(e.target.value)}
                      placeholder="e.g. tour_de_code"
                      className={inputClass}
                    />
                  </div>
                  <span className="text-[10px] text-[#666666] mt-1 block">
                    Syncs solved problem counters and contest ratings to recruiter dossiers.
                  </span>
                </div>

                <div>
                  <label className="text-[10px] text-[#888888] uppercase block mb-1">GitHub Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="e.g. torvalds"
                      className={inputClass}
                    />
                  </div>
                  <span className="text-[10px] text-[#666666] mt-1 block">
                    Validates repository commits and portfolio source repositories.
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Persona-Specific Section: RECRUITER */}
        {role === 'RECRUITER' && (
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4 font-mono text-xs">
            <h2 className="font-bold text-[#ffffff] uppercase tracking-wider text-xs pb-2 border-b border-[#1a1a1a] flex items-center gap-2">
              <Briefcase size={13} />
              <span>02. Talent Discovery Organization</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-[#888888] uppercase block mb-1">Hiring Organization / Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google India, Stripe, Razorpay"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[10px] text-[#888888] uppercase block mb-1">Professional Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Technical Recruiter, VP Engineering"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] text-[#888888] uppercase block mb-1">Target Hiring Domains</label>
                <input
                  type="text"
                  value={hiringDomain}
                  onChange={(e) => setHiringDomain(e.target.value)}
                  placeholder="e.g. Backend Engineering, Distributed Systems, ML Infrastructure"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* Persona-Specific Section: TPO */}
        {role === 'TPO' && (
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-4 font-mono text-xs">
            <h2 className="font-bold text-[#ffffff] uppercase tracking-wider text-xs pb-2 border-b border-[#1a1a1a] flex items-center gap-2">
              <Building2 size={13} />
              <span>02. University Placement Cell Details</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] text-[#888888] uppercase block mb-1">Institution / University Full Name</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. National Institute of Technology, Trichy"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary py-2.5 px-6 gap-2 text-xs font-mono"
          >
            <Save size={14} />
            <span>{updateMutation.isPending ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
