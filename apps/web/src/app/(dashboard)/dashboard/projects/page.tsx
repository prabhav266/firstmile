'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Sparkles,
  Github,
  Pencil,
  X,
  Globe,
  Trash2,
  ExternalLink,
  Code,
  Briefcase,
  Layers,
  Check,
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

const STATUS_META: Record<Status, { label: string; badgeClass: string }> = {
  IDEA: {
    label: 'Idea',
    badgeClass: 'bg-[#141414] border border-[#27272a] text-[#888888]',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    badgeClass: 'bg-[#181818] border border-[#333333] text-[#ffffff]',
  },
  COMPLETED: {
    label: 'Completed',
    badgeClass: 'bg-[#ffffff] text-[#000000] font-bold',
  },
};

function StatusBadge({ status }: { status: Status }) {
  const m = STATUS_META[status] || STATUS_META.IDEA;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider ${m.badgeClass}`}>
      {m.label}
    </span>
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-[#080808] border border-[#1a1a1a] hover:border-[#333333] rounded-lg p-5 flex flex-col justify-between transition-colors space-y-4 font-sans select-none"
    >
      <div>
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1a1a1a]">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[#ffffff] tracking-tight">{project.title}</h3>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 rounded hover:bg-[#141414] text-[#666666] hover:text-[#ffffff] transition-colors"
              title="Edit Project"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="p-1.5 rounded hover:bg-[#141414] text-[#666666] hover:text-[#ffffff] transition-colors"
              title="Delete Project"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <p className="text-xs text-[#888888] leading-relaxed line-clamp-3 mt-3">
          {project.description || 'No description provided.'}
        </p>

        {/* Tech Stack Chips */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded bg-[#000000] border border-[#242424] text-[10px] font-mono text-[#888888]"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Resume Impact & Links */}
      <div className="pt-3 border-t border-[#1a1a1a] space-y-3">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-[#666666] uppercase">Resume Impact</span>
          <span className="text-[#ffffff] font-bold">{project.resumeImpact || 80}%</span>
        </div>
        <div className="w-full bg-[#121212] border border-[#1a1a1a] rounded-full h-1 overflow-hidden">
          <div
            className="bg-[#ffffff] h-full"
            style={{ width: `${project.resumeImpact || 80}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-1 text-xs">
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[#888888] hover:text-[#ffffff] flex items-center gap-1.5 transition-colors"
            >
              <Github size={13} />
              <span>Source</span>
            </a>
          ) : (
            <span className="text-[10px] font-mono text-[#444444]">No Repository</span>
          )}

          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[#ffffff] hover:underline flex items-center gap-1.5"
            >
              <Globe size={13} />
              <span>Live Demo</span>
              <ExternalLink size={11} />
            </a>
          ) : (
            <span className="text-[10px] font-mono text-[#444444]">No Live URL</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProjectModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Project>) => void;
  initial?: Project;
}) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [techStackStr, setTechStackStr] = useState(initial?.techStack?.join(', ') || '');
  const [status, setStatus] = useState<Status>(initial?.status || 'IN_PROGRESS');
  const [resumeImpact, setResumeImpact] = useState(initial?.resumeImpact || 80);
  const [githubUrl, setGithubUrl] = useState(initial?.githubUrl || '');
  const [liveUrl, setLiveUrl] = useState(initial?.liveUrl || '');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Project title is required');

    const techStack = techStackStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      title,
      description,
      techStack,
      status,
      resumeImpact: Number(resumeImpact),
      githubUrl,
      liveUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-[#080808] border border-[#1a1a1a] rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl font-sans"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#1a1a1a]">
          <h2 className="text-sm font-bold text-[#ffffff]">
            {initial ? 'Edit Project' : 'Add New Portfolio Project'}
          </h2>
          <button onClick={onClose} className="p-1 rounded text-[#666666] hover:text-[#ffffff]">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Project Title</label>
            <input
              type="text"
              placeholder="e.g. Distributed Key-Value Store"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Describe the architecture, trade-offs, and quantified performance metrics..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-2.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              >
                <option value="IDEA">Idea</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Impact Rating (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={resumeImpact}
                onChange={(e) => setResumeImpact(Number(e.target.value))}
                className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Tech Stack (Comma Separated)</label>
            <input
              type="text"
              placeholder="e.g. Go, gRPC, Redis, Docker, PostgreSQL"
              value={techStackStr}
              onChange={(e) => setTechStackStr(e.target.value)}
              className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">GitHub Repo URL</label>
              <input
                type="url"
                placeholder="https://github.com/username/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#888888] uppercase tracking-wider block mb-1">Live URL</label>
              <input
                type="url"
                placeholder="https://myproject.dev"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="w-full bg-[#000000] border border-[#242424] rounded py-1.5 px-3 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1a1a1a]">
            <button type="button" onClick={onClose} className="btn-secondary py-1.5 px-4">
              Cancel
            </button>
            <button type="submit" className="btn-primary py-1.5 px-4">
              {initial ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | undefined>(undefined);

  // Fetch Projects
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/api/projects').then((res) => res.data?.data || []),
  });

  const projects: Project[] = Array.isArray(projectsQuery.data) ? projectsQuery.data : [];

  // Create Project
  const createMutation = useMutation({
    mutationFn: (data: Partial<Project>) => api.post('/api/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project added to portfolio');
    },
    onError: () => toast.error('Failed to create project'),
  });

  // Edit Project
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => api.put(`/api/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated');
    },
    onError: () => toast.error('Failed to update project'),
  });

  // Delete Project
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project removed');
    },
    onError: () => toast.error('Failed to delete project'),
  });

  const openEdit = (p: Project) => {
    setEditTarget(p);
    setShowEditModal(true);
  };

  const openAdd = () => {
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-7xl">
      {/* Header */}
      <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block mb-1">Portfolio Architecture</span>
          <h1 className="font-display font-bold text-2xl text-[#ffffff] tracking-tight">Verified Engineering Projects</h1>
          <p className="text-xs text-[#888888] font-mono mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''} logged • High-yield proof of work for recruiters
          </p>
        </div>

        <button onClick={openAdd} className="btn-primary py-2 px-4 gap-1.5">
          <Plus size={15} />
          <span>Add Project</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 flex items-center justify-between font-mono">
          <span className="text-xs text-[#888888] uppercase">In Progress</span>
          <span className="text-xl font-bold text-[#ffffff]">{projects.filter((p) => p.status === 'IN_PROGRESS').length}</span>
        </div>
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 flex items-center justify-between font-mono">
          <span className="text-xs text-[#888888] uppercase">Completed</span>
          <span className="text-xl font-bold text-[#ffffff]">{projects.filter((p) => p.status === 'COMPLETED').length}</span>
        </div>
        <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 flex items-center justify-between font-mono">
          <span className="text-xs text-[#888888] uppercase">Ideas</span>
          <span className="text-xl font-bold text-[#666666]">{projects.filter((p) => p.status === 'IDEA').length}</span>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

        {/* Add New Card Slot */}
        <button
          onClick={openAdd}
          className="min-h-[220px] rounded-lg border border-dashed border-[#242424] hover:border-[#ffffff] flex flex-col items-center justify-center gap-2 text-[#666666] hover:text-[#ffffff] bg-[#000000] hover:bg-[#080808] transition-all group p-6"
        >
          <div className="w-8 h-8 rounded bg-[#111111] border border-[#242424] group-hover:border-[#ffffff] flex items-center justify-center transition-colors">
            <Plus size={16} />
          </div>
          <span className="text-xs font-mono font-medium">Add New Project</span>
        </button>
      </div>

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
    </div>
  );
}
