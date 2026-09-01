'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Sparkles,
  Github,
  Pencil,
  X,
  Tag,
  Globe,
  Zap,
  Clock,
  ChevronRight,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

type Status = 'IDEA' | 'IN_PROGRESS' | 'COMPLETED';

interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  status: Status;
  resumeImpact: number;
  githubUrl: string;
  liveUrl: string;
}

interface AiRec {
  title: string;
  description: string;
  difficulty: string;
  tech_stack: string[];
  estimated_days: number;
  resume_impact: number;
  architecture?: string;
  learning_outcome?: string;
}

const STATUS_META: Record<Status, { label: string; color: string; dot: string }> = {
  IDEA: {
    label: 'Idea',
    color: 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20',
    dot: 'bg-[#f59e0b]',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20',
    dot: 'bg-[#3b82f6]',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20',
    dot: 'bg-[#22c55e]',
  },
};

const DIFF_META: Record<string, string> = {
  Beginner: 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20',
  Intermediate: 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20',
  Advanced: 'bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20',
  beginner: 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20',
  intermediate: 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20',
  advanced: 'bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20',
};

const impactColor = (v: number) =>
  v >= 85 ? '#22c55e' : v >= 65 ? '#3b82f6' : '#f59e0b';

function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function ImpactBar({ value }: { value: number }) {
  const color = impactColor(value);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-[#cbd5e1] font-semibold uppercase tracking-wider">Resume Impact</span>
        <span className="text-xs font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-1 w-full rounded-full bg-[#111827] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 flex flex-col gap-4 relative"
    >
      <div className="absolute top-4 right-4">
        <StatusBadge status={project.status} />
      </div>
      <div className="pr-28">
        <h3 className="font-semibold text-lg text-[#f9fafb] leading-tight">{project.title}</h3>
        <p className="text-xs text-[#cbd5e1] mt-1 leading-relaxed">{project.description}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(project.techStack || []).map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-medium text-[#cbd5e1] bg-[#111827] border border-[rgba(255,255,255,0.08)]">
            {t}
          </span>
        ))}
      </div>
      <ImpactBar value={project.resumeImpact} />
      <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <a
            href={project.githubUrl || undefined}
            target="_blank"
            rel="noreferrer"
            className={`transition-colors ${project.githubUrl ? 'text-[#cbd5e1] hover:text-[#f9fafb]' : 'text-[#94a3b8] cursor-not-allowed pointer-events-none'}`}
            title="GitHub"
          >
            <Github size={15} />
          </a>
          <a
            href={project.liveUrl || undefined}
            target="_blank"
            rel="noreferrer"
            className={`transition-colors ${project.liveUrl ? 'text-[#cbd5e1] hover:text-[#f9fafb]' : 'text-[#94a3b8] cursor-not-allowed pointer-events-none'}`}
            title="Live Demo"
          >
            <Globe size={15} />
          </a>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(project)}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-[#cbd5e1] hover:text-[#f9fafb] bg-[#111827] hover:bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-lg px-2.5 py-1.5 transition-all"
          >
            <Pencil size={11} />
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this project?')) {
                onDelete(project.id);
              }
            }}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-[#ef4444] hover:text-[#f87171] bg-[#111827] hover:bg-rose-950/20 border border-[rgba(255,255,255,0.08)] hover:border-[#ef4444]/20 rounded-lg px-2.5 py-1.5 transition-all"
          >
            <Trash2 size={11} />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AiRecCard({ rec, onAdd, added }: { rec: AiRec; onAdd: () => void; added: boolean }) {
  const color = impactColor(rec.resume_impact || 0);
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="font-semibold text-[#f9fafb] text-sm leading-snug">{rec.title}</h4>
          <p className="text-xs text-[#cbd5e1] mt-1 leading-relaxed">{rec.description}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${DIFF_META[rec.difficulty] || DIFF_META['Intermediate']}`}>
          {rec.difficulty}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(rec.tech_stack || []).map((t) => (
          <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-medium text-[#cbd5e1] bg-[#111827] border border-[rgba(255,255,255,0.08)]">
            {t}
          </span>
        ))}
      </div>
      {rec.architecture && (
        <div className="text-[11px] text-[#cbd5e1] bg-[#111827] p-2.5 rounded-xl border border-[rgba(255,255,255,0.08)]">
          <span className="text-[#8b5cf6] font-semibold block mb-0.5">Architecture:</span>
          {rec.architecture}
        </div>
      )}
      {rec.learning_outcome && (
        <div className="text-[11px] text-[#94a3b8]">
          <span className="font-semibold text-[#cbd5e1]">Learning Outcome:</span> {rec.learning_outcome}
        </div>
      )}
      <div className="flex items-center gap-4 text-xs text-[#94a3b8]">
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {rec.estimated_days} days
        </span>
        <span className="flex items-center gap-1">
          <Zap size={11} style={{ color }} />
          <span style={{ color }}>{rec.resume_impact}% impact</span>
        </span>
      </div>
      <button
        onClick={onAdd}
        disabled={added}
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
          added
            ? 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20 cursor-default'
            : 'bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white'
        }`}
      >
        {added ? (
          <>
            <CheckCircle2 size={13} />
            Added to Projects
          </>
        ) : (
          <>
            <Plus size={13} />
            Add to My Projects
          </>
        )}
      </button>
    </motion.div>
  );
}

