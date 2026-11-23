'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Loader2, 
  Bookmark, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Info,
  GitBranch,
  Layers,
  ChevronRight,
  ChevronDown,
  BookOpen,
  HelpCircle,
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { SubjectId, SUBJECTS, UserProfile, SavedMindmap, MindmapNode } from '@/types';
import { saveMindmap } from '@/lib/storage';
import { SaveTitleModal } from '@/components/SaveTitleModal';

interface MindmapModuleProps {
  profile: UserProfile;
  selectedSubject?: SubjectId;
  onSavedMindmapAdded?: (mindmap: SavedMindmap) => void;
}

export function MindmapModule({ profile, selectedSubject = 'matematica', onSavedMindmapAdded }: MindmapModuleProps) {
  const [subject, setSubject] = useState<SubjectId>(selectedSubject);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [mindmapData, setMindmapData] = useState<SavedMindmap | null>(null);
  const [selectedNode, setSelectedNode] = useState<MindmapNode | null>(null);
  const [saved, setSaved] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [error, setError] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'graph'>('hierarchy');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const currentSubjectObj = SUBJECTS.find(s => s.id === subject) || SUBJECTS[0];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setSaved(false);
    setSelectedNode(null);

    try {
      const res = await fetch('/api/gemini/mindmap', {
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
        throw new Error(data.error || 'Erro ao gerar o mapa mental.');
      }

      const newMindmap: SavedMindmap = {
        id: `map_${Date.now()}`,
        title: data.title || `Mapa Mental: ${topic}`,
        subject,
        grade: profile.grade,
        nodes: data.nodes || [],
        edges: data.edges || [],
        createdAt: new Date().toISOString(),
        isSaved: false,
      };

      setMindmapData(newMindmap);
      // Registro automático obrigatório no histórico (v0.8)
      saveMindmap(newMindmap, false);
      setSaved(false);

      // Auto expandir nós principais
      const initialExpanded: Record<string, boolean> = {};
      newMindmap.nodes.forEach(n => {
        initialExpanded[n.id] = true;
      });
      setExpandedNodes(initialExpanded);

      if (newMindmap.nodes.length > 0) {
        setSelectedNode(newMindmap.nodes[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao processar mapa mental com IA.');
    } finally {
      setLoading(false);
    }
  };

  const confirmSaveMindmap = (customTitle: string) => {
    if (!mindmapData) return;
    const updatedMap: SavedMindmap = { 
      ...mindmapData, 
      title: customTitle,
      customTitle: customTitle,
      isSaved: true 
    };
    saveMindmap(updatedMap, true);
    setMindmapData(updatedMap);
    if (onSavedMindmapAdded) onSavedMindmapAdded(updatedMap);
    setSaved(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Níveis hierárquicos
  const rootNode = mindmapData?.nodes.find(n => n.type === 'root');
  const mainNodes = mindmapData?.nodes.filter(n => n.type === 'main') || [];

  const getSubNodes = (mainId: string) => {
    return (mindmapData?.nodes || []).filter(
      n => n.parentId === mainId || (n.type === 'sub' && !n.parentId)
    );
  };

  const getDetailNodes = (subId: string) => {
    return (mindmapData?.nodes || []).filter(
      n => n.parentId === subId || (n.type === 'detail' && !n.parentId)
    );
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
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Mapas Mentais Multinível v0.10</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Mapas Mentais Profundos por IA</h1>
            <p className="text-sm text-purple-100 mt-1 max-w-xl">
              Navegue por ramificações completas em 4 níveis (Tema Central → Eixos Principais → Subtópicos → Exemplos Práticos).
            </p>
          </div>

          <div className="w-full md:w-auto">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as SubjectId)}
              className="w-full md:w-auto px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-sm border border-white/20 focus:outline-none cursor-pointer"
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

      {/* Generator Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Tema do Mapa Mental em {currentSubjectObj.name}:
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Teorema de Pitágoras, Termodinâmica, Revolução Francesa, Funções Inorgânicas..."
                className="w-full pl-4 pr-36 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mapeando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Mapear Tema</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Visual Canvas Display */}
      {mindmapData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          
          {/* Main Visualizer (2 Cols) */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative min-h-[500px] flex flex-col justify-between overflow-hidden">
            
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between z-10 bg-slate-800/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700/80 mb-4 gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white px-2.5 py-1 rounded-xl bg-purple-600/60 border border-purple-500/40">
                  {mindmapData.customTitle || mindmapData.title}
                </span>
                <div className="flex rounded-xl bg-slate-700/60 p-0.5 border border-slate-600">
                  <button
                    onClick={() => setViewMode('hierarchy')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      viewMode === 'hierarchy' ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Árvore Multinível
                  </button>
                  <button
                    onClick={() => setViewMode('graph')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      viewMode === 'graph' ? 'bg-purple-600 text-white shadow' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Grafo Conectado
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs"
                  title="Diminuir Zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-300 font-mono px-1">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsSaveModalOpen(true)}
                  className={`ml-2 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors ${
                    saved ? 'bg-emerald-600 text-white' : 'bg-brand-600 hover:bg-brand-500 text-white'
                  }`}
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{saved ? 'Salvo' : 'Salvar'}</span>
                </button>
              </div>
            </div>

            {/* Hierarchical Tree Render Mode */}
            {viewMode === 'hierarchy' ? (
              <div 
                className="flex-1 overflow-y-auto max-h-[560px] p-2 space-y-4 transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
              >
                {/* Level 0: Root */}
                {rootNode && (
                  <div
                    onClick={() => setSelectedNode(rootNode)}
                    className={`p-4 rounded-2xl cursor-pointer text-center transition-all border-2 shadow-xl ${
                      selectedNode?.id === rootNode.id
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

                {/* Level 1: Main Branches */}
                <div className="space-y-4 pl-3 border-l-2 border-purple-500/40">
                  {mainNodes.map((mainNode, mIdx) => {
                    const isSelected = selectedNode?.id === mainNode.id;
                    const isExpanded = expandedNodes[mainNode.id] !== false;
                    const subNodes = getSubNodes(mainNode.id);

                    return (
                      <div key={mainNode.id} className="space-y-3">
                        {/* Main Node Card */}
                        <div
                          onClick={() => setSelectedNode(mainNode)}
                          className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                            isSelected
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
                                  toggleExpand(mainNode.id);
                                }}
                                className="p-1 hover:bg-slate-700 rounded-lg text-slate-400"
                              >
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>
                              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Eixo {mIdx + 1}
                              </span>
                              <h4 className="text-sm font-bold text-white">{mainNode.label}</h4>
                            </div>
                            <span className="text-[11px] text-slate-400 font-semibold">
                              {subNodes.length} subtópicos
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 mt-1.5 pl-6 line-clamp-2">
                            {mainNode.description}
                          </p>
                        </div>

                        {/* Level 2 & Level 3: Subtópicos e Detalhes */}
                        {isExpanded && subNodes.length > 0 && (
                          <div className="pl-6 space-y-3 border-l-2 border-emerald-500/30 ml-3">
                            {subNodes.map((subNode) => {
                              const isSubSelected = selectedNode?.id === subNode.id;
                              const detailNodes = getDetailNodes(subNode.id);

                              return (
                                <div key={subNode.id} className="space-y-2">
                                  {/* Sub Node Card */}
                                  <div
                                    onClick={() => setSelectedNode(subNode)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                                      isSubSelected
                                        ? 'border-emerald-400 bg-emerald-950/80 text-white shadow-md ring-2 ring-emerald-400/30'
                                        : 'border-slate-700/80 bg-slate-850 text-slate-200 hover:border-slate-600'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                        Subtópico
                                      </span>
                                      <span className="text-[10px] text-slate-400">Nível 2</span>
                                    </div>
                                    <h5 className="text-xs font-bold text-white">{subNode.label}</h5>
                                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                                      {subNode.description}
                                    </p>
                                  </div>

                                  {/* Level 3: Details & Examples */}
                                  {detailNodes.length > 0 && (
                                    <div className="pl-4 space-y-2 border-l-2 border-amber-500/30 ml-2">
                                      {detailNodes.map((det) => {
                                        const isDetSelected = selectedNode?.id === det.id;
                                        return (
                                          <div
                                            key={det.id}
                                            onClick={() => setSelectedNode(det)}
                                            className={`p-2.5 rounded-lg cursor-pointer transition-all border ${
                                              isDetSelected
                                                ? 'border-amber-400 bg-amber-950/80 text-white shadow ring-1 ring-amber-400/40'
                                                : 'border-slate-750 bg-slate-800/60 text-slate-300 hover:border-amber-500/50'
                                            }`}
                                          >
                                            <div className="flex items-center space-x-1.5 mb-1">
                                              <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                                              <span className="text-[10px] font-bold text-amber-300">
                                                {det.label}
                                              </span>
                                            </div>
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
                className="flex-1 flex items-center justify-center p-4 transition-transform duration-200 overflow-auto"
                style={{ transform: `scale(${zoomLevel})` }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {mindmapData.nodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id;
                    const badge = getNodeBadge(node.type, node.level);
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'border-purple-400 bg-purple-900/80 text-white shadow-xl ring-2 ring-purple-400/40'
                            : 'border-slate-700 bg-slate-800/80 text-slate-200 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
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
              </div>
            )}

            <div className="text-center text-[11px] text-slate-500 pt-3 z-10 border-t border-slate-800">
              Dica: Clique em qualquer nó acima para carregar o conteúdo didático e exemplos detalhados.
            </div>

          </div>

          {/* Details Sidebar (1 Col) */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Explicação Didática do Nó
                </h3>
              </div>

              {selectedNode ? (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      {(() => {
                        const badge = getNodeBadge(selectedNode.type, selectedNode.level);
                        return (
                          <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        );
                      })()}
                    </div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                      {selectedNode.label}
                    </h4>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/60 space-y-2">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-200 block">
                      Aprofundamento Didático:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {selectedNode.description || 'Conceito essencial mapeado no estudo desta disciplina.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Como memorizar este ponto:
                    </span>
                    <p>
                      Crie uma frase com suas próprias palavras associando este termo ao conceito central ({mindmapData.title}).
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Selecione qualquer ramificação do mapa mental para visualizar a fundamentação e exemplos.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Conexões Mapeadas: </span>
              {mindmapData.nodes.length} nós conceituais e {mindmapData.edges.length} relações ativas.
            </div>

          </div>

        </div>
      )}

      {/* Modal para Nome Personalizado ao Salvar */}
      <SaveTitleModal
        isOpen={isSaveModalOpen}
        defaultTitle={mindmapData?.customTitle || mindmapData?.title || `Mapa Mental: ${topic}`}
        itemTypeLabel="Mapa Mental"
        onSave={confirmSaveMindmap}
        onClose={() => setIsSaveModalOpen(false)}
      />

    </div>
  );
}
