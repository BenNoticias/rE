'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Clock, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Loader2,
  Award,
  BookOpen,
  Bookmark,
  Timer,
  Watch,
  Sliders,
  GraduationCap,
  Layers,
  Zap,
  TrendingUp,
  FileCheck2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubjectId, SUBJECTS, UserProfile, QuizQuestion, QuizResult } from '@/types';
import { saveQuizResult, updateUserXP } from '@/lib/storage';
import { SaveTitleModal } from './SaveTitleModal';

interface QuizModuleProps {
  profile: UserProfile;
  selectedSubject?: SubjectId;
  onProfileUpdated?: (updated: UserProfile) => void;
  onQuizCompleted?: (result: QuizResult) => void;
}

export function QuizModule({ 
  profile, 
  selectedSubject = 'matematica', 
  onProfileUpdated, 
  onQuizCompleted 
}: QuizModuleProps) {
  // Navigation / Mode Selection
  const [activeMode, setActiveMode] = useState<'quick' | 'enem' | 'custom'>('quick');

  // Quick / Single Subject Mode
  const [subject, setSubject] = useState<SubjectId>(selectedSubject);
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(15);

  // ENEM Mode State
  const [enemDay, setEnemDay] = useState<1 | 2>(1);
  const [enemRoadmap, setEnemRoadmap] = useState('');

  // Custom Advanced Mode State
  const [customSubjects, setCustomSubjects] = useState<SubjectId[]>([selectedSubject]);
  const [customCount, setCustomCount] = useState<number>(45);
  const [customMinutes, setCustomMinutes] = useState<number>(90);
  const [customRoadmap, setCustomRoadmap] = useState('');

  // Timer Configuration (Timer regressivo vs Cronômetro progressivo)
  const [timeMode, setTimeMode] = useState<'timer' | 'stopwatch'>('timer');

  // Loading & State during Exam
  const [loading, setLoading] = useState(false);
  const [loadingBatchInfo, setLoadingBatchInfo] = useState('');
  const [quizData, setQuizData] = useState<{ title: string; questions: QuizQuestion[]; isEnem?: boolean } | null>(null);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  
  // Timer State (in seconds)
  const [elapsedSeconds, setElapsedSeconds] = useState(0); // For stopwatch & metrics
  const [remainingSeconds, setRemainingSeconds] = useState(900); // For countdown timer
  const [initialLimitSeconds, setInitialLimitSeconds] = useState(900);

  // Results & Feedback
  const [isFinished, setIsFinished] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [quizSaved, setQuizSaved] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [error, setError] = useState('');

  // Timer Interval Effect
  useEffect(() => {
    if (!quizData || isFinished) return;

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);

      if (timeMode === 'timer') {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            finishQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quizData, isFinished, timeMode]);

  // Starts the Quiz
  const handleStartQuiz = async () => {
    setLoading(true);
    setError('');
    setIsFinished(false);
    setQuizResult(null);

    let targetQuestionCount = questionCount;
    let targetSubjects: SubjectId[] = [subject];
    let targetRoadmap = topic.trim();
    let isEnem = false;
    let limitMinutes = Math.max(5, targetQuestionCount * 3); // 3 min por questão padrão

    if (activeMode === 'enem') {
      isEnem = true;
      targetQuestionCount = 90;
      targetRoadmap = enemRoadmap.trim();
      if (enemDay === 1) {
        targetSubjects = ['portugues', 'literatura', 'historia', 'geografia', 'filosofia', 'sociologia'];
        limitMinutes = 330; // 5h 30min
      } else {
        targetSubjects = ['matematica', 'fisica', 'quimica', 'biologia'];
        limitMinutes = 300; // 5h
      }
    } else if (activeMode === 'custom') {
      targetQuestionCount = customCount;
      targetSubjects = customSubjects.length ? customSubjects : [subject];
      targetRoadmap = customRoadmap.trim();
      limitMinutes = customMinutes;
    }

    if (targetQuestionCount > 15) {
      setLoadingBatchInfo(`Preparando simulado estendido com ${targetQuestionCount} questões em múltiplos lotes pedagógicos...`);
    } else {
      setLoadingBatchInfo('Elaborando questões com Inteligência Artificial...');
    }

    try {
      const res = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: targetSubjects.length === 1 ? targetSubjects[0] : 'multidisciplinar',
          subjects: targetSubjects,
          grade: profile.grade,
          topic: targetRoadmap,
          roadmap: targetRoadmap,
          questionCount: targetQuestionCount,
          isEnemMode: isEnem,
          enemDay: isEnem ? enemDay : undefined,
          userApiKey: profile.customGeminiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erro ao carregar o simulado.');
      }

      const questions: QuizQuestion[] = data.questions || [];
      if (questions.length === 0) {
        throw new Error('Nenhuma questão gerada.');
      }

      setQuizData({
        title: data.title || `Simulado (${questions.length} Questões)`,
        questions,
        isEnem,
      });

      setSelectedAnswers(new Array(questions.length).fill(-1));
      setCurrentIdx(0);
      setElapsedSeconds(0);
      setRemainingSeconds(limitMinutes * 60);
      setInitialLimitSeconds(limitMinutes * 60);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar o simulado com a IA. Tente novamente.');
    } finally {
      setLoading(false);
      setLoadingBatchInfo('');
    }
  };

  const handleSelectOption = (optionIdx: number) => {
    if (isFinished) return;
    const updated = [...selectedAnswers];
    updated[currentIdx] = optionIdx;
    setSelectedAnswers(updated);
  };

  const finishQuiz = (timeoutReached: boolean = false) => {
    if (!quizData) return;

    let correct = 0;
    quizData.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct += 1;
      }
    });

    const total = quizData.questions.length;
    const scorePercentage = Math.round((correct / (total || 1)) * 100);
    const xpEarned = correct * 25 + (total >= 45 ? 200 : total >= 15 ? 100 : 50);

    const totalSpent = Math.max(1, elapsedSeconds);
    const minutesSpent = totalSpent / 60;
    const questionsPerMin = parseFloat((total / minutesSpent).toFixed(2));
    const averageSecsPerQ = Math.round(totalSpent / (total || 1));

    const result: QuizResult = {
      id: `quiz_${Date.now()}`,
      title: quizData.title,
      subject,
      subjects: activeMode === 'custom' ? customSubjects : undefined,
      grade: profile.grade,
      questions: quizData.questions,
      userAnswers: selectedAnswers,
      score: scorePercentage,
      correctCount: correct,
      totalQuestions: total,
      xpEarned,
      timeMode,
      timeSpentSeconds: totalSpent,
      questionsPerMinute: questionsPerMin,
      averageSecondsPerQuestion: averageSecsPerQ,
      isEnemMode: quizData.isEnem,
      enemDay: quizData.isEnem ? enemDay : undefined,
      createdAt: new Date().toISOString(),
      isSaved: false,
    };

    setIsFinished(true);
    setQuizResult(result);
    setQuizSaved(false);

    // Registro automático obrigatório no histórico (v0.9)
    saveQuizResult(result, false);
    
    // Atualiza XP e Nível
    const updatedProfile = updateUserXP(xpEarned);
    if (onProfileUpdated) onProfileUpdated(updatedProfile);
    if (onQuizCompleted) onQuizCompleted(result);

    if (scorePercentage >= 60) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // Salvar com Título Personalizado
  const handleConfirmSaveTitle = (customTitle: string) => {
    if (!quizResult) return;
    const updated = { 
      ...quizResult, 
      customTitle, 
      title: customTitle,
      isSaved: true 
    };
    saveQuizResult(updated, true);
    setQuizResult(updated);
    setQuizSaved(true);
  };

  // Formatação de Segundos em MM:SS ou HH:MM:SS
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hours > 0) {
      return `${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleSubjectInCustom = (subjId: SubjectId) => {
    setCustomSubjects(prev => {
      if (prev.includes(subjId)) {
        if (prev.length === 1) return prev; // Mantém ao menos 1
        return prev.filter(s => s !== subjId);
      }
      return [...prev, subjId];
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      
      {/* ------------------------------------------------------------------ */}
      {/* TELA DE CONFIGURAÇÃO DO SIMULADO */}
      {/* ------------------------------------------------------------------ */}
      {!quizData && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl relative overflow-hidden border border-blue-800">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-2">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Simulador Inteligente Oficial (v0.11)</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Simulados Gamificados & Provas ENEM</h1>
                <p className="text-sm text-blue-100 mt-1 max-w-xl">
                  Pratique com 15, 45 ou 90 questões personalizadas, cronometre seu ritmo por questão e simule os 2 dias oficiais do ENEM.
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex bg-white/15 p-1 rounded-2xl backdrop-blur-md border border-white/20 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveMode('quick')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeMode === 'quick' ? 'bg-white text-blue-700 shadow-md' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Rápido (15/45/90)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('enem')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeMode === 'enem' ? 'bg-white text-blue-700 shadow-md' : 'text-white/80 hover:text-white'
                  }`}
                >
                  ENEM Completo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('custom')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeMode === 'custom' ? 'bg-white text-blue-700 shadow-md' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Personalizado
                </button>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* SUB-MODO 1: RÁPIDO & MATÉRIA ESPECÍFICA */}
            {activeMode === 'quick' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                    <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span>Configuração Rápida por Matéria</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Escolha a disciplina e a quantidade de questões para um treino focado.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Disciplina
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value as SubjectId)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Quantidade de Questões (Presets)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[15, 45, 90].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setQuestionCount(count)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            questionCount === count
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {count} Questões
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Roteiro ou Assunto Específico (Opcional)
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: Funções Trigonométricas, Era Vargas, Genética Mendeliana..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* SUB-MODO 2: SIMULADO ENEM COMPLETO */}
            {activeMode === 'enem' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>Simulado Oficial ENEM Completo (90 Questões)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Simulação fidedigna da matriz do Exame Nacional do Ensino Médio com tempo oficial de prova.
                  </p>
                </div>

                {/* Day Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setEnemDay(1)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                      enemDay === 1
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Dia 1 Oficial
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        5h 30min
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Linguagens & Ciências Humanas + Redação
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      90 Questões (Português, Literatura, História, Geografia, Filosofia e Sociologia).
                    </p>
                  </div>

                  <div
                    onClick={() => setEnemDay(2)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                      enemDay === 2
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Dia 2 Oficial
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        5h 00min
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Matemática & Ciências da Natureza
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      90 Questões (Matemática, Física, Química e Biologia).
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Roteiro de Assuntos Prioritários para o ENEM (Opcional)
                  </label>
                  <input
                    type="text"
                    value={enemRoadmap}
                    onChange={(e) => setEnemRoadmap(e.target.value)}
                    placeholder="Ex: Ecologia, Termologia, Cidadania, Funções, Eletrodinâmica, Geopolítica..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* SUB-MODO 3: PERSONALIZADO AVANÇADO */}
            {activeMode === 'custom' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Personalização Livre Multidisciplinar</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Escolha múltiplas matérias, defina a quantidade exata de questões e o tempo limite.
                  </p>
                </div>

                {/* Subject Multiselect */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Matérias Incluídas no Simulado ({customSubjects.length} selecionadas):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {SUBJECTS.map((s) => {
                      const isSelected = customSubjects.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSubjectInCustom(s.id)}
                          className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-600 text-purple-700 dark:text-purple-300 font-bold'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="truncate">{s.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Quantidade de Questões
                      </label>
                      <span className="text-xs font-bold text-purple-600">{customCount} questões</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="90"
                      step="5"
                      value={customCount}
                      onChange={(e) => setCustomCount(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Tempo Limite da Prova
                      </label>
                      <span className="text-xs font-bold text-purple-600">{customMinutes} minutos ({formatTime(customMinutes * 60)})</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="330"
                      step="15"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Roteiro Específico de Assuntos:
                  </label>
                  <textarea
                    rows={2}
                    value={customRoadmap}
                    onChange={(e) => setCustomRoadmap(e.target.value)}
                    placeholder="Ex: Cinemática, Ligações Químicas, Geopolítica da Ásia, Segunda Guerra Mundial, Análise Combinatória..."
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {/* SELETOR DE MODO DE TEMPO (TIMER VS CRONÔMETRO) */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Modo de Medição de Tempo
                </span>
                <span className="text-[11px] text-slate-500">
                  Escolha como prefere acompanhar a duração da sua prova.
                </span>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTimeMode('timer')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    timeMode === 'timer'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Timer (Regressivo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTimeMode('stopwatch')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                    timeMode === 'stopwatch'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Watch className="w-3.5 h-3.5" />
                  <span>Cronômetro (Progressivo)</span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartQuiz}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{loadingBatchInfo || 'Gerando simulado...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Iniciar Simulado Agora</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TELA DE REALIZAÇÃO DO SIMULADO */}
      {/* ------------------------------------------------------------------ */}
      {quizData && !isFinished && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Header Bar during exam */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                {quizData.isEnem ? `Simulado Oficial ENEM (Dia ${enemDay})` : 'Simulado em Andamento'}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Questão {currentIdx + 1} de {quizData.questions.length}
              </h2>
            </div>

            {/* Visible Timer / Stopwatch */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-sm text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {timeMode === 'timer' ? (
                  <>
                    <Timer className={`w-4 h-4 ${remainingSeconds < 300 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`} />
                    <span className={remainingSeconds < 300 ? 'text-red-500' : ''}>
                      {formatTime(remainingSeconds)}
                    </span>
                  </>
                ) : (
                  <>
                    <Watch className="w-4 h-4 text-emerald-500" />
                    <span>{formatTime(elapsedSeconds)}</span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja realmente entregar e finalizar o simulado agora?')) {
                    finishQuiz();
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
              >
                Finalizar Prova
              </button>
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Question Statement */}
            <div className="space-y-2">
              {quizData.questions[currentIdx].subject && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                  {quizData.questions[currentIdx].subject}
                </span>
              )}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-relaxed font-serif">
                {quizData.questions[currentIdx].question}
              </h3>
            </div>

            {/* Alternatives (5 options standard) */}
            <div className="space-y-2.5">
              {quizData.questions[currentIdx].options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentIdx] === oIdx;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full p-4 rounded-2xl text-left border text-xs sm:text-sm font-medium transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="leading-relaxed flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Question Navigation Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              <span className="text-xs text-slate-400 font-medium">
                Respondidas: {selectedAnswers.filter(a => a !== -1).length} de {quizData.questions.length}
              </span>

              {currentIdx < quizData.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx(prev => Math.min(quizData.questions.length - 1, prev + 1))}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <span>Próxima</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => finishQuiz()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Entregar Prova</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* TELA DE RESULTADO / FEEDBACK FINAL COM TAXA DE RITMO */}
      {/* ------------------------------------------------------------------ */}
      {isFinished && quizResult && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Main Score & Metrics Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#051838] via-[#09255a] to-[#04122d] text-white shadow-xl border border-blue-900/50 space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300 block">
                  Relatório de Desempenho
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                  {quizResult.title}
                </h2>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                <span className="text-3xl font-black block leading-none">{quizResult.score}%</span>
                <span className="text-[10px] text-blue-200 uppercase font-semibold">Aproveitamento</span>
              </div>
            </div>

            {/* 4 Pillars of Performance Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-blue-300 block">Acertos</span>
                <div className="text-xl font-bold mt-0.5">
                  {quizResult.correctCount} / {quizResult.totalQuestions}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-blue-300 block">Tempo Total</span>
                <div className="text-xl font-bold mt-0.5">
                  {formatTime(quizResult.timeSpentSeconds || 0)}
                </div>
              </div>

              {/* Taxa de Questões por Minuto */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-amber-300 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Taxa de Ritmo</span>
                </span>
                <div className="text-xl font-bold text-amber-300 mt-0.5">
                  {quizResult.questionsPerMinute} q/min
                </div>
                <span className="text-[10px] text-slate-300">
                  ~{quizResult.averageSecondsPerQuestion}s por questão
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-[10px] uppercase font-bold text-purple-300 block">XP Ganho</span>
                <div className="text-xl font-bold text-purple-300 mt-0.5">
                  +{quizResult.xpEarned} XP
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setQuizData(null);
                  setIsFinished(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Configurar Novo Simulado</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSaveModalOpen(true)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 border transition-all ${
                  quizSaved
                    ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                    : 'bg-white text-slate-900 border-white hover:bg-slate-100'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${quizSaved ? 'fill-white' : ''}`} />
                <span>{quizSaved ? 'Salvo em Meus Conteúdos' : 'Salvar com Nome Personalizado'}</span>
              </button>
            </div>

          </div>

          {/* Gabarito Detalhado e Resolução Comentada Passo a Passo */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Gabarito Comentado & Análise Didática</span>
            </h3>

            <div className="space-y-4">
              {quizResult.questions.map((q, idx) => {
                const studentAns = quizResult.userAnswers[idx];
                const isCorrect = studentAns === q.correctAnswer;

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border space-y-3 ${
                      isCorrect 
                        ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20' 
                        : 'border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                        <span className="text-slate-400 mr-2">{idx + 1}.</span>
                        {q.question}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {isCorrect ? 'Correta' : 'Incorreta'}
                      </span>
                    </div>

                    {/* Alternatives overview */}
                    <div className="space-y-1.5 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isStudentChoice = studentAns === oIdx;
                        const isTheCorrect = q.correctAnswer === oIdx;

                        let style = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
                        if (isTheCorrect) {
                          style = 'border-emerald-500 bg-emerald-100/60 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 font-semibold';
                        } else if (isStudentChoice) {
                          style = 'border-red-500 bg-red-100/60 dark:bg-red-950/50 text-red-800 dark:text-red-200';
                        }

                        return (
                          <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center justify-between ${style}`}>
                            <span>{opt}</span>
                            {isTheCorrect && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-2">✓ Gabarito</span>}
                            {isStudentChoice && !isTheCorrect && <span className="text-[10px] font-bold text-red-500 ml-2">Sua Resposta</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          Resolução Comentada:
                        </span>
                        <p className="leading-relaxed whitespace-pre-line">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal para Nomear e Salvar Simulado */}
          <SaveTitleModal
            isOpen={isSaveModalOpen}
            defaultTitle={quizResult.title}
            itemTypeLabel="Simulado"
            onSave={handleConfirmSaveTitle}
            onClose={() => setIsSaveModalOpen(false)}
          />

        </div>
      )}

    </div>
  );
}
