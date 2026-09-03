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
  Check,
  Award,
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
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

function ScoreGauge({
  value,
  max = 100,
  label,
}: {
  value: number;
  max?: number;
  label: string;
}) {
  return (
    <div className="bg-[#000000] border border-[#1e1e1e] rounded p-4 flex flex-col items-center text-center font-mono w-full">
      <div className="text-3xl font-bold font-display text-[#ffffff] mb-1">
        {value}
      </div>
      <span className="text-[10px] uppercase tracking-wider text-[#888888]">{label}</span>
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
  return {
    title: proj,
    desc: 'Build this project to bridge your skill gaps and showcase hands-on production code.'
  };
};

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'builder'>('analyzer');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: rawResumes = [], isLoading: isResumesLoading } = useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: async () => {
      const res = await api.get('/api/resume');
      const data = res.data?.data;
      return Array.isArray(data) ? data : [];
    },
  });

  const resumes = Array.isArray(rawResumes) ? rawResumes : [];
  const activeResumeId = selectedResumeId || (resumes.length > 0 ? resumes[0]?.id : null);
  const selectedResume = resumes.find((r) => r.id === activeResumeId);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await api.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data?.data;
    },
    onSuccess: (newResume) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setSelectedFile(null);
      if (newResume?.id) setSelectedResumeId(newResume.id);
      toast.success('Resume uploaded successfully');
    },
    onError: () => toast.error('Upload failed. Please upload a PDF or DOCX under 5MB.'),
  });

  const triggerAnalysis = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/api/resume/${id}/analyze`);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      toast.success('Analysis refreshed');
    },
    onError: () => toast.error('Failed to trigger analysis'),
  });

  const handleDownloadReport = async (resumeId: string, fileName: string) => {
    try {
      setDownloadingReport(true);
      const response = await api.get(`/api/resume/${resumeId}/report`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const reportName = fileName.replace(/\.[^/.]+$/, '') + '_FirstMile_Report.txt';
      link.setAttribute('download', reportName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Audit report downloaded');
    } catch (err) {
      toast.error('Failed to download report');
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) setSelectedFile(files[0]);
  }, []);

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl">
      {/* Header */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block mb-1">
            ATS Benchmarking Suite
          </span>
          <h1 className="font-display font-bold text-2xl text-[#ffffff] tracking-tight">
            Resume Intelligence & ATS Auditor
          </h1>
          <p className="text-xs text-[#888888] font-mono mt-0.5">
            Harvard format validation • Keyword gap extraction • Production bullet strength
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#000000] border border-[#1a1a1a] rounded-md font-mono text-xs">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeTab === 'analyzer' ? 'bg-[#ffffff] text-[#000000] font-bold' : 'text-[#888888] hover:text-[#ffffff]'
            }`}
          >
            ATS Analyzer
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1.5 rounded transition-all ${
              activeTab === 'builder' ? 'bg-[#ffffff] text-[#000000] font-bold' : 'text-[#888888] hover:text-[#ffffff]'
            }`}
          >
            Harvard Resume Builder
          </button>
        </div>
      </div>

      {activeTab === 'builder' ? (
        <AtsResumeBuilder />
      ) : (
        <div className="space-y-6">
          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`bg-[#080808] border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragOver ? 'border-[#ffffff] bg-[#111111]' : 'border-[#242424] hover:border-[#444444]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <FileText className="w-8 h-8 text-[#ffffff]" />
                <span className="text-xs font-mono text-[#ffffff] font-bold">{selectedFile.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => uploadMutation.mutate(selectedFile)}
                    disabled={uploadMutation.isPending}
                    className="btn-primary py-1.5 px-4 text-xs gap-1.5"
                  >
                    {uploadMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    <span>Run ATS Audit</span>
                  </button>
                  <button onClick={() => setSelectedFile(null)} className="btn-secondary py-1.5 px-3 text-xs">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded bg-[#111111] border border-[#242424] flex items-center justify-center text-[#ffffff]">
                  <Upload className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-[#ffffff]">Drop your resume PDF or click to browse</h3>
                <p className="text-[10px] font-mono text-[#666666]">Supports PDF, DOCX under 5MB</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary py-1.5 px-4 text-xs mt-2"
                >
                  Select File
                </button>
              </div>
            )}
          </div>

          {/* Past Scans Bar */}
          {resumes.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
              <span className="text-[10px] text-[#666666] uppercase pr-2">Scans:</span>
              {resumes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedResumeId(r.id)}
                  className={`px-3 py-1.5 rounded border transition-all text-left truncate max-w-xs ${
                    r.id === activeResumeId
                      ? 'bg-[#ffffff] text-[#000000] font-bold border-[#ffffff]'
                      : 'bg-[#080808] text-[#888888] border-[#242424] hover:text-[#ffffff]'
                  }`}
                >
                  {r.fileName} • {r.atsScore || 0}% ATS
                </button>
              ))}
            </div>
          )}

          {/* Selected Resume Audit Results */}
          {selectedResume && (
            <div className="space-y-6">
              {/* Score Gauges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ScoreGauge value={selectedResume.atsScore || 0} label="ATS Parse Score" />
                <ScoreGauge value={selectedResume.grammarScore ? Math.round(selectedResume.grammarScore * 10) : 0} label="Grammar & Formatting" />
                <ScoreGauge value={selectedResume.resumeRating ? Math.round(selectedResume.resumeRating * 10) : 0} label="Production Impact Rating" />
              </div>

              {/* Missing Keywords & Skills */}
              <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-3">
                <h3 className="text-xs font-bold font-mono text-[#888888] uppercase tracking-wider">Identified Skill & Keyword Gaps</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedResume.missingSkills && selectedResume.missingSkills.length > 0 ? (
                    selectedResume.missingSkills.map((s) => (
                      <span key={s} className="px-2.5 py-0.5 rounded bg-[#000000] border border-[#333333] text-[10px] font-mono text-[#ffffff]">
                        + {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-mono text-[#666666]">No critical missing keywords detected.</span>
                  )}
                </div>
              </div>

              {/* Weak Bullet Points */}
              <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-3">
                <h3 className="text-xs font-bold font-mono text-[#888888] uppercase tracking-wider">Bullets Requiring Quantification</h3>
                <ul className="space-y-2">
                  {selectedResume.weakBullets && selectedResume.weakBullets.length > 0 ? (
                    selectedResume.weakBullets.map((bullet, i) => (
                      <li key={i} className="p-3 bg-[#000000] border border-[#1e1e1e] rounded text-xs text-[#b5b5b5] font-mono leading-relaxed">
                        &ldquo;{bullet}&rdquo;
                      </li>
                    ))
                  ) : (
                    <li className="text-xs font-mono text-[#666666]">All bullet points contain strong action verbs and quantified impact.</li>
                  )}
                </ul>
              </div>

              {/* Suggestions */}
              <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-5 space-y-3">
                <h3 className="text-xs font-bold font-mono text-[#888888] uppercase tracking-wider">Actionable Directives</h3>
                <ul className="space-y-2">
                  {selectedResume.suggestions && selectedResume.suggestions.length > 0 ? (
                    selectedResume.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-[#b5b5b5] leading-relaxed">
                        <span className="font-mono font-bold text-[#ffffff]">{String(i + 1).padStart(2, '0')}.</span>
                        <span>{s}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs font-mono text-[#666666]">Resume is primed for Tier-1 application submissions.</li>
                  )}
                </ul>
              </div>

              {/* Download Report Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleDownloadReport(selectedResume.id, selectedResume.fileName)}
                  disabled={downloadingReport}
                  className="btn-primary py-2 px-5 text-xs gap-1.5"
                >
                  {downloadingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Export ATS Report</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
