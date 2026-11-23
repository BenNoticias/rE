'use client';

import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Check,
  Share2,
  Award,
  Clock,
  BookOpen,
  Network,
  CheckCircle2,
  XCircle,
  Calendar,
  Lightbulb,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronRight,
  Info,
  Timer,
  Zap,
  Flame,
  FileText,
  Target,
  BrainCircuit,
  GraduationCap
} from 'lucide-react';
import { UnifiedHistoryItem, MindmapNode, SUBJECTS, GRADE_OPTIONS } from '@/types';

interface HistoryViewerModalProps {
  item: UnifiedHistoryItem | null;
  onClose: () => void;
  onToggleSaved: (item: UnifiedHistoryItem) => void;
}

export function HistoryViewerModal({ item, onClose, onToggleSaved }: HistoryViewerModalProps) {
  const [copied, setCopied] = useState(false);

  // Estados para Mapa Mental
  const [mindmapZoom, setMindmapZoom] = useState(1);
  const [mindmapViewMode, setMindmapViewMode] = useState<'hierarchy' | 'graph'>('hierarchy');
  const [selectedMindmapNode, setSelectedMindmapNode] = useState<MindmapNode | null>(null);
  const [expandedMindmapNodes, setExpandedMindmapNodes] = useState<Record<string, boolean>>({});

  // Estados para Cronograma
  const [activeScheduleDayIdx, setActiveScheduleDayIdx] = useState(0);

  if (!item) return null;

  const handleCopy = () => {
    let text = `${item.title}\n\n`;

    if (item.type === 'summary') {
      const s = item.data;
      text += `VISÃO GERAL:\n${s.summaryOverview}\n\n`;
      s.topics?.forEach((t: any) => {
        text += `### ${t.title}\n${t.content}\n`;
        if (t.keyTerms?.length) text += `Termos-chave: ${t.keyTerms.join(', ')}\n`;
        if (t.example) text += `Exemplo: ${t.example}\n`;
        text += '\n';
      });
      if (s.studyTips?.length) {
        text += `DICAS DE ESTUDO:\n${s.studyTips.map((tip: string) => `- ${tip}`).join('\n')}\n`;
      }
    } else if (item.type === 'essay') {
      const e = item.data;
      text += `Nota Final: ${e.finalScore}/${e.maxScore} (${e.assessmentLevel})\n\n`;
      text += `TEXTO:\n${e.essayText}\n\n`;
      text += `PARECER DA BANCA:\n${e.generalFeedback}\n\n`;
      text += `COMPETÊNCIAS:\n${e.competencies?.map((c: any) => `- ${c.name}: ${c.score}/${c.maxScore} pts - ${c.feedback}`).join('\n')}\n`;
    } else if (item.type === 'quiz') {
      const q = item.data;
      text += `Pontuação: ${q.score}% (${q.correctCount}/${q.totalQuestions} acertos)\n`;
      if (q.questionsPerMinute) text += `Ritmo: ${q.questionsPerMinute} questões/min\n`;
      text += '\n';
      q.questions?.forEach((qu: any, idx: number) => {
        text += `Questão ${idx + 1}: ${qu.question}\n`;
        qu.options?.forEach((opt: string, optIdx: number) => {
          const isCorrect = qu.correctAnswer === optIdx;
          text += `  ${isCorrect ? '[CORRETA] ' : '  '}${opt}\n`;
        });
        text += `Gabarito Comentado: ${qu.explanation}\n\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleMindmapExpand = (id: string) => {
    setExpandedMindmapNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Níveis hierárquicos do Mapa Mental
  const mindmapNodes: MindmapNode[] = item.type === 'mindmap' && item.data?.nodes ? item.data.nodes : [];
  const rootNode = mindmapNodes.find(n => n.type === 'root');
  const mainNodes = mindmapNodes.filter(n => n.type === 'main');
  const activeSelectedNode = selectedMindmapNode || rootNode || mindmapNodes[0] || null;

  const getSubNodes = (mainId: string) => {
    return mindmapNodes.filter(n => n.parentId === mainId || (n.type === 'sub' && !n.parentId));
  };

  const getDetailNodes = (subId: string) => {
    return mindmapNodes.filter(n => n.parentId === subId || (n.type === 'detail' && !n.parentId));
  };

  const getNodeBadge = (type?: string, level?: number) => {
    switch (type) {
      case 'root':
        return { label: 'Tema Central', bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
      case 'main':
        return { label: 'Eixo Principal', bg: 'bg-purple-500/10 text-purple-500 border-purple-500/20' };
      case 'sub':
        return { label: 'Subtópico', bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
      case 'detail':
        return { label: 'Exemplo & Aplicação', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20' };
      default:
        return { label: `Nível ${level ?? 1}`, bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-850">
          <div className="flex items-center space-x-3 min-w-0 pr-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
              {item.type === 'summary' && <BookOpen className="w-5 h-5" />}
              {item.type === 'mindmap' && <Network className="w-5 h-5" />}
              {item.type === 'quiz' && <CheckCircle2 className="w-5 h-5" />}
              {item.type === 'essay' && <Award className="w-5 h-5" />}
              {item.type === 'schedule' && <Calendar className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 block">
                {item.type === 'summary' && 'Resumo Didático Completo'}
                {item.type === 'mindmap' && 'Mapa Mental Multinível'}
                {item.type === 'quiz' && 'Simulado & Gabarito Comentado'}
                {item.type === 'essay' && 'Correção Oficial de Redação'}
                {item.type === 'schedule' && 'Cronograma de Estudos'}
              </span>
              <h2 className="text-base font-black text-slate-900 dark:text-slate-100 truncate">
                {item.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Toggle Saved */}
            <button
              onClick={() => onToggleSaved(item)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all border ${item.isSaved
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              title={item.isSaved ? 'Remover dos Salvos' : 'Salvar nos Meus Conteúdos'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${item.isSaved ? 'fill-white' : ''}`} />
              <span className="hidden sm:inline">{item.isSaved ? 'Salvo' : 'Salvar'}</span>
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Copiar Conteúdo em Texto"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Time & Metadata Pill */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Registrado em {new Date(item.createdAt).toLocaleString('pt-BR')}</span>
            </span>

            <div className="flex items-center space-x-2">
              {item.subject && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                  {SUBJECTS.find(s => s.id === item.subject)?.name || item.subject}
                </span>
              )}
              {item.grade && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                  {GRADE_OPTIONS.find(g => g.id === item.grade)?.label || item.grade}
                </span>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 1. MAPA MENTAL MULTINÍVEL COMPLETO (IDENTICAL TO ORIGINAL) */}
          {/* ========================================================================= */}
          {item.type === 'mindmap' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
              {/* Visualizer Canvas (2 Cols) */}
              <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative min-h-[460px] flex flex-col justify-between overflow-hidden">
                {/* Visualizer Toolbar */}
                <div className="flex flex-wrap items-center justify-between z-10 bg-slate-800/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-700/80 mb-3 gap-2">
                  <div className="flex rounded-xl bg-slate-700/60 p-0.5 border border-slate-600">
                    <button
                      onClick={() => setMindmapViewMode('hierarchy')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${mindmapViewMode === 'hierarchy' ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:text-white'
                        }`}
                    >
                      Árvore Multinível
                    </button>
                    <button
                      onClick={() => setMindmapViewMode('graph')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${mindmapViewMode === 'graph' ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:text-white'
                        }`}
                    >
                      Grafo Conectado
                    </button>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setMindmapZoom(prev => Math.max(0.7, prev - 0.1))}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs"
                      title="Diminuir Zoom"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-300 font-mono px-1">
                      {Math.round(mindmapZoom * 100)}%
                    </span>
                    <button
                      onClick={() => setMindmapZoom(prev => Math.min(1.4, prev + 0.1))}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs"
                      title="Aumentar Zoom"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tree View */}
                {mindmapViewMode === 'hierarchy' ? (
                  <div
                    className="flex-1 overflow-y-auto max-h-[500px] p-2 space-y-4 transition-transform duration-200"
                    style={{ transform: `scale(${mindmapZoom})`, transformOrigin: 'top left' }}
                  >
                    {/* Root Node */}
                    {rootNode && (
                      <div
                        onClick={() => setSelectedMindmapNode(rootNode)}
                        className={`p-4 rounded-2xl cursor-pointer text-center transition-all border-2 shadow-xl ${activeSelectedNode?.id === rootNode.id
                            ? 'border-white ring-4 ring-blue-500/50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                            : 'border-blue-500/80 bg-blue-600/90 text-white hover:bg-blue-600'
                          }`}
                      >
                        <span className="text-[10px] uppercase font-black tracking-widest text-blue-200 block mb-1">
                          Conceito Central (Nível 0)
                        </span>
                        <h3 className="text-xl font-black">{rootNode.label}</h3>
                        <p className="text-xs text-blue-100 mt-1 max-w-md mx-auto line-clamp-2">
                          {rootNode.description}
                        </p>
                      </div>
                    )}

                    {/* Main Branches */}
                    <div className="space-y-3 pl-3 border-l-2 border-purple-500/40">
                      {mainNodes.map((mainNode, mIdx) => {
                        const isSelected = activeSelectedNode?.id === mainNode.id;
                        const isExpanded = expandedMindmapNodes[mainNode.id] !== false;
                        const subNodes = getSubNodes(mainNode.id);

                        return (
                          <div key={mainNode.id} className="space-y-2.5">
                            <div
                              onClick={() => setSelectedMindmapNode(mainNode)}
                              className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${isSelected
                                  ? 'border-purple-400 bg-purple-900/80 text-white shadow-lg ring-2 ring-purple-400/40'
                                  : 'border-slate-700 bg-slate-800/90 text-slate-200 hover:border-slate-500'
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleMindmapExpand(mainNode.id);
                                    }}
                                    className="p-1 hover:bg-slate-700 rounded-lg text-slate-400"
                                  >
                                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </button>
                                  <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    Eixo {mIdx + 1}
                                  </span>
                                  <h4 className="text-sm font-bold text-white">{mainNode.label}</h4>
                                </div>
                                <span className="text-[11px] text-slate-400 font-semibold">
                                  {subNodes.length} subtópicos
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1 pl-6 line-clamp-2">
                                {mainNode.description}
                              </p>
                            </div>

                            {/* Sub Nodes */}
                            {isExpanded && subNodes.length > 0 && (
                              <div className="pl-6 space-y-2 border-l-2 border-emerald-500/30 ml-3">
                                {subNodes.map((subNode) => {
                                  const isSubSelected = activeSelectedNode?.id === subNode.id;
                                  const detailNodes = getDetailNodes(subNode.id);

                                  return (
                                    <div key={subNode.id} className="space-y-2">
                                      <div
                                        onClick={() => setSelectedMindmapNode(subNode)}
                                        className={`p-2.5 rounded-xl cursor-pointer transition-all border ${isSubSelected
                                            ? 'border-emerald-400 bg-emerald-950/80 text-white shadow-md ring-2 ring-emerald-400/30'
                                            : 'border-slate-700/80 bg-slate-850 text-slate-200 hover:border-slate-600'
                                          }`}
                                      >
                                        <div className="flex items-center justify-between mb-0.5">
                                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                            Subtópico
                                          </span>
                                        </div>
                                        <h5 className="text-xs font-bold text-white">{subNode.label}</h5>
                                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                                          {subNode.description}
                                        </p>
                                      </div>

                                      {/* Detail Nodes */}
                                      {detailNodes.length > 0 && (
                                        <div className="pl-4 space-y-1.5 border-l-2 border-amber-500/30 ml-2">
                                          {detailNodes.map((det) => {
                                            const isDetSelected = activeSelectedNode?.id === det.id;
                                            return (
                                              <div
                                                key={det.id}
                                                onClick={() => setSelectedMindmapNode(det)}
                                                className={`p-2 rounded-lg cursor-pointer transition-all border ${isDetSelected
                                                    ? 'border-amber-400 bg-amber-950/80 text-white shadow'
                                                    : 'border-slate-750 bg-slate-800/60 text-slate-300 hover:border-amber-500/50'
                                                  }`}
                                              >
                                                <span className="text-[10px] font-bold text-amber-300 block">
                                                  {det.label}
                                                </span>
                                                <p className="text-[11px] text-slate-400 line-clamp-2">
                                                  {det.description}
                                                </p>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Graph Grid Mode */
                  <div
                    className="flex-1 overflow-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
                    style={{ transform: `scale(${mindmapZoom})`, transformOrigin: 'top left' }}
                  >
                    {mindmapNodes.map((node) => {
                      const isSelected = activeSelectedNode?.id === node.id;
                      const badge = getNodeBadge(node.type, node.level);
                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedMindmapNode(node)}
                          className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${isSelected
                              ? 'border-purple-400 bg-purple-900/80 text-white shadow-xl ring-2 ring-purple-400/40'
                              : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-500'
                            }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                              {badge.label}
                            </span>
                            <Info className="w-3.5 h-3.5 opacity-60" />
                          </div>
                          <h4 className="text-xs font-bold text-white">{node.label}</h4>
                          {node.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                              {node.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                  Clique em qualquer nó acima para carregar a explicação didática no painel ao lado.
                </div>
              </div>

              {/* Node Details Sidebar (1 Col) */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                    <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      Explicação Didática do Nó
                    </h3>
                  </div>

                  {activeSelectedNode ? (
                    <div className="space-y-4 animate-in fade-in">
                      <div>
                        {(() => {
                          const badge = getNodeBadge(activeSelectedNode.type, activeSelectedNode.level);
                          return (
                            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
                        <h4 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-1">
                          {activeSelectedNode.label}
                        </h4>
                      </div>

                      <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/60 space-y-2">
                        <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block">
                          Fundamentação Pedagógica:
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {activeSelectedNode.description || 'Conceito essencial mapeado no estudo desta disciplina.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Selecione um nó para visualizar o detalhamento.
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Conexões Mapeadas: </span>
                  {mindmapNodes.length} nós conceituais salvos.
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. RESUMO DIDÁTICO ESTRUTURADO (IDENTICAL TO ORIGINAL) */}
          {/* ========================================================================= */}
          {item.type === 'summary' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Visão Geral */}
              <div className="p-5 rounded-3xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center space-x-1.5">
                  <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Visão Geral do Assunto</span>
                </span>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                  {item.data?.summaryOverview}
                </p>
              </div>

              {/* Tópicos */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Tópicos Estruturados e Explicações
                </h3>
                {item.data?.topics?.map((topic: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
                  >
                    <h4 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <span>{topic.title}</span>
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {topic.content}
                    </p>

                    {topic.keyTerms && topic.keyTerms.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-xs font-semibold text-slate-500 mr-1">Termos-chave:</span>
                        {topic.keyTerms.map((term: string, tIdx: number) => (
                          <span
                            key={tIdx}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold border border-slate-200 dark:border-slate-600 shadow-sm"
                          >
                            {term}
                          </span>
                        ))}
                      </div>
                    )}

                    {topic.example && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300">
                        <span className="font-bold">Exemplo Prático / Cotidiano: </span>
                        {topic.example}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Dicas de Estudo */}
              {item.data?.studyTips && item.data.studyTips.length > 0 && (
                <div className="p-5 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dicas Pedagógicas de Fixação & Provas</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {item.data.studyTips.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. SIMULADO & GABARITO COMENTADO (IDENTICAL TO ORIGINAL) */}
          {/* ========================================================================= */}
          {item.type === 'quiz' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Performance 4 Pillars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block mb-1">
                    Aproveitamento
                  </span>
                  <span className="text-2xl font-black text-blue-700 dark:text-blue-300">
                    {item.data?.score}%
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {item.data?.correctCount} de {item.data?.totalQuestions} questões
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-1">
                    XP Conquistado
                  </span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center justify-center space-x-1">
                    <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
                    <span>+{item.data?.xpEarned || 100}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Pontos de experiência</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-center">
                  <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 block mb-1">
                    Tempo de Prova
                  </span>
                  <span className="text-2xl font-black text-purple-700 dark:text-purple-300 flex items-center justify-center space-x-1">
                    <Timer className="w-5 h-5" />
                    <span>
                      {item.data?.timeSpentSeconds
                        ? `${Math.floor(item.data.timeSpentSeconds / 60)}m ${item.data.timeSpentSeconds % 60}s`
                        : 'Finalizado'}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {item.data?.timeMode === 'stopwatch' ? 'Cronômetro' : 'Timer Oficial'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    Taxa de Ritmo
                  </span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center space-x-1">
                    <Zap className="w-5 h-5 fill-emerald-500" />
                    <span>{item.data?.questionsPerMinute || '0.8'}</span>
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {item.data?.averageSecondsPerQuestion ? `~${item.data.averageSecondsPerQuestion}s por questão` : 'questões por minuto'}
                  </span>
                </div>
              </div>

              {/* Questions Index Grid */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                  Mapa de Questões ({item.data?.totalQuestions || item.data?.questions?.length || 0}):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {item.data?.questions?.map((_: any, idx: number) => {
                    const studentAns = item.data?.userAnswers?.[idx];
                    const isCorrect = studentAns === _?.correctAnswer;
                    return (
                      <span
                        key={idx}
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center border shadow-sm ${isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : 'bg-red-500 text-white border-red-600'
                          }`}
                      >
                        {idx + 1}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Questions Detailed List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Gabarito Detalhado e Resoluções Comentadas
                </h3>

                {item.data?.questions?.map((q: any, idx: number) => {
                  const studentAns = item.data?.userAnswers?.[idx];
                  const isCorrect = studentAns === q.correctAnswer;

                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-3xl border space-y-3.5 ${isCorrect
                          ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
                          : 'border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                          <span className="text-slate-400 mr-2 font-mono">{idx + 1}.</span>
                          {q.question}
                        </h4>
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          }`}>
                          {isCorrect ? 'Acertou' : 'Errou'}
                        </span>
                      </div>

                      {/* Alternatives A-E */}
                      <div className="space-y-2 text-xs">
                        {q.options?.map((opt: string, oIdx: number) => {
                          const isStudentChoice = studentAns === oIdx;
                          const isTheCorrect = q.correctAnswer === oIdx;

                          let optionClass = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
                          if (isTheCorrect) {
                            optionClass = 'border-emerald-500 bg-emerald-100/60 dark:bg-emerald-950/40 font-semibold text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500/30';
                          } else if (isStudentChoice) {
                            optionClass = 'border-red-500 bg-red-100/60 dark:bg-red-950/40 text-red-800 dark:text-red-200 ring-1 ring-red-500/30';
                          }

                          return (
                            <div key={oIdx} className={`p-3 rounded-2xl border flex items-center justify-between ${optionClass}`}>
                              <span>{opt}</span>
                              {isTheCorrect && <span className="text-[10px] font-bold text-emerald-600 ml-2">✓ Gabarito Oficial</span>}
                              {isStudentChoice && !isTheCorrect && <span className="text-[10px] font-bold text-red-500 ml-2">Sua Marcação</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Commented Step-by-Step Explanation */}
                      {q.explanation && (
                        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1.5 border border-slate-200 dark:border-slate-700">
                          <span className="font-bold block text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                            <BrainCircuit className="w-4 h-4 text-brand-600" />
                            <span>Resolução Pedagógica Passo a Passo:</span>
                          </span>
                          <p className="leading-relaxed whitespace-pre-line font-medium">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. REDAÇÃO & PARECER DE COMPETÊNCIAS (IDENTICAL TO ORIGINAL) */}
          {/* ========================================================================= */}
          {item.type === 'essay' && (
            <div className="space-y-6 animate-in fade-in">
              {/* Score Card Hero */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white flex flex-wrap items-center justify-between gap-4 border border-indigo-900/50 shadow-xl">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                    Banca {item.data?.examModel?.toUpperCase()} • {item.data?.assessmentLevel}
                  </span>
                  <div className="text-4xl font-black mt-1">
                    {item.data?.finalScore} <span className="text-lg font-normal text-indigo-300">/ {item.data?.maxScore}</span>
                  </div>
                </div>
                <div className="max-w-md text-xs text-indigo-200 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <span className="font-bold block mb-1 text-white">Tema da Proposta:</span>
                  {item.data?.theme}
                </div>
              </div>

              {/* General Feedback */}
              <div className="p-5 rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center space-x-1.5">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  <span>Parecer Geral da Banca Avaliadora</span>
                </span>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {item.data?.generalFeedback}
                </p>
              </div>

              {/* Student Full Essay */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Texto Integral Redigido pelo Estudante
                </h4>
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 font-serif text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line shadow-inner">
                  {item.data?.essayText}
                </div>
              </div>

              {/* Competencies C1-C5 */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Avaliação por Competências Oficiais ({item.data?.competencies?.length || 5})
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {item.data?.competencies?.map((comp: any, idx: number) => {
                    const percentage = Math.round((comp.score / comp.maxScore) * 100);
                    return (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-slate-100">{comp.name}</span>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                            {comp.score} / {comp.maxScore} pts ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          {comp.feedback}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Pontos Fortes Demonstrados</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {item.data?.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span>Oportunidades de Melhoria Textual</span>
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {item.data?.improvements?.map((imp: string, i: number) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. CRONOGRAMA SEMANAL (IDENTICAL TO ORIGINAL) */}
          {/* ========================================================================= */}
          {item.type === 'schedule' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Day Tabs */}
              {item.data?.weeklyPlan && (
                <>
                  <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100 dark:border-slate-800">
                    {item.data.weeklyPlan.map((day: any, dIdx: number) => (
                      <button
                        key={dIdx}
                        onClick={() => setActiveScheduleDayIdx(dIdx)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeScheduleDayIdx === dIdx
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                          }`}
                      >
                        {day.dayName}
                      </button>
                    ))}
                  </div>

                  {item.data.weeklyPlan[activeScheduleDayIdx] && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span>Metas de {item.data.weeklyPlan[activeScheduleDayIdx].dayName}:</span>
                      </h4>

                      {item.data.weeklyPlan[activeScheduleDayIdx].subjects?.map((sub: any, sIdx: number) => (
                        <div key={sIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{sub.subject}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {sub.duration}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{sub.topic}</p>
                          {sub.technique && (
                            <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 text-xs text-indigo-900 dark:text-indigo-200 font-medium flex items-center space-x-2">
                              <BrainCircuit className="w-4 h-4 text-indigo-600 shrink-0" />
                              <span><strong>Técnica: </strong>{sub.technique}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50/80 dark:bg-slate-850">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