const BLANK_FORM = {
  title: '',
  description: '',
  techStack: [] as string[],
  githubUrl: '',
  liveUrl: '',
  status: 'IDEA' as Status,
  resumeImpact: 50,
  stackInput: '',
};

function ProjectModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<Project, 'id'>) => void;
  initial?: Project;
}) {
  const [form, setForm] = useState(() => ({ ...BLANK_FORM }));

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              title: initial.title || '',
              description: initial.description || '',
              techStack: initial.techStack || [],
              githubUrl: initial.githubUrl || '',
              liveUrl: initial.liveUrl || '',
              status: initial.status || 'IDEA',
              resumeImpact: initial.resumeImpact || 50,
              stackInput: '',
            }
          : {
              title: '',
              description: '',
              techStack: [] as string[],
              githubUrl: '',
              liveUrl: '',
              status: 'IDEA' as Status,
              resumeImpact: 50,
              stackInput: '',
            }
      );
    }
  }, [initial, open]);

  const field =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = key === 'resumeImpact' ? parseInt(e.target.value, 10) || 0 : e.target.value;
      setForm((f) => ({ ...f, [key]: val }));
    };

  const addTag = () => {
    const input = form.stackInput.trim();
    if (input) {
      const tags = input.split(',').map(t => t.trim()).filter(t => t && !form.techStack.includes(t));
      if (tags.length > 0) {
        setForm((f) => ({ ...f, techStack: [...f.techStack, ...tags], stackInput: '' }));
      } else {
        setForm((f) => ({ ...f, stackInput: '' }));
      }
    }
  };

  const removeTag = (t: string) => setForm((f) => ({ ...f, techStack: f.techStack.filter((x) => x !== t) }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({
      title: form.title,
      description: form.description,
      techStack: form.techStack,
      githubUrl: form.githubUrl,
      liveUrl: form.liveUrl,
      status: form.status,
      resumeImpact: form.resumeImpact,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#f9fafb]">{initial ? 'Edit Project' : 'Add New Project'}</h2>
                <button onClick={onClose} className="text-[#cbd5e1] hover:text-[#f9fafb] transition-colors p-1 rounded-lg hover:bg-[#111827]">
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider">Project Title *</label>
                  <input
                    value={form.title}
                    onChange={field('title')}
                    placeholder="e.g. E-commerce Platform"
                    className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-4 text-sm text-[#f9fafb] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-all placeholder:text-[#94a3b8]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider">Description</label>
                  <textarea
                    value={form.description}
                    onChange={field('description')}
                    rows={3}
                    placeholder="Brief project description..."
                    className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-4 text-sm text-[#f9fafb] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-all resize-none placeholder:text-[#94a3b8]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider">Tech Stack (comma separated)</label>
                  <div className="flex gap-2">
                    <input
                      value={form.stackInput}
                      onChange={(e) => setForm((f) => ({ ...f, stackInput: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Type tags (e.g. React, Node.js) and press Enter"
                      className="flex-1 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-4 text-sm text-[#f9fafb] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-all placeholder:text-[#94a3b8]"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="bg-[#111827] border border-[rgba(255,255,255,0.08)] hover:bg-[#1f2937] rounded-[10px] px-3 text-[#cbd5e1] hover:text-[#f9fafb] transition-all"
                    >
                      <Tag size={14} />
                    </button>
                  </div>
                  {form.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {form.techStack.map((t) => (
                        <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-[8px] text-[11px] font-medium text-[#cbd5e1] bg-[#111827] border border-[rgba(255,255,255,0.08)]">
                          {t}
                          <button onClick={() => removeTag(t)} className="text-[#94a3b8] hover:text-[#ef4444] transition-colors ml-0.5">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider">GitHub URL</label>
                    <input
                      value={form.githubUrl}
                      onChange={field('githubUrl')}
                      placeholder="https://github.com/..."
                      className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-4 text-sm text-[#f9fafb] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-all placeholder:text-[#94a3b8]"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider">Live URL</label>
                    <input
                      value={form.liveUrl}
                      onChange={field('liveUrl')}
                      placeholder="https://..."
                      className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-4 text-sm text-[#f9fafb] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-all placeholder:text-[#94a3b8]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider">Status</label>
                    <select
                      value={form.status}
                      onChange={field('status')}
                      className="bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2.5 px-4 text-sm text-[#f9fafb] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-all"
                    >
                      <option value="IDEA">Idea</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider">Resume Impact</label>
                      <span className="text-xs font-bold text-[#3b82f6]">{form.resumeImpact}%</span>
                    </div>
                    <div className="flex items-center bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 h-[42px]">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={form.resumeImpact}
                        onChange={field('resumeImpact')}
                        className="w-full accent-[#3b82f6] h-1 bg-[#0f172a] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="flex-1 border border-[rgba(255,255,255,0.08)] bg-[#111827] hover:bg-[#1f2937] active:bg-[#111827] text-[#cbd5e1] hover:text-[#f9fafb] rounded-[12px] py-2.5 text-sm font-semibold transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white rounded-[12px] py-2.5 text-sm font-semibold transition-all">
                  {initial ? 'Save Changes' : 'Add Project'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AiDrawer({
  open,
  onClose,
  onAddProject,
  addedIds,
  recommendations,
  isPending,
  onRecommend,
}: {
  open: boolean;
  onClose: () => void;
  onAddProject: (rec: AiRec) => void;
  addedIds: Set<string>;
  recommendations: AiRec[];
  isPending: boolean;
  onRecommend: (goal: string) => void;
}) {
  const [goalInput, setGoalInput] = useState('Full Stack Developer');

  // Trigger search on open if empty
  useEffect(() => {
    if (open && recommendations.length === 0 && !isPending) {
      onRecommend(goalInput);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 h-full z-50 w-full max-w-sm bg-[#1f2937] border-l border-[rgba(255,255,255,0.08)] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.08)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center">
                  <Sparkles size={15} className="text-[#8b5cf6]" />
                </div>
                <div>
                  <h2 className="font-bold text-[#f9fafb] text-sm">AI Recommendations</h2>
                  <p className="text-[10px] text-[#94a3b8]">Tailored to your profile</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#94a3b8] hover:text-[#f9fafb] p-1.5 rounded-lg hover:bg-[#111827] transition-all"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.08)] flex flex-col gap-1.5 shrink-0">
              <label className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Career Goal</label>
              <div className="flex gap-2">
                <input
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                  className="flex-1 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-2 px-3.5 text-xs text-[#f9fafb] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-all placeholder:text-[#94a3b8]"
                />
                <button
                  onClick={() => onRecommend(goalInput)}
                  disabled={isPending}
                  className="bg-[#8b5cf6] hover:bg-[#7c3aed] active:bg-[#6d28d9] disabled:opacity-50 text-white rounded-[12px] px-4 py-2 text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles size={12} />
                  {isPending ? 'Asking...' : 'Ask AI'}
                </button>
              </div>
            </div>
            <div className="mx-5 mt-4 px-4 py-3 rounded-xl bg-[#8b5cf6]/5 border border-[#8b5cf6]/10 text-xs text-[#cbd5e1] leading-relaxed shrink-0">
              <span className="text-[#8b5cf6] font-semibold">AI analysis:</span> Based on your skill gaps and target companies, these projects will maximize your resume impact.
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {isPending ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#94a3b8]">
                  <div className="w-8 h-8 rounded-full border-2 border-t-[#3b82f6] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  <span className="text-xs">Analyzing skills and generating ideas...</span>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#94a3b8] text-xs">
                  No recommendations found.
                </div>
              ) : (
                recommendations.map((rec, idx) => (
                  <AiRecCard
                    key={idx}
                    rec={rec}
                    onAdd={() => onAddProject(rec)}
                    added={addedIds.has(rec.title)}
                  />
                ))
              )}
            </div>
            <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.08)] shrink-0">
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 border border-[rgba(255,255,255,0.08)] bg-[#111827] hover:bg-[#1f2937] text-[#cbd5e1] hover:text-[#f9fafb] rounded-[12px] py-2.5 text-xs font-semibold transition-all"
              >
                Close
                <ChevronRight size={13} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function ProjectsPage() {
  const queryClient = useQueryClient();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AiRec[]>([]);

  // 1. Fetch projects
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/api/projects'),
  });

  const projects: Project[] = projectsQuery.data?.data?.data || [];

  // 2. Create project mutation
  const createMutation = useMutation({
    mutationFn: (data: Omit<Project, 'id'>) => api.post('/api/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project added successfully!');
      setShowAddModal(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add project');
    }
  });

  // 3. Edit project mutation
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<Project, 'id'> }) =>
      api.put(`/api/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated!');
      setShowEditModal(false);
      setEditTarget(undefined);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update project');
    }
  });

  // 4. Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  });

  // 5. Fetch recommendations mutation
  const recommendMutation = useMutation({
    mutationFn: (careerGoal: string) => api.post('/api/projects/recommend', { careerGoal }),
    onSuccess: (res) => {
      setAiRecommendations(res.data?.data?.projects || []);
      toast.success('AI recommendations updated!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to fetch recommendations');
    }
  });

  const openAdd = () => {
    setShowAddModal(true);
  };

  const openEdit = (p: Project) => {
    setEditTarget(p);
    setShowEditModal(true);
  };

  const handleAddRec = (rec: AiRec) => {
    createMutation.mutate({
      title: rec.title,
      description: rec.description,
      techStack: rec.tech_stack || [],
      status: 'IDEA',
      resumeImpact: rec.resume_impact || 50,
      githubUrl: '',
      liveUrl: '',
    });
  };

  const addedRecTitles = new Set(projects.map((p) => p.title));

  if (projectsQuery.isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-[#f9fafb] flex flex-col items-center justify-center gap-3 font-sans">
        <div className="w-10 h-10 rounded-full border-4 border-t-[#3b82f6] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        <span className="text-sm text-[#cbd5e1]">Loading projects...</span>
      </div>
    );
  }

  if (projectsQuery.isError) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-[#f9fafb] flex flex-col items-center justify-center gap-3 font-sans">
        <span className="text-sm text-[#ef4444]">Failed to load projects. Please try again.</span>
        <button
          onClick={() => projectsQuery.refetch()}
          className="bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white rounded-[12px] py-2 px-5 font-semibold text-sm transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f9fafb] p-6 lg:p-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#f9fafb] tracking-tight">My Projects</h1>
          <p className="text-sm text-[#cbd5e1] mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''} · Building your portfolio
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 border border-[rgba(255,255,255,0.08)] bg-[#111827] hover:bg-[#1f2937] text-[#cbd5e1] hover:text-[#f9fafb] rounded-[12px] px-4 py-2.5 text-sm font-semibold transition-all"
          >
            <Sparkles size={15} className="text-[#8b5cf6]" />
            AI Recommend Projects
          </button>
          <button onClick={openAdd} className="bg-[#3b82f6] hover:bg-[#2563eb] active:bg-[#1d4ed8] text-white rounded-[12px] py-2.5 px-5 font-semibold text-sm flex items-center gap-2 transition-all">
            <Plus size={16} />
            Add Project
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-8"
      >
        {[
          { label: 'In Progress', value: projects.filter((p) => p.status === 'IN_PROGRESS').length, color: 'text-[#3b82f6]' },
          { label: 'Completed', value: projects.filter((p) => p.status === 'COMPLETED').length, color: 'text-[#22c55e]' },
          { label: 'Ideas', value: projects.filter((p) => p.status === 'IDEA').length, color: 'text-[#f59e0b]' },
        ].map((s) => (
          <div key={s.label} className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-[#cbd5e1] font-medium">{s.label}</span>
            <span className={`text-xl font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={openEdit}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </AnimatePresence>
        <motion.button
          onClick={openAdd}
          whileHover={{ y: -2 }}
          className="min-h-[200px] rounded-2xl border border-dashed border-[rgba(255,255,255,0.08)] hover:border-[#3b82f6]/50 flex flex-col items-center justify-center gap-3 text-[#94a3b8] hover:text-[#cbd5e1] bg-[#1f2937]/50 hover:bg-[#1f2937] transition-all group"
        >
          <div className="w-10 h-10 rounded-[12px] bg-[#111827] group-hover:bg-[#3b82f6]/10 border border-[rgba(255,255,255,0.08)] group-hover:border-[#3b82f6]/20 flex items-center justify-center transition-all">
            <Plus size={18} className="group-hover:text-[#3b82f6] text-[#cbd5e1] transition-colors" />
          </div>
          <span className="text-xs font-semibold">Add New Project</span>
        </motion.button>
      </motion.div>

      {/* Add Modal */}
      <ProjectModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(data) => createMutation.mutate(data)}
      />

      {/* Edit Modal */}
      <ProjectModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditTarget(undefined);
        }}
        onSave={(data) => {
          if (editTarget) {
            editMutation.mutate({ id: editTarget.id, data });
          }
        }}
        initial={editTarget}
      />

      {/* AI Drawer */}
      <AiDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAddProject={handleAddRec}
        addedIds={addedRecTitles}
        recommendations={aiRecommendations}
        isPending={recommendMutation.isPending}
        onRecommend={(goal) => recommendMutation.mutate(goal)}
      />
    </div>
  );
}
