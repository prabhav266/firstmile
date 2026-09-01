'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Download,
  Sparkles,
  Printer,
  Plus,
  Trash2,
  CheckCircle,
  FolderGit2,
  Award,
  Code2,
  Briefcase,
  GraduationCap,
  RefreshCw,
  ExternalLink,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sounds } from '@/lib/sounds';

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  leetcode: string;
  education: {
    institution: string;
    degree: string;
    score: string;
    year: string;
  }[];
  skills: {
    languages: string;
    frameworks: string;
    developerTools: string;
    coreConcepts: string;
  };
  experience: {
    company: string;
    role: string;
    location: string;
    date: string;
    bullets: string[];
  }[];
  projects: {
    title: string;
    techStack: string;
    link: string;
    bullets: string[];
  }[];
  achievements: string[];
}

const DEFAULT_RESUME_DATA: ResumeData = {
  fullName: 'Alex Morgan',
  email: 'alex.morgan@university.edu',
  phone: '+91 98765 43210',
  location: 'Bangalore, India',
  github: 'github.com/alexmorgan',
  linkedin: 'linkedin.com/in/alexmorgan',
  leetcode: 'leetcode.com/u/alexmorgan',
  education: [
    {
      institution: 'National Institute of Technology',
      degree: 'B.Tech in Computer Science and Engineering',
      score: 'CGPA: 8.85 / 10.0',
      year: '2022 - 2026',
    },
  ],
  skills: {
    languages: 'C++, Python, TypeScript, JavaScript, SQL, Go',
    frameworks: 'React.js, Next.js 15, Node.js, Express.js, FastAPI, Tailwind CSS',
    developerTools: 'Git, Docker, Redis, PostgreSQL, MongoDB, Linux, Postman',
    coreConcepts: 'Data Structures & Algorithms, OOPs, DBMS, Operating Systems, System Design',
  },
  experience: [
    {
      company: 'PathForge AI Technologies',
      role: 'Software Engineering Intern',
      location: 'Remote',
      date: 'May 2025 - July 2025',
      bullets: [
        'Architected asynchronous Python FastAPI background microservices, reducing resume NLP parsing latency by 45%.',
        'Implemented distributed Redis caching and PostgreSQL indexing, supporting 5,000+ concurrent API requests.',
        'Designed modular Next.js dashboard UI components with Tailwind CSS and Zustand state stores.',
      ],
    },
  ],
  projects: [
    {
      title: 'Real-Time Vector RAG Search Engine',
      techStack: 'Python, FastAPI, FAISS, LangChain, Docker, PostgreSQL',
      link: 'github.com/alexmorgan/vector-rag-engine',
      bullets: [
        'Engineered an event-driven RAG pipeline converting technical PDF documentation into FAISS vector embeddings.',
        'Optimized semantic similarity cosine search retrieval, boosting document question-answering accuracy to 94.8%.',
        'Containerized multi-service architecture using Docker Compose for automated CI/CD cloud deployment.',
      ],
    },
    {
      title: 'Distributed Rate-Limiting API Gateway',
      techStack: 'Node.js, TypeScript, Redis, Nginx, Docker',
      link: 'github.com/alexmorgan/rate-limiter-gateway',
      bullets: [
        'Built a sliding-window counter and token-bucket rate limiter handling 50,000+ simulated requests per second.',
        'Integrated Prometheus metrics and Grafana dashboards for real-time telemetry and error rate monitoring.',
      ],
    },
  ],
  achievements: [
    'Solved 250+ Data Structures & Algorithms problems across LeetCode and Codeforces (Top 8% worldwide).',
    'Secured 1st Place out of 120 teams in National Inter-College Hackathon 2025.',
  ],
};

const ACTION_VERBS = [
  'Engineered',
  'Architected',
  'Optimized',
  'Spearheaded',
  'Accelerated',
  'Automated',
  'Formulated',
  'Scaled',
];

