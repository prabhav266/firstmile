'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload,
  X,
  FileText,
  Loader2,
  AlertTriangle,
  Download,
  Lightbulb,
  FolderGit2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { AtsResumeBuilder } from '@/components/resume/AtsResumeBuilder';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  filePath?: string | null;
  atsScore?: number | null;
  grammarScore?: number | null;
  resumeRating?: number | null;
  missingSkills: string[];
  weakBullets: string[];
  projectSuggestions: string[];
  suggestions: string[];
  analysisStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

function ScoreRing({
  value,
  max = 100,
  label,
  color = '#3b82f6',
  size = 120,
}: {
  value: number;
  max?: number;
  label: string;
  color?: string;
  size?: number;
}) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / max) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth={8}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold font-sans text-[#f9fafb]">{value}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-[#cbd5e1] text-center font-sans">{label}</span>
    </div>
  );
}

const parseProject = (proj: string) => {
  const colonIndex = proj.indexOf(':');
  if (colonIndex !== -1) {
    return {
      title: proj.substring(0, colonIndex).trim(),
      desc: proj.substring(colonIndex + 1).trim()
    };
  }
  const hyphenIndex = proj.indexOf(' - ');
  if (hyphenIndex !== -1) {
    return {
      title: proj.substring(0, hyphenIndex).trim(),
      desc: proj.substring(hyphenIndex + 3).trim()
    };
  }
  return {
    title: proj,
    desc: 'Build this project to bridge your skill gaps and showcase hands-on experience.'
  };
};

