'use client';

import React, { useState, useEffect } from 'react';
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
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubjectId, SUBJECTS, UserProfile, QuizQuestion, QuizResult } from '@/types';
import { saveQuizResult, updateUserXP } from '@/lib/storage';

interface QuizModuleProps {
  profile: UserProfile;
  selectedSubject?: SubjectId;
  onProfileUpdated?: (updated: UserProfile) => void;
  onQuizCompleted?: (result: QuizResult) => void;
}

export function QuizModule({ profile, selectedSubject = 'matematica', onProfileUpdated, onQuizCompleted }: QuizModuleProps) {
  const [subject, setSubject] = useState<SubjectId>(selectedSubject);
  const [topic, setTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<{ title: string; questions: QuizQuestion[] } | null>(null);
  
  // State during exam
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min default
  const [isFinished, setIsFinished] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState('');

  const currentSubjectObj = SUBJECTS.find(s => s.id === subject) || SUBJECTS[0];

  // Timer Countdown
  useEffect(() => {
    if (!quizData || isFinished || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quizData, isFinished, timerSeconds]);

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsFinished(false);
    setQuizResult(null);

    try {
      const res = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubjectObj.name,
          grade: profile.grade,
          topic: topic.trim(),
          questionCount,
          userApiKey: profile.customGeminiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Erro ao carregar o simulado.');
      }

      setQuizData({
        title: data.title || `Simulado de ${currentSubjectObj.name}`,
        questions: data.questions || [],
      });

      setSelectedAnswers(new Array(data.questions.length).fill(-1));
      setCurrentIdx(0);
      setTimerSeconds(questionCount * 60); // 1 minute per question
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar o simulado com a IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIdx: number) => {
    if (isFinished) return;
    const updated = [...selectedAnswers];
    updated[currentIdx] = optionIdx;
    setSelectedAnswers(updated);
  };

  const finishQuiz = () => {
    if (!quizData) return;

    let correct = 0;
    quizData.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct += 1;
      }
    });

    const total = quizData.questions.length;
    const scorePercentage = Math.round((correct / total) * 100);
    const xpEarned = correct * 30 + 50; // base + per correct

    const result: QuizResult = {
      id: `quiz_${Date.now()}`,
      title: quizData.title,
      subject,
      grade: profile.grade,
      questions: quizData.questions,
      userAnswers: selectedAnswers,
      score: scorePercentage,
      correctCount: correct,
      totalQuestions: total,
      xpEarned,
      createdAt: new Date().toISOString(),
    };

    setIsFinished(true);
    setQuizResult(result);
    saveQuizResult(result);
    
    // Update User XP & Level
    const updatedProfile = updateUserXP(xpEarned);
    if (onProfileUpdated) onProfileUpdated(updatedProfile);
    if (onQuizCompleted) onQuizCompleted(result);

    // Confetti effect if score >= 60%
    if (scorePercentage >= 60) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Simulados & Gamificação</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Simulados Gamificados com Correção IA</h1>
            <p className="text-sm text-teal-100 mt-1 max-w-xl">
              Pratique com questões adaptadas, acompanhe seu tempo, ganhe XP e suba na classificação do Ranking.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as SubjectId)}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm border border-white/20 focus:outline-none cursor-pointer"
            >
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id} className="text-slate-900 bg-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Start Config Form */}
      {!quizData && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <form onSubmit={handleStartQuiz} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Assunto Específico do Simulado (Opcional):
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={`Ex: Geral de ${currentSubjectObj.name}, Fórmulas ou Tópicos do ENEM`}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantidade de Questões:
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value={3}>3 Questões (Rápido)</option>
                  <option value={5}>5 Questões (Padrão)</option>
                  <option value={10}>10 Questões (Completo)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gerando Questões...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Iniciar Simulado</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Active Exam Mode */}
      {quizData && !isFinished && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in">
          
          {/* Header Bar with Timer & Progress */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Questão {currentIdx + 1} de {quizData.questions.length}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {quizData.title}
              </h2>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold font-mono">
              <Clock className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>{formatTime(timerSeconds)}</span>
            </div>
          </div>

          {/* Question Box */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {quizData.questions[currentIdx].question}
              </p>
            </div>

            {/* Options List */}
            <div className="space-y-2.5">
              {quizData.questions[currentIdx].options.map((optionText, oIdx) => {
                const isSelected = selectedAnswers[currentIdx] === oIdx;
                const optionLetters = ['A', 'B', 'C', 'D', 'E'];
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30 font-semibold shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {optionLetters[oIdx]}
                      </span>
                      <span className="text-sm">{optionText}</span>
                    </div>

                    {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {currentIdx < quizData.questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(prev => Math.min(quizData.questions.length - 1, prev + 1))}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow"
              >
                <span>Próxima</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={finishQuiz}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30"
              >
                <span>Finalizar Simulado</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}

      {/* Finished Summary & Gabarito Comentado */}
      {isFinished && quizResult && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 animate-in fade-in">
          
          {/* Result Score Card */}
          <div className="text-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Trophy className="w-8 h-8" />
            </div>
            
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              Simulado Concluído!
            </h2>

            <div className="flex items-center justify-center space-x-6 pt-2">
              <div>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {quizResult.score}%
                </span>
                <span className="block text-[11px] text-slate-400 uppercase font-semibold">Nota Final</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {quizResult.correctCount} / {quizResult.totalQuestions}
                </span>
                <span className="block text-[11px] text-slate-400 uppercase font-semibold">Acertos</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
              <div>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  +{quizResult.xpEarned} XP
                </span>
                <span className="block text-[11px] text-slate-400 uppercase font-semibold">Recompensa</span>
              </div>
            </div>

            <button
              onClick={() => {
                setQuizData(null);
                setIsFinished(false);
              }}
              className="mt-4 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Fazer Outro Simulado</span>
            </button>
          </div>

          {/* Gabarito Comentado pela IA */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Gabarito Comentado & Resolução Detalhada</span>
            </h3>

            <div className="space-y-4">
              {quizResult.questions.map((q, idx) => {
                const userAnswer = quizResult.userAnswers[idx];
                const isCorrect = userAnswer === q.correctAnswer;

                return (
                  <div 
                    key={idx}
                    className={`p-5 rounded-xl border space-y-3 ${
                      isCorrect 
                        ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20' 
                        : 'border-red-200 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-start space-x-2">
                        <span className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                          isCorrect ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        <span>{q.question}</span>
                      </h4>

                      {isCorrect ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center space-x-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correta</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 flex items-center space-x-1 shrink-0">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Incorreta</span>
                        </span>
                      )}
                    </div>

                    {/* Alternatives overview */}
                    <div className="space-y-1.5 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isSelectedByStudent = userAnswer === oIdx;
                        const isTheCorrectOption = q.correctAnswer === oIdx;

                        return (
                          <div 
                            key={oIdx}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${
                              isTheCorrectOption
                                ? 'bg-emerald-100/80 dark:bg-emerald-950/80 border-emerald-300 text-emerald-900 dark:text-emerald-200 font-bold'
                                : isSelectedByStudent
                                ? 'bg-red-100/80 dark:bg-red-950/80 border-red-300 text-red-900 dark:text-red-200 font-medium'
                                : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span>{opt}</span>
                            {isTheCorrectOption && <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">(Gabarito)</span>}
                            {isSelectedByStudent && !isTheCorrectOption && <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400">(Sua Resposta)</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* AI Explanation Box */}
                    <div className="p-3.5 rounded-lg bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                      <span className="font-bold text-brand-600 dark:text-brand-400 flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Explicação Didática da IA:</span>
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {q.explanation}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
