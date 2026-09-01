'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Send, Timer, X, Bot, User, ChevronDown, Star, MessageSquare, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
type Role = 'Software Engineer' | 'Data Scientist' | 'Frontend Dev' | 'Backend Dev' | 'Full Stack';
type Company = 'Google' | 'Amazon' | 'Microsoft' | 'Startup' | 'General';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

const ROLES: Role[] = ['Software Engineer', 'Data Scientist', 'Frontend Dev', 'Backend Dev', 'Full Stack'];
const COMPANIES: Company[] = ['Google', 'Amazon', 'Microsoft', 'Startup', 'General'];
const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: 'text-[#22c55e] bg-[#22c55e]/15 border-[#22c55e]/30',
  Medium: 'text-[#f59e0b] bg-[#f59e0b]/15 border-[#f59e0b]/30',
  Hard: 'text-[#ef4444] bg-[#ef4444]/15 border-[#ef4444]/30',
};

const COMPANY_ICONS: Record<Company, string> = {
  Google: 'G',
  Amazon: 'A',
  Microsoft: 'M',
  Startup: 'S',
  General: '*',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getDifficultyDisplay(diff: string) {
  const d = diff ? diff.toUpperCase() : 'MEDIUM';
  if (d === 'EASY') return { color: DIFFICULTY_COLORS.Easy, text: 'Easy' };
  if (d === 'HARD') return { color: DIFFICULTY_COLORS.Hard, text: 'Hard' };
  return { color: DIFFICULTY_COLORS.Medium, text: 'Medium' };
}

const getCompanyIcon = (companyStr: string) => {
  const c = companyStr || 'General';
  return COMPANY_ICONS[c as Company] || c[0] || '*';
};

// Custom select component
function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative flex-1 min-w-[200px]">
      <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wider">{label}</label>
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-lg py-2.5 px-4 text-sm text-[#f9fafb] flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] transition-all hover:border-[rgba(255,255,255,0.15)]"
      >
        {icon && <span className="text-[#3b82f6]">{icon}</span>}
        <span className="flex-1 text-left">{value}</span>
        <ChevronDown className={`w-4 h-4 text-[#94a3b8] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 top-full mt-1 w-full bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden shadow-xl"
          >
            {options.map((opt) => (
              <li key={opt}>
                <button
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${opt === value ? 'bg-[#3b82f6]/20 text-[#3b82f6] font-semibold' : 'text-[#cbd5e1] hover:bg-[#111827] hover:text-[#f9fafb]'}`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// Score Ring Component (redesigned as solid blue circle gauge)
function ScoreRing({ score }: { score: number }) {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center mx-auto rounded-full bg-[#3b82f6] text-white border-4 border-white/10 shadow-sm">
      <div className="text-center">
        <span className="text-3xl font-extrabold tracking-tight text-[#f9fafb]">{score.toFixed(1)}</span>
        <span className="block text-[10px] uppercase font-bold tracking-widest text-blue-100 mt-0.5">/ 10</span>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const queryClient = useQueryClient();

  const [role, setRole] = useState<Role>('Software Engineer');
  const [company, setCompany] = useState<Company>('Google');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recognitionRef = useRef<any>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  // Fetch past interview history
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['interviewHistory'],
    queryFn: () => api.get('/api/interview/history'),
  });

  const pastSessions = historyData?.data?.data || [];

  const sessionId = currentSession?.id;

  // Fetch active session details
  const { data: sessionDetailsData } = useQuery({
    queryKey: ['sessionDetails', sessionId],
    queryFn: () => api.get(`/api/interview/session/${sessionId}`),
    enabled: !!sessionId,
  });

  // Sync fetched session details to current session
  useEffect(() => {
    if (sessionDetailsData?.data?.data) {
      setCurrentSession(sessionDetailsData.data.data);
    }
  }, [sessionDetailsData]);

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: (data: { role: string; company: string; difficulty: string }) =>
      api.post('/api/interview/start', data),
    onSuccess: (res) => {
      setSessionStarted(true);
      setCurrentSession(res.data.data);
      setCurrentQIdx(0);
      setAnswer('');
      setElapsed(0);
      toast.success('Interview session started!');
      queryClient.invalidateQueries({ queryKey: ['interviewHistory'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to start interview');
    },
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: ({ id, questionId, answer }: { id: string; questionId: number; answer: string }) =>
      api.post(`/api/interview/answer/${id}`, { questionId, answer }),
    onSuccess: (res) => {
      const updatedSession = res.data.data;
      setCurrentSession(updatedSession);
      toast.success('Answer evaluated!');
      setAnswer('');
      queryClient.invalidateQueries({ queryKey: ['sessionDetails', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['interviewHistory'] });

      // Move to the next unanswered question or complete the session
      const questions = updatedSession.questions || [];
      const nextUnansweredIdx = questions.findIndex((q: any) => !q.answer);
      if (nextUnansweredIdx !== -1) {
        setCurrentQIdx(nextUnansweredIdx);
      } else {
        toast.success('Interview completed!');
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to evaluate answer');
    },
  });

  // Timer
  useEffect(() => {
    if (!sessionStarted) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [sessionStarted]);

  // Scroll history to bottom
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.questions, currentQIdx]);

  // Speech recognition
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }
    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setAnswer(transcript);
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
  };

  const handleStart = () => {
    startSessionMutation.mutate({
      role,
      company,
      difficulty: (difficulty.toUpperCase() as any),
    });
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || submitAnswerMutation.isPending) return;

    const currentQuestionObj = currentSession?.questions?.[currentQIdx];
    if (!currentQuestionObj) return;

    submitAnswerMutation.mutate({
      id: currentSession.id,
      questionId: currentQuestionObj.id,
      answer: answer.trim(),
    });
  };

  const handleEndSession = () => {
    setSessionStarted(false);
    setCurrentSession(null);
    setCurrentQIdx(0);
    setAnswer('');
    setElapsed(0);
    setIsRecording(false);
    recognitionRef.current?.stop();
  };

  // Derive answered questions and current state values
  const answeredQuestions = currentSession?.questions?.filter((q: any) => q.answer) || [];
  
  const lastAnsweredQuestion = currentSession?.questions
    ? [...currentSession.questions].reverse().find((q: any) => q.answer && q.aiScore !== null)
    : null;

  const isSessionCompleted = currentSession && currentSession.overallScore !== null;
  const showEval = isSessionCompleted || !!lastAnsweredQuestion;

  const evalScore = isSessionCompleted
    ? (currentSession.overallScore || 0)
    : (lastAnsweredQuestion?.aiScore || 0);

  const evalFeedback = isSessionCompleted
    ? (currentSession.feedback || 'Good job completing the mock interview!')
    : (lastAnsweredQuestion?.feedback || 'Evaluating your answer...');

  const grammarFeedback = evalScore >= 8
    ? 'Excellent articulation and professional flow'
    : evalScore >= 6
    ? 'Clear flow, minor vocabulary enhancements possible'
    : 'Needs improvement in structure and vocabulary';

  const technicalFeedback = evalScore >= 8
    ? 'Strong technical depth and keyword coverage'
    : evalScore >= 6
    ? 'Good technical coverage, could add more depth'
    : 'Lacks core technical concepts and keywords';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6 max-w-7xl font-sans"
    >
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#3b82f6]/10 border border-[rgba(255,255,255,0.08)]">
          <Bot className="w-5 h-5 text-[#3b82f6]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#f9fafb] leading-none">AI Mock Interview</h1>
          <p className="text-sm text-[#cbd5e1] mt-0.5">Practice with intelligent real-time feedback</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* SETUP PANEL */}
        {!sessionStarted && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Configure Card */}
            <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-[#f9fafb]">Configure Your Session</h2>
                <p className="text-sm text-[#cbd5e1] mt-1">Choose your target role, company, and difficulty level to begin.</p>
              </div>

              {/* Selectors */}
              <div className="flex gap-4 flex-wrap mb-8">
                <SelectField
                  label="Role"
                  value={role}
                  options={ROLES}
                  onChange={setRole}
                  icon={<User className="w-3.5 h-3.5" />}
                />
                <SelectField
                  label="Company"
                  value={company}
                  options={COMPANIES}
                  onChange={setCompany}
                  icon={<span className="text-xs font-bold w-3.5 text-center">{getCompanyIcon(company)}</span>}
                />
                <SelectField
                  label="Difficulty"
                  value={difficulty}
                  options={DIFFICULTIES}
                  onChange={setDifficulty}
                  icon={<Star className="w-3.5 h-3.5" />}
                />
              </div>

              {/* Session Preview */}
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="text-xs px-3 py-1.5 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] font-medium">
                  {role}
                </span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] font-medium">
                  {company}
                </span>
                <span className={`text-xs px-3 py-1.5 rounded-full border font-medium ${DIFFICULTY_COLORS[difficulty]}`}>
                  {difficulty}
                </span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-[#111827] border border-[rgba(255,255,255,0.08)] text-[#94a3b8] font-medium">
                  3 Questions
                </span>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleStart}
                disabled={startSessionMutation.isPending}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl py-3 px-8 font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {startSessionMutation.isPending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Starting Session...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    Start Interview
                  </>
                )}
              </motion.button>
            </div>

            {/* Past Sessions Card with clean minimal table */}
            <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#8b5cf6]" />
                <h3 className="text-sm font-semibold text-[#f9fafb]">Past Sessions</h3>
              </div>

              {isHistoryLoading ? (
                <div className="flex justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-[#3b82f6]/30 border-t-[#3b82f6] rounded-full"
                  />
                </div>
              ) : pastSessions && pastSessions.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-[rgba(255,255,255,0.08)]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#111827] border-b border-[rgba(255,255,255,0.08)]">
                        <th className="py-3 px-4 text-[10px] tracking-wider uppercase font-semibold text-[#cbd5e1]">Role</th>
                        <th className="py-3 px-4 text-[10px] tracking-wider uppercase font-semibold text-[#cbd5e1]">Company</th>
                        <th className="py-3 px-4 text-[10px] tracking-wider uppercase font-semibold text-[#cbd5e1]">Difficulty</th>
                        <th className="py-3 px-4 text-[10px] tracking-wider uppercase font-semibold text-[#cbd5e1]">Score</th>
                        <th className="py-3 px-4 text-[10px] tracking-wider uppercase font-semibold text-[#cbd5e1]">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastSessions.map((sess: any) => {
                        const dateStr = new Date(sess.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        });
                        const diffDisplay = getDifficultyDisplay(sess.difficulty);
                        return (
                          <tr key={sess.id} className="border-b border-[rgba(255,255,255,0.08)] last:border-b-0 hover:bg-[#111827]/40 transition-colors">
                            <td className="py-3.5 px-4 text-sm font-medium text-[#f9fafb]">{sess.role}</td>
                            <td className="py-3.5 px-4 text-sm text-[#cbd5e1]">{sess.company}</td>
                            <td className="py-3.5 px-4 text-sm">
                              <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${diffDisplay.color}`}>
                                {diffDisplay.text}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-sm">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sess.overallScore !== null ? 'text-[#22c55e] bg-[#22c55e]/15 border-[#22c55e]/30' : 'text-[#94a3b8] bg-[#111827] border-[rgba(255,255,255,0.08)]'}`}>
                                {sess.overallScore !== null ? `${sess.overallScore.toFixed(1)}/10` : 'Pending'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-sm text-[#94a3b8]">{dateStr}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-[#cbd5e1] text-center py-6">No past sessions found. Start your first session!</p>
              )}
            </div>
          </motion.div>
        )}

        {/* INTERVIEW PANEL */}
        {sessionStarted && currentSession && (
          <motion.div
            key="interview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex gap-6 items-start flex-col lg:flex-row"
          >
            {/* LEFT: Chat Pane (60%) */}
            <div className="flex-[3] w-full min-w-0 space-y-4">
              {/* Session Header */}
              <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl px-5 py-3.5 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6] font-medium">
                    {currentSession.role}
                  </span>
                  {currentSession.company && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] font-medium">
                      {currentSession.company}
                    </span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getDifficultyDisplay(currentSession.difficulty).color}`}>
                    {getDifficultyDisplay(currentSession.difficulty).text}
                  </span>
                  <span className="text-xs text-[#cbd5e1]">
                    Q{currentQIdx + 1} / {currentSession.questions?.length || 0}
                  </span>
                </div>
                {/* Timer */}
                <div className="flex items-center gap-1.5 text-sm font-mono font-bold text-[#f9fafb]">
                  <Timer className="w-4 h-4 text-[#8b5cf6]" />
                  {formatTime(elapsed)}
                </div>
              </div>

              {/* Conversation Chat Pane */}
              <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 md:p-6 flex flex-col gap-6 max-h-[500px] overflow-y-auto">
                <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)] pb-3">
                  <MessageSquare className="w-4 h-4 text-[#3b82f6]" />
                  <h3 className="text-sm font-semibold text-[#f9fafb]">Conversation Pane</h3>
                </div>

                <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-1">
                  {currentSession.questions?.slice(0, currentQIdx + 1).map((q: any, i: number) => (
                    <div key={i} className="space-y-4">
                      {/* AI Interviewer Bubble (Left aligned) */}
                      <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-[#111827] border border-[rgba(255,255,255,0.08)] flex items-center justify-center shrink-0">
                          <Bot className="w-4 h-4 text-[#3b82f6]" />
                        </div>
                        <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] text-[#f9fafb] text-sm rounded-2xl rounded-tl-none p-4 max-w-[85%] leading-relaxed shadow-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-semibold text-[#3b82f6] uppercase tracking-wider">Interviewer</span>
                            <span className="text-[9px] text-[#cbd5e1] bg-[#111827] px-1.5 py-0.5 rounded">Q{i + 1}</span>
                          </div>
                          <p>{q.question}</p>
                        </div>
                      </div>

                      {/* Student Answer Bubble (Right aligned) */}
                      {q.answer && (
                        <div className="flex items-start gap-3 justify-end">
                          <div className="bg-[#3b82f6] text-[#f9fafb] text-sm rounded-2xl rounded-tr-none p-4 max-w-[85%] leading-relaxed shadow-sm">
                            <p className="text-[10px] font-semibold text-blue-100 uppercase tracking-wider mb-1 text-right">You</p>
                            <p>{q.answer}</p>
                            {q.aiScore !== null && (
                              <div className="mt-2 flex items-center justify-end gap-1.5">
                                <span className="text-[9px] bg-white/20 text-[#f9fafb] font-bold px-2 py-0.5 rounded-full">
                                  Score: {q.aiScore}/10
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-[#3b82f6]/20 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-[#f9fafb]" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={historyEndRef} />
                </div>
              </div>

              {/* Answer Input or Session Completed Banner */}
              <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 space-y-3">
                {isSessionCompleted ? (
                  <div className="border border-[#22c55e]/30 bg-[#22c55e]/5 rounded-xl p-6 text-center space-y-3">
                    <div className="inline-flex p-3 rounded-full bg-[#22c55e]/15 text-[#22c55e]">
                      <Bot className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#f9fafb]">Interview Completed!</h3>
                    <p className="text-xs text-[#cbd5e1] max-w-md mx-auto">
                      You have successfully answered all the questions for this interview session. Read the comprehensive AI feedback in the right panel.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-[#cbd5e1] uppercase tracking-wider">Your Answer</label>
                      {isRecording && (
                        <motion.span
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          className="flex items-center gap-1.5 text-xs text-[#ef4444] font-semibold"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                          Recording...
                        </motion.span>
                      )}
                    </div>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here, or use the microphone to speak..."
                      className="w-full min-h-[150px] bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-[10px] py-3 px-4 text-sm text-[#f9fafb] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all resize-none"
                    />

                    {/* Bottom bar / Voice & text controls */}
                    <div className="flex items-center gap-3">
                      {/* Voice toggle */}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={toggleRecording}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                          isRecording
                            ? 'bg-[#ef4444] border-transparent text-[#f9fafb] hover:bg-[#dc2626]'
                            : 'bg-[#111827] border border-[rgba(255,255,255,0.08)] text-[#cbd5e1] hover:bg-[#1f2937] hover:text-[#f9fafb]'
                        }`}
                      >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        {isRecording ? 'Stop' : 'Voice'}
                      </motion.button>

                      {/* Submit */}
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSubmitAnswer}
                        disabled={!answer.trim() || submitAnswerMutation.isPending}
                        className="bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl py-2.5 px-5 font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-1 justify-center transition-colors shadow-sm"
                      >
                        {submitAnswerMutation.isPending ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Evaluating...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Submit Answer
                          </>
                        )}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT: Feedback Panel (40%) */}
            <div className="flex-[2] w-full min-w-[280px] space-y-4">
              <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 space-y-5">
                <h2 className="text-base font-semibold text-[#f9fafb] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#8b5cf6]" />
                  AI Feedback
                </h2>

                <AnimatePresence mode="wait">
                  {showEval ? (
                    <motion.div
                      key="eval"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="space-y-5"
                    >
                      {/* Score circle gauge */}
                      <div className="text-center space-y-1">
                        <ScoreRing score={evalScore} />
                        <p className="text-xs text-[#cbd5e1] mt-2">
                          {isSessionCompleted ? 'Overall Interview Score' : 'Last Question Score'}
                        </p>
                      </div>

                      {/* Feedback */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">Feedback</p>
                        <p className="text-sm text-[#cbd5e1] leading-relaxed bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl p-4">{evalFeedback}</p>
                      </div>

                      {/* Grammar Feedback (slate panel layouts) */}
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#1f2937] border border-[rgba(255,255,255,0.08)]">
                        <Star className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold text-[#22c55e] uppercase tracking-wider">Grammar</p>
                          <p className="text-xs text-[#cbd5e1] mt-0.5">{grammarFeedback}</p>
                        </div>
                      </div>

                      {/* Technical Quality Feedback (slate panel layouts) */}
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-[#1f2937] border border-[rgba(255,255,255,0.08)]">
                        <BookOpen className="w-4 h-4 text-[#3b82f6] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-semibold text-[#3b82f6] uppercase tracking-wider">Technical Quality</p>
                          <p className="text-xs text-[#cbd5e1] mt-0.5">{technicalFeedback}</p>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center gap-3 py-10 text-center"
                    >
                      <div className="p-4 rounded-full bg-[#111827] border border-[rgba(255,255,255,0.08)]">
                        <MessageSquare className="w-6 h-6 text-[#94a3b8]" />
                      </div>
                      <p className="text-sm text-[#cbd5e1]">Submit your answer to receive AI feedback</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* End Session button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleEndSession}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-transparent bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] text-sm font-semibold transition-all"
                >
                  <X className="w-4 h-4" />
                  End Session
                </motion.button>
              </div>

              {/* Question progress */}
              <div className="bg-[#1f2937] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-[#f9fafb]">Question Progress</h3>
                <div className="space-y-2">
                  {currentSession.questions?.map((q: any, i: number) => {
                    const hasAnswer = !!q.answer;
                    const isActive = i === currentQIdx;
                    return (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive ? 'border-[#3b82f6] bg-[#3b82f6]/10' : hasAnswer ? 'border-[#22c55e]/30 bg-[#22c55e]/5' : 'border-[rgba(255,255,255,0.08)] bg-transparent'}`}>
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${isActive ? 'bg-[#3b82f6] text-white' : hasAnswer ? 'bg-[#22c55e] text-white' : 'bg-[#111827] text-[#94a3b8] border border-[rgba(255,255,255,0.08)]'}`}>
                          {hasAnswer ? '✓' : i + 1}
                        </span>
                        <p className="text-xs text-[#cbd5e1] line-clamp-1">{q.question}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="h-1.5 rounded-full bg-[#111827] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#3b82f6]"
                    animate={{ width: `${(answeredQuestions.length / (currentSession.questions?.length || 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-[10px] text-[#cbd5e1]">{answeredQuestions.length} of {currentSession.questions?.length || 0} answered</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
