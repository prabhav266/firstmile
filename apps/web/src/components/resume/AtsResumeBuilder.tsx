'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Check,
  Code2,
  Briefcase,
  GraduationCap,
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
      company: 'First Mile Systems',
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
        'Built a semantic search microservice indexing 200k+ technical engineering docs using FAISS vector indexing.',
        'Engineered token stream SSE pipeline reducing TTFT (Time To First Token) from 1,200ms to 280ms.',
      ],
    },
    {
      title: 'High-Concurrency Distributed Rate Limiter',
      techStack: 'Go, Redis, gRPC, Docker, Prometheus',
      link: 'github.com/alexmorgan/go-rate-limiter',
      bullets: [
        'Developed a Sliding Window Log rate limiter handling 25,000+ req/sec across distributed cluster instances.',
        'Maintained sub-2ms P99 latency overhead with atomic Redis Lua scripts.',
      ],
    },
  ],
  achievements: [
    'Knight on LeetCode (Max Rating: 1980+, Top 3% globally with 450+ verified problems solved).',
    'Global Rank 240 / 18,000 in Codeforces Round 912 (Div. 2).',
    'Winner - Inter-College Hackathon 2024 (Best Developer Infrastructure track).',
  ],
};

export function AtsResumeBuilder() {
  const [data, setData] = useState<ResumeData>(DEFAULT_RESUME_DATA);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    sounds.playToggle();
    window.print();
  };

  const handleCopyText = () => {
    const textResume = `
${data.fullName}
${data.email} | ${data.phone} | ${data.location}
${data.github} | ${data.linkedin} | ${data.leetcode}

EDUCATION
${data.education.map((e) => `${e.institution} - ${e.degree} (${e.year}) | ${e.score}`).join('\n')}

TECHNICAL SKILLS
Languages: ${data.skills.languages}
Frameworks: ${data.skills.frameworks}
Developer Tools: ${data.skills.developerTools}
Core Concepts: ${data.skills.coreConcepts}

WORK EXPERIENCE
${data.experience
  .map(
    (exp) =>
      `${exp.role} - ${exp.company} (${exp.date})\n${exp.bullets.map((b) => `• ${b}`).join('\n')}`
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

    navigator.clipboard.writeText(textResume);
    sounds.playChime();
    toast.success('Resume plain text copied to clipboard!');
  };

  const addExperienceBullet = (expIdx: number) => {
    const next = { ...data };
    next.experience[expIdx].bullets.push('Quantified action item with impact...');
    setData(next);
  };

  const removeExperienceBullet = (expIdx: number, bIdx: number) => {
    const next = { ...data };
    next.experience[expIdx].bullets.splice(bIdx, 1);
    setData(next);
  };

  const addProjectBullet = (projIdx: number) => {
    const next = { ...data };
    next.projects[projIdx].bullets.push('Architected feature with measurable performance impact...');
    setData(next);
  };

  const removeProjectBullet = (projIdx: number, bIdx: number) => {
    const next = { ...data };
    next.projects[projIdx].bullets.splice(bIdx, 1);
    setData(next);
  };

  const inputClass = 'w-full bg-[#000000] border border-[#242424] rounded py-1 px-2.5 text-xs text-[#ffffff] focus:outline-none focus:border-[#ffffff] font-mono';

  return (
    <div className="space-y-6 font-sans">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#080808] border border-[#1a1a1a] rounded-lg p-4">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-tight font-mono">
            Harvard ATS Single-Page Builder
          </h2>
          <p className="text-xs text-[#888888] font-mono mt-0.5">
            100% parse-guaranteed format optimized for Taleo, Workday, Greenhouse & Lever ATS engines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleCopyText} className="btn-secondary py-1.5 px-3 text-xs gap-1.5 font-mono">
            <Copy size={13} />
            <span>Copy Text</span>
          </button>
          <button onClick={handlePrint} className="btn-primary py-1.5 px-4 text-xs gap-1.5 font-mono">
            <Download size={13} />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Editor + Right Paper Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Form Editor */}
        <div className="xl:col-span-5 space-y-4 font-mono text-xs">
          {/* Contact Details */}
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-[#ffffff] uppercase tracking-wider text-xs pb-2 border-b border-[#1a1a1a]">
              01. Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#888888] uppercase block mb-0.5">Full Name</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#888888] uppercase block mb-0.5">Email</label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#888888] uppercase block mb-0.5">Phone</label>
                <input
                  type="text"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#888888] uppercase block mb-0.5">Location</label>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => setData({ ...data, location: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#888888] uppercase block mb-0.5">GitHub</label>
                <input
                  type="text"
                  value={data.github}
                  onChange={(e) => setData({ ...data, github: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#888888] uppercase block mb-0.5">LeetCode</label>
                <input
                  type="text"
                  value={data.leetcode}
                  onChange={(e) => setData({ ...data, leetcode: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-lg p-4 space-y-3">
            <h3 className="font-bold text-[#ffffff] uppercase tracking-wider text-xs pb-2 border-b border-[#1a1a1a]">
              02. Technical Skills
            </h3>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-[#888888] uppercase block mb-0.5">Languages</label>
                <input
                  type="text"
                  value={data.skills.languages}
                  onChange={(e) =>
                    setData({ ...data, skills: { ...data.skills, languages: e.target.value } })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#888888] uppercase block mb-0.5">Frameworks</label>
                <input
                  type="text"
                  value={data.skills.frameworks}
                  onChange={(e) =>
                    setData({ ...data, skills: { ...data.skills, frameworks: e.target.value } })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#888888] uppercase block mb-0.5">Developer Tools</label>
                <input
                  type="text"
                  value={data.skills.developerTools}
                  onChange={(e) =>
                    setData({ ...data, skills: { ...data.skills, developerTools: e.target.value } })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[10px] text-[#888888] uppercase block mb-0.5">Core Computer Science</label>
                <input
                  type="text"
                  value={data.skills.coreConcepts}
                  onChange={(e) =>
                    setData({ ...data, skills: { ...data.skills, coreConcepts: e.target.value } })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Harvard Single-Page Paper Preview */}
        <div className="xl:col-span-7 flex justify-center">
          <div
            id="printable-resume"
            ref={printRef}
            className="w-full max-w-[760px] bg-white text-black p-8 sm:p-10 shadow-2xl rounded font-serif text-[11px] leading-relaxed border border-[#333333] select-text"
          >
            {/* Header */}
            <div className="text-center border-b-2 border-black pb-3">
              <h1 className="text-2xl font-bold uppercase tracking-wider font-sans text-black">
                {data.fullName}
              </h1>
              <div className="text-[11px] text-gray-700 font-sans mt-1 space-x-2">
                <span>{data.phone}</span>
                <span>•</span>
                <span>{data.email}</span>
                <span>•</span>
                <span>{data.location}</span>
              </div>
              <div className="text-[10.5px] text-gray-800 font-sans mt-0.5 space-x-3">
                <span className="font-semibold">{data.github}</span>
                <span>|</span>
                <span className="font-semibold">{data.linkedin}</span>
                <span>|</span>
                <span className="font-semibold">{data.leetcode}</span>
              </div>
            </div>

            {/* Education */}
            <div className="mt-4 space-y-1">
              <h2 className="text-xs font-bold uppercase font-sans tracking-wider text-black border-b border-black pb-0.5">
                Education
              </h2>
              {data.education.map((edu, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px] font-sans">
                  <div>
                    <strong className="font-bold text-black">{edu.institution}</strong>
                    <div className="text-gray-800 italic">{edu.degree}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-700">{edu.year}</span>
                    <div className="font-semibold text-black">{edu.score}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Technical Skills */}
            <div className="mt-4 space-y-1">
              <h2 className="text-xs font-bold uppercase font-sans tracking-wider text-black border-b border-black pb-0.5">
                Technical Skills
              </h2>
              <div className="text-[11px] font-sans space-y-0.5 text-gray-800">
                <div>
                  <strong className="font-bold text-black">Languages:</strong> {data.skills.languages}
                </div>
                <div>
                  <strong className="font-bold text-black">Frameworks & Libraries:</strong> {data.skills.frameworks}
                </div>
                <div>
                  <strong className="font-bold text-black">Tools & Infrastructure:</strong> {data.skills.developerTools}
                </div>
                <div>
                  <strong className="font-bold text-black">Core CS:</strong> {data.skills.coreConcepts}
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
            <div className="mt-4 space-y-2">
              <h2 className="text-xs font-bold uppercase font-sans tracking-wider text-black border-b border-black pb-0.5">
                Key Technical Projects
              </h2>
              {data.projects.map((proj, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-sans">
                    <div>
                      <strong className="font-bold text-black">{proj.title}</strong> | <span className="italic text-gray-700">{proj.techStack}</span>
                    </div>
                    <span className="text-gray-800 text-[10px]">{proj.link}</span>
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
            <div className="mt-4 space-y-1">
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

      {/* Print Stylesheet */}
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