export default function ResumeAnalyzerPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'analyzer' | 'builder'>('analyzer');
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [showUploadForce, setShowUploadForce] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);

  // 1. Fetch resumes
  const { data: resumesQuery, isLoading: isResumesLoading } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => api.get('/api/resume'),
  });

  const resumes: Resume[] = resumesQuery?.data?.data || [];

  // Find the selected resume or default to the latest one
  const selectedResume = resumes.find((r: Resume) => r.id === selectedResumeId) || resumes[0];

  // 3. Trigger analysis mutation
  const triggerAnalysis = useMutation({
    mutationFn: (id: string) => api.post(`/api/resume/${id}/analyze`, { jobRole: 'Software Engineer' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume analyzed successfully!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to analyze resume');
    }
  });

  // 2. Upload resume mutation
  const uploadResume = useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      const newId = res.data?.data?.id;
      if (newId) {
        setSelectedResumeId(newId);
      }
      setShowUploadForce(false);
      setFile(null);
      triggerAnalysis.mutate(res.data.data.id);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    }
  });

  // 4. Delete resume mutation
  const deleteResume = useMutation({
    mutationFn: (id: string) => api.delete(`/api/resume/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Resume deleted!');
      setSelectedResumeId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete resume');
    }
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') {
      setFile(dropped);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) {
      setFile(picked);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    uploadResume.mutate(formData);
  };

  const handleDownloadReport = async (resumeId: string, fileName: string) => {
    try {
      setDownloadingReport(true);
      const response = await api.get(`/api/resume/${resumeId}/report`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const reportName = fileName.replace(/\.[^/.]+$/, "") + "_PathForge_Report.txt";
      link.setAttribute('download', reportName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Report downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download report');
    } finally {
      setDownloadingReport(false);
    }
  };

  if (isResumesLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#0F172A]">
        <Loader2 className="w-10 h-10 animate-spin text-[#3b82f6]" />
        <span className="text-sm font-medium text-[#cbd5e1] font-sans">Loading resumes...</span>
      </div>
    );
  }

  const isShowingUpload = resumes.length === 0 || showUploadForce;

  return (
    <motion.div
      className="min-h-screen px-6 py-8 space-y-8 bg-[#0F172A]"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-sans text-[#f9fafb]">Resume Intelligence Hub</h1>
          <p className="mt-1 text-[#cbd5e1] text-sm font-sans">
            Audit your existing resume with AI or build a 100% ATS-compliant single-page PDF in 1 click.
          </p>
        </div>

        {/* Tab Mode Switcher */}
        <div className="flex items-center gap-2 p-1 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-2xl">
          <button
            onClick={() => setViewMode('analyzer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              viewMode === 'analyzer'
                ? 'bg-[#3b82f6] text-white shadow-[0_0_16px_rgba(59,130,246,0.4)]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Resume Audit</span>
          </button>
          <button
            onClick={() => setViewMode('builder')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              viewMode === 'builder'
                ? 'bg-[#8b5cf6] text-white shadow-[0_0_16px_rgba(139,92,246,0.4)]'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1-Click ATS Builder</span>
            <span className="px-1.5 py-0.2 bg-[#10b981] text-black text-[9px] font-extrabold rounded-full">NEW</span>
          </button>
        </div>
      </motion.div>

      {/* Conditionally Render Builder vs Analyzer */}
      {viewMode === 'builder' ? (
        <AtsResumeBuilder />
      ) : (
        <div className="space-y-8">

      {resumes.length > 0 && (
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap gap-2.5 items-center bg-[#111827] p-3 rounded-xl border border-[rgba(255,255,255,0.08)]"
        >
          <span className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider ml-1 mr-2 font-sans">History:</span>
          {resumes.map((r: Resume) => {
            const isActive = selectedResume?.id === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedResumeId(r.id);
                  setShowUploadForce(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 font-sans ${
                  isActive
                    ? 'border-[#3b82f6] bg-[#3b82f6]/10 text-[#f9fafb]'
                    : 'border-[rgba(255,255,255,0.08)] bg-[#1f2937] text-[#cbd5e1] hover:border-[#3b82f6]/40'
                }`}
              >
                <FileText className={`w-3.5 h-3.5 ${isActive ? 'text-[#3b82f6]' : 'text-[#94a3b8]'}`} />
                <span className="max-w-[120px] truncate">{r.fileName}</span>
                {r.analysisStatus === 'COMPLETED' && (
                  <span className="text-[10px] bg-[#22c55e]/15 text-[#22c55e] px-1.5 py-0.5 rounded-md font-semibold">
                    {r.atsScore}%
                  </span>
                )}
                {r.analysisStatus === 'PROCESSING' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
                )}
                {r.analysisStatus === 'FAILED' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                )}
              </button>
            );
          })}
          <button
            onClick={() => setShowUploadForce(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border border-dashed border-[#3b82f6]/40 bg-transparent text-[#3b82f6] hover:bg-[#3b82f6]/10 transition-all flex items-center gap-1.5 ml-auto font-sans"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload New
          </button>
        </motion.div>
      )}

      {isShowingUpload ? (
        <motion.div variants={fadeInUp} className="space-y-6">
          {resumes.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#f9fafb] font-sans">Upload New Resume</span>
              <button
                onClick={() => setShowUploadForce(false)}
                className="text-xs text-[#3b82f6] hover:text-[#3b82f6]/80 flex items-center gap-1 font-sans font-medium transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          )}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`relative rounded-2xl border border-dashed transition-all duration-300 cursor-pointer ${
              isDragging
                ? 'border-[#3b82f6] bg-[#3b82f6]/5'
                : 'border-[rgba(255,255,255,0.08)] bg-[#111827] hover:border-[#3b82f6]/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <motion.div
                animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-300 ${
                  isDragging ? 'bg-[#3b82f6]/20' : 'bg-[#1f2937]'
                }`}
              >
                <Upload
                  className={`w-7 h-7 transition-colors duration-300 ${
                    isDragging ? 'text-[#3b82f6]' : 'text-[#cbd5e1]'
                  }`}
                />
              </motion.div>

              <p className="text-[#f9fafb] font-semibold text-base mb-1 font-sans">
                Drag &amp; drop your resume PDF or{' '}
                <span className="text-[#3b82f6] underline underline-offset-2 hover:text-[#2563eb]">click to browse</span>
              </p>
              <p className="text-[#cbd5e1] text-xs font-sans">PDF only &middot; Max file size 10 MB</p>
            </div>
          </div>

          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="mt-4 inline-flex items-center gap-2.5 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2.5"
              >
                <FileText className="w-4 h-4 text-[#3b82f6]" />
                <span className="text-sm text-[#f9fafb] font-medium max-w-xs truncate font-sans">{file.name}</span>
                <span className="text-xs text-[#cbd5e1] font-sans">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
                <button
                  onClick={removeFile}
                  disabled={uploadResume.isPending}
                  className="ml-1 w-5 h-5 rounded-full bg-[rgba(255,255,255,0.06)] flex items-center justify-center hover:bg-[#ef4444]/20 hover:text-[#ef4444] text-[#94a3b8] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4">
            <button
              onClick={handleAnalyze}
              disabled={!file || uploadResume.isPending}
              className={`text-[#f9fafb] bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] rounded-xl py-3 px-8 font-semibold flex items-center gap-2.5 transition-all font-sans ${
                !file || uploadResume.isPending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploadResume.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading &amp; Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Resume details card */}
          <motion.div variants={fadeInUp} className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-[#f9fafb] flex items-center gap-2 font-sans">
                  <FileText className="w-5 h-5 text-[#3b82f6]" />
                  {selectedResume.fileName}
                </h2>
                <p className="text-xs text-[#cbd5e1] mt-1 font-sans">
                  Uploaded on {new Date(selectedResume.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {selectedResume.analysisStatus === 'FAILED' && (
                  <button
                    onClick={() => triggerAnalysis.mutate(selectedResume.id)}
                    disabled={triggerAnalysis.isPending}
                    className="flex items-center gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] disabled:opacity-50 text-white rounded-xl px-4 py-2 text-xs font-semibold transition-all font-sans"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${triggerAnalysis.isPending ? 'animate-spin' : ''}`} />
                    Retry Analysis
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this resume?')) {
                      deleteResume.mutate(selectedResume.id);
                    }
                  }}
                  disabled={deleteResume.isPending}
                  className="flex items-center gap-1.5 border border-[#ef4444]/30 hover:border-[#ef4444] bg-[#ef4444]/5 hover:bg-[#ef4444]/15 disabled:opacity-50 text-[#ef4444] rounded-xl px-4 py-2 text-xs font-semibold transition-all font-sans"
                >
                  <X className="w-3.5 h-3.5" />
                  Delete Resume
                </button>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {selectedResume.analysisStatus === 'PENDING' || selectedResume.analysisStatus === 'PROCESSING' ? (
              <motion.div
                key="analyzing-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center"
              >
                <Loader2 className="w-12 h-12 animate-spin text-[#3b82f6]" />
                <h3 className="text-lg font-bold text-[#f9fafb] font-sans">Analyzing Resume with AI...</h3>
                <p className="text-sm text-[#cbd5e1] max-w-md font-sans">
                  We are scanning your resume against Software Engineer standards, checking ATS relevance, grammar, structure, and formulating improvement suggestions.
                </p>
              </motion.div>
            ) : selectedResume.analysisStatus === 'FAILED' ? (
              <motion.div
                key="failed-state"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#1f2937] border border-[#ef4444]/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center"
              >
                <AlertTriangle className="w-12 h-12 text-[#ef4444]" />
                <h3 className="text-lg font-bold text-[#f9fafb] font-sans">Analysis Failed</h3>
                <p className="text-sm text-[#cbd5e1] max-w-md font-sans">
                  We encountered an error while trying to run the AI analysis model on your resume. Please click below to retry the analysis.
                </p>
                <button
                  onClick={() => triggerAnalysis.mutate(selectedResume.id)}
                  disabled={triggerAnalysis.isPending}
                  className="mt-2 flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] disabled:opacity-50 text-white rounded-xl px-5 py-2.5 font-semibold text-sm transition-all font-sans"
                >
                  <RefreshCw className={`w-4 h-4 ${triggerAnalysis.isPending ? 'animate-spin' : ''}`} />
                  Retry Analysis
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="completed-results"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="space-y-6"
              >
                <motion.div variants={fadeInUp} className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
                  <h2 className="text-lg font-bold text-[#f9fafb] mb-6 font-sans">Analysis Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 place-items-center">
                    <ScoreRing
                      value={selectedResume.atsScore || 0}
                      max={100}
                      label="ATS Score"
                      color="#3b82f6"
                      size={130}
                    />
                    <ScoreRing
                      value={Math.round((selectedResume.grammarScore || 0) * 10)}
                      max={100}
                      label={`Grammar Score \u00b7 ${selectedResume.grammarScore || 0}/10`}
                      color="#8b5cf6"
                      size={130}
                    />
                    <ScoreRing
                      value={Math.round((selectedResume.resumeRating || 0) * 10)}
                      max={100}
                      label={`Resume Rating \u00b7 ${selectedResume.resumeRating || 0}/10`}
                      color="#22c55e"
                      size={130}
                    />
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
                      <X className="w-4 h-4 text-[#ef4444]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#f9fafb] font-sans">Missing Skills</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.missingSkills && selectedResume.missingSkills.length > 0 ? (
                      selectedResume.missingSkills.map((skill: string) => (
                        <span
                          key={skill}
                          className="border border-[#ef4444]/20 bg-[#ef4444]/10 text-[#ef4444] rounded-lg px-2.5 py-0.5 text-xs font-semibold font-sans"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[#cbd5e1] font-sans">No missing skills identified! Great job matching the job role requirements.</span>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#f9fafb] font-sans">Weak Bullet Points</h2>
                  </div>
                  <ul className="divide-y divide-[rgba(255,255,255,0.06)]">
                    {selectedResume.weakBullets && selectedResume.weakBullets.length > 0 ? (
                      selectedResume.weakBullets.map((bullet: string, i: number) => (
                        <li key={i} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0 font-sans">
                          <AlertTriangle className="w-4 h-4 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-[#cbd5e1] leading-relaxed">&ldquo;{bullet}&rdquo;</span>
                        </li>
                      ))
                    ) : (
                      <li className="py-3 text-sm text-[#cbd5e1] first:pt-0 font-sans">No weak bullet points found. Your phrasing is strong and actionable!</li>
                    )}
                  </ul>
                </motion.div>

                <motion.div variants={fadeInUp} className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-[#22c55e]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#f9fafb] font-sans">Improvement Suggestions</h2>
                  </div>
                  <ul className="divide-y divide-[rgba(255,255,255,0.06)]">
                    {selectedResume.suggestions && selectedResume.suggestions.length > 0 ? (
                      selectedResume.suggestions.map((s: string, i: number) => (
                        <li key={i} className="py-3 flex items-start gap-3 first:pt-0 last:pb-0 font-sans">
                          <span className="text-xs font-semibold text-[#8b5cf6] mt-0.5 w-5 flex-shrink-0">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-sm text-[#cbd5e1] leading-relaxed">{s}</span>
                        </li>
                      ))
                    ) : (
                      <li className="py-3 text-sm text-[#cbd5e1] first:pt-0 font-sans">No improvements suggested. Your resume is extremely polished!</li>
                    )}
                  </ul>
                </motion.div>

                <motion.div variants={fadeInUp} className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center">
                      <FolderGit2 className="w-4 h-4 text-[#8b5cf6]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#f9fafb] font-sans">AI Project Recommendations</h2>
                  </div>
                  <div className="space-y-4">
                    {selectedResume.projectSuggestions && selectedResume.projectSuggestions.length > 0 ? (
                      selectedResume.projectSuggestions.map((projStr: string, idx: number) => {
                        const proj = parseProject(projStr);
                        return (
                          <div
                            key={idx}
                            className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 hover:border-[#3b82f6]/40 transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-2 font-sans">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                              <h3 className="text-sm font-semibold text-[#f9fafb]">{proj.title}</h3>
                            </div>
                            <p className="text-xs text-[#cbd5e1] leading-relaxed font-sans">{proj.desc}</p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-[#cbd5e1] font-sans">No project recommendations needed. Your projects are sufficient for this role!</div>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <button
                    onClick={() => handleDownloadReport(selectedResume.id, selectedResume.fileName)}
                    disabled={downloadingReport}
                    className="flex items-center gap-2.5 border border-[rgba(255,255,255,0.08)] bg-[#111827] hover:bg-[#1f2937] text-[#f9fafb] rounded-xl py-3 px-6 font-semibold text-sm transition-all disabled:opacity-50 font-sans"
                  >
                    {downloadingReport ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#cbd5e1]" />
                    ) : (
                      <Download className="w-4 h-4 text-[#cbd5e1]" />
                    )}
                    {downloadingReport ? 'Downloading...' : 'Download Report'}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
        </div>
      )}
    </motion.div>
  );
}
