'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Copy, 
  Check, 
  Bookmark, 
  Lightbulb, 
  Layers, 
  FileText, 
  Loader2,
  RefreshCw,
  Share2
} from 'lucide-react';
import { SubjectId, SUBJECTS, GradeLevel, GRADE_OPTIONS, UserProfile, SavedSummary } from '@/types';
import { saveSummary } from '@/lib/storage';

interface SummaryModuleProps {
  profile: UserProfile;
  selectedSubject?: SubjectId;
  onSavedSummaryAdded?: (summary: SavedSummary) => void;
}

export function SummaryModule({ profile, selectedSubject = 'matematica', onSavedSummaryAdded }: SummaryModuleProps) {
  const [subject, setSubject] = useState<SubjectId>(selectedSubject);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<SavedSummary | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const currentSubjectObj = SUBJECTS.find(s => s.id === subject) || SUBJECTS[0];
  const gradeLabel = GRADE_OPTIONS.find(g => g.id === profile.grade)?.label || 'Ensino Médio';

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setSaved(false);

    try {
      const res = await fetch('/api/gemini/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubjectObj.name,
          grade: profile.grade,
          topic: topic.trim(),
          userApiKey: profile.customGeminiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao comunicar com a IA');
      }

      const newSummary: SavedSummary = {
        id: `sum_${Date.now()}`,
        title: data.title || `Resumo de ${topic}`,
        subject,
        grade: profile.grade,
        summaryOverview: data.summaryOverview || '',
        topics: data.topics || [],
        studyTips: data.studyTips || [],
        createdAt: new Date().toISOString(),
      };

      setSummaryData(newSummary);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao gerar o resumo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!summaryData) return;
    const textToCopy = `
# ${summaryData.title}
Disciplina: ${currentSubjectObj.name} | Série: ${gradeLabel}

## Visão Geral
${summaryData.summaryOverview}

${summaryData.topics.map(t => `
### ${t.title}
${t.content}
${t.keyTerms ? `\n*Termos Chave:* ${t.keyTerms.join(', ')}` : ''}
${t.example ? `\n*Exemplo:* ${t.example}` : ''}
`).join('\n')}

## Dicas de Estudo
${summaryData.studyTips.map(tip => `- ${tip}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSummary = () => {
    if (!summaryData) return;
    saveSummary(summaryData);
    if (onSavedSummaryAdded) onSavedSummaryAdded(summaryData);
    setSaved(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Module Title Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gerador Didático IA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Resumos Estruturados por Matéria</h1>
            <p className="text-sm text-brand-100 mt-1 max-w-xl">
              Gere resumos completos adaptados ao nível do <span className="font-bold underline">{gradeLabel}</span> com tópicos, conceitos-chave, exemplos e dicas de prova.
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

      {/* Input Generator Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Qual tema ou conceito você quer estudar em {currentSubjectObj.name}?
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={`Ex: ${subject === 'matematica' ? 'Equações do 2º Grau' : subject === 'historia' ? 'Revolução Industrial' : 'Conceitos de Fisiologia e Célula'}`}
                className="w-full pl-4 pr-32 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow flex items-center space-x-1.5 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Resumo</span>
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

      {/* Result Display */}
      {summaryData && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6 animate-in fade-in">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                {currentSubjectObj.name} • {gradeLabel}
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {summaryData.title}
              </h2>
            </div>

            <div className="flex space-x-2 w-full sm:w-auto">
              <button
                onClick={handleCopyText}
                className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center justify-center space-x-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>

              <button
                onClick={handleSaveSummary}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  saved 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                    : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md'
                }`}
              >
                {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Salvo no Histórico' : 'Salvar Resumo'}</span>
              </button>
            </div>
          </div>

          {/* Visão Geral */}
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2 mb-2">
              <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Visão Geral do Assunto</span>
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {summaryData.summaryOverview}
            </p>
          </div>

          {/* Tópicos Detalhados */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Tópicos & Conceitos-Chave</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {summaryData.topics.map((tp, idx) => (
                <div 
                  key={idx}
                  className="p-5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3 hover:shadow-md transition-shadow"
                >
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{tp.title}</span>
                  </h4>

                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {tp.content}
                  </p>

                  {tp.keyTerms && tp.keyTerms.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs font-semibold text-slate-400 mr-1">Termos:</span>
                      {tp.keyTerms.map((term, tIdx) => (
                        <span 
                          key={tIdx} 
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  )}

                  {tp.example && (
                    <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 font-medium">
                      <span className="font-bold text-amber-700 dark:text-amber-400">Exemplo Prático: </span>
                      {tp.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dicas de Estudo & Prova */}
          {summaryData.studyTips && summaryData.studyTips.length > 0 && (
            <div className="p-5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-2">
              <h3 className="text-sm font-bold text-purple-900 dark:text-purple-200 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Dicas de Estudo & Foco em Provas</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-purple-800 dark:text-purple-300 list-disc pl-5">
                {summaryData.studyTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