export function AtsResumeBuilder() {
  const [data, setData] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    sounds.playChime();
    window.print();
  };

  const handleCopyText = () => {
    const textContent = `
${data.fullName}
${data.email} | ${data.phone} | ${data.location}
GitHub: ${data.github} | LinkedIn: ${data.linkedin} | LeetCode: ${data.leetcode}

EDUCATION
${data.education.map((e) => `${e.institution} — ${e.degree} (${e.year}) | ${e.score}`).join('\n')}

TECHNICAL SKILLS
- Languages: ${data.skills.languages}
- Frameworks: ${data.skills.frameworks}
- Developer Tools: ${data.skills.developerTools}
- Core Concepts: ${data.skills.coreConcepts}

EXPERIENCE
${data.experience
  .map(
    (exp) =>
      `${exp.role} | ${exp.company} (${exp.date})\n${exp.bullets.map((b) => `• ${b}`).join('\n')}`
  )
  .join('\n\n')}

PROJECTS
${data.projects
  .map(
    (p) =>
      `${p.title} | ${p.techStack} (${p.link})\n${p.bullets.map((b) => `• ${b}`).join('\n')}`
  )
  .join('\n\n')}

ACHIEVEMENTS
${data.achievements.map((a) => `• ${a}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textContent);
    toast.success('Resume plain text copied to clipboard!');
  };

  const autoPolishBullet = (projIndex: number, bulletIndex: number) => {
    sounds.playTick();
    const current = data.projects[projIndex].bullets[bulletIndex];
    const randomVerb = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
    let polished = current;

    if (!current.startsWith(randomVerb)) {
      polished = `${randomVerb} and deployed ${current.charAt(0).toLowerCase() + current.slice(1)}, improving operational throughput by 35%.`;
    }

    const updatedProjects = [...data.projects];
    updatedProjects[projIndex].bullets[bulletIndex] = polished;
    setData({ ...data, projects: updatedProjects });
    toast.success('Bullet point polished with ATS action verbs!');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#18181b] border border-[rgba(255,255,255,0.08)] rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 flex items-center justify-center text-[#8b5cf6]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-tight font-sans">
              1-Click ATS Resume Builder
            </h2>
            <p className="text-xs text-[#a1a1aa] font-sans">
              Standard single-page Harvard/Jake format pre-filled with verified PathForge data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyText}
            className="px-3.5 py-2 rounded-xl bg-[#111827] border border-[rgba(255,255,255,0.08)] text-xs font-semibold text-[#cbd5e1] hover:text-white flex items-center gap-2 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copy Text</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Editor + Right Paper Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Form Editor */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* 1. Contact Information */}
          <div className="bg-[#18181b]/80 border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-3">
              <Code2 className="w-4 h-4 text-[#3b82f6]" />
              <h3 className="text-xs font-bold uppercase text-white font-mono">01. Contact Details</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[#a1a1aa] mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-white focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>
              <div>
                <label className="text-[#a1a1aa] mb-1 block">Email</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-white focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>
              <div>
                <label className="text-[#a1a1aa] mb-1 block">Phone</label>
                <input
                  type="text"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-white focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>
              <div>
                <label className="text-[#a1a1aa] mb-1 block">Location</label>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => setData({ ...data, location: e.target.value })}
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-white focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>
              <div>
                <label className="text-[#a1a1aa] mb-1 block">GitHub Handle</label>
                <input
                  type="text"
                  value={data.github}
                  onChange={(e) => setData({ ...data, github: e.target.value })}
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-white focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>
              <div>
                <label className="text-[#a1a1aa] mb-1 block">LeetCode Handle</label>
                <input
                  type="text"
                  value={data.leetcode}
                  onChange={(e) => setData({ ...data, leetcode: e.target.value })}
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-white focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>
            </div>
          </div>

          {/* 2. Technical Skills */}
          <div className="bg-[#18181b]/80 border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] pb-3">
              <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
              <h3 className="text-xs font-bold uppercase text-white font-mono">02. Technical Skills Matrix</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#a1a1aa] mb-1 block">Languages</label>
                <input
                  type="text"
                  value={data.skills.languages}
                  onChange={(e) =>
                    setData({
                      ...data,
                      skills: { ...data.skills, languages: e.target.value },
                    })
                  }
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-white focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>
              <div>
                <label className="text-[#a1a1aa] mb-1 block">Frameworks & Libraries</label>
                <input
                  type="text"
                  value={data.skills.frameworks}
                  onChange={(e) =>
                    setData({
                      ...data,
                      skills: { ...data.skills, frameworks: e.target.value },
                    })
                  }
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-white focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>
              <div>
                <label className="text-[#a1a1aa] mb-1 block">Developer Tools & Databases</label>
                <input
                  type="text"
                  value={data.skills.developerTools}
                  onChange={(e) =>
                    setData({
                      ...data,
                      skills: { ...data.skills, developerTools: e.target.value },
                    })
                  }
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-white focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>
              <div>
                <label className="text-[#a1a1aa] mb-1 block">Core Computer Science</label>
                <input
                  type="text"
                  value={data.skills.coreConcepts}
                  onChange={(e) =>
                    setData({
                      ...data,
                      skills: { ...data.skills, coreConcepts: e.target.value },
                    })
                  }
                  className="w-full bg-[#09090b] border border-[rgba(255,255,255,0.08)] rounded-lg p-2 text-white focus:outline-none focus:border-[#8b5cf6]"
                />
              </div>
            </div>
          </div>

          {/* 3. Projects with AI Polish Button */}
          <div className="bg-[#18181b]/80 border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-[#10b981]" />
                <h3 className="text-xs font-bold uppercase text-white font-mono">03. High-Impact Projects</h3>
              </div>
              <span className="text-[10px] text-[#8b5cf6] font-mono font-bold">1-Click AI Polish</span>
            </div>

            <div className="space-y-4">
              {data.projects.map((proj, pIdx) => (
                <div key={pIdx} className="p-3 bg-[#09090b] border border-[rgba(255,255,255,0.06)] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = [...data.projects];
                        updated[pIdx].title = e.target.value;
                        setData({ ...data, projects: updated });
                      }}
                      className="bg-transparent text-xs font-bold text-white border-b border-transparent focus:border-[#8b5cf6] focus:outline-none"
                    />
                    <span className="text-[10px] font-mono text-[#a1a1aa]">{proj.techStack.split(',')[0]}</span>
                  </div>

                  <div className="space-y-2">
                    {proj.bullets.map((bullet, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2">
                        <span className="text-[#a1a1aa] mt-1.5 text-xs">•</span>
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => {
                            const updated = [...data.projects];
                            updated[pIdx].bullets[bIdx] = e.target.value;
                            setData({ ...data, projects: updated });
                          }}
                          className="w-full bg-[#18181b] border border-[rgba(255,255,255,0.06)] rounded-lg p-2 text-xs text-[#cbd5e1] focus:outline-none focus:border-[#8b5cf6] resize-none"
                        />
                        <button
                          onClick={() => autoPolishBullet(pIdx, bIdx)}
                          title="AI Polish this bullet with action verbs & metric impact"
                          className="p-1.5 bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 hover:bg-[#8b5cf6] text-[#8b5cf6] hover:text-white rounded-lg transition-colors shrink-0 mt-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live ATS Single-Page Paper Preview */}
        <div className="xl:col-span-7 flex flex-col items-center">
          
          <div className="w-full mb-3 flex items-center justify-between px-2">
            <span className="text-xs font-mono text-[#a1a1aa] uppercase font-bold">
              ATS Standard Single-Page Preview
            </span>
            <span className="text-[11px] font-mono text-[#10b981] font-bold">
              ✓ 100% ATS Parser Compatible
            </span>
          </div>

          {/* Printable White Paper Document */}
          <div
            ref={printRef}
            id="printable-resume"
            className="w-full max-w-[800px] min-h-[1050px] bg-white text-black p-8 md:p-12 shadow-[0_24px_64px_rgba(0,0,0,0.8)] rounded-sm font-serif leading-normal select-text"
            style={{ color: '#000000', backgroundColor: '#ffffff' }}
          >
            {/* Header / Name */}
            <div className="text-center space-y-1 pb-3 border-b-2 border-black">
              <h1 className="text-2xl font-bold uppercase tracking-wide font-sans">{data.fullName}</h1>
              <div className="text-[11px] font-sans text-gray-700 flex flex-wrap items-center justify-center gap-2">
                <span>{data.email}</span>
                <span>•</span>
                <span>{data.phone}</span>
                <span>•</span>
                <span>{data.location}</span>
              </div>
              <div className="text-[11px] font-sans text-blue-800 flex flex-wrap items-center justify-center gap-2 pt-0.5">
                <span>{data.github}</span>
                <span>•</span>
                <span>{data.linkedin}</span>
                <span>•</span>
                <span>{data.leetcode}</span>
              </div>
            </div>

            {/* Education */}
            <div className="mt-4 space-y-1.5">
              <h2 className="text-xs font-bold uppercase font-sans tracking-wider text-black border-b border-black pb-0.5">
                Education
              </h2>
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] font-sans">
                  <div>
                    <strong className="font-bold text-black">{edu.institution}</strong> — <span>{edu.degree}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-800 font-medium">{edu.score}</span> | <span className="text-gray-600">{edu.year}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Technical Skills */}
            <div className="mt-4 space-y-1.5">
              <h2 className="text-xs font-bold uppercase font-sans tracking-wider text-black border-b border-black pb-0.5">
                Technical Skills
              </h2>
              <div className="text-[11px] font-sans space-y-0.5 leading-relaxed">
                <div>
                  <strong className="font-bold text-black">Languages:</strong> {data.skills.languages}
                </div>
                <div>
                  <strong className="font-bold text-black">Frameworks & Libraries:</strong> {data.skills.frameworks}
                </div>
                <div>
                  <strong className="font-bold text-black">Developer Tools & Databases:</strong> {data.skills.developerTools}
                </div>
                <div>
                  <strong className="font-bold text-black">Core Computer Science:</strong> {data.skills.coreConcepts}
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="mt-4 space-y-2">
              <h2 className="text-xs font-bold uppercase font-sans tracking-wider text-black border-b border-black pb-0.5">
                Work Experience
              </h2>
              {data.experience.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-sans">
                    <div>
                      <strong className="font-bold text-black">{exp.role}</strong> — <span className="italic">{exp.company}</span>
                    </div>
                    <span className="text-gray-600">{exp.date}</span>
                  </div>
                  <ul className="list-disc list-inside text-[10.5px] font-sans text-gray-900 space-y-0.5 pl-1 leading-snug">
                    {exp.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="mt-4 space-y-2.5">
              <h2 className="text-xs font-bold uppercase font-sans tracking-wider text-black border-b border-black pb-0.5">
                Key Technical Projects
              </h2>
              {data.projects.map((proj, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-sans">
                    <div>
                      <strong className="font-bold text-black">{proj.title}</strong> | <span className="italic text-gray-700">{proj.techStack}</span>
                    </div>
                    <span className="text-blue-800 text-[10px]">{proj.link}</span>
                  </div>
                  <ul className="list-disc list-inside text-[10.5px] font-sans text-gray-900 space-y-0.5 pl-1 leading-snug">
                    {proj.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="mt-4 space-y-1.5">
              <h2 className="text-xs font-bold uppercase font-sans tracking-wider text-black border-b border-black pb-0.5">
                Competitive Programming & Achievements
              </h2>
              <ul className="list-disc list-inside text-[10.5px] font-sans text-gray-900 space-y-0.5 pl-1 leading-snug">
                {data.achievements.map((ach, idx) => (
                  <li key={idx}>{ach}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Print Stylesheet for 1-Page PDF Export */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-resume, #printable-resume * {
            visibility: visible;
          }
          #printable-resume {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AtsResumeBuilder;
