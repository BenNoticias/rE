'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Loader2, 
  Bookmark, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Info,
  Layers,
  LayoutGrid
} from 'lucide-react';
import { SubjectId, SUBJECTS, UserProfile, SavedMindmap, MindmapNode, MindmapEdge } from '@/types';
import { saveMindmap } from '@/lib/storage';

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
      };

      setMindmapData(newMindmap);
      saveMindmap(newMindmap);
      if (onSavedMindmapAdded) onSavedMindmapAdded(newMindmap);
      setSaved(true);
      if (newMindmap.nodes.length > 0) {
        setSelectedNode(newMindmap.nodes[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao processar mapa mental com IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMap = () => {
    if (!mindmapData) return;
    saveMindmap(mindmapData);
    if (onSavedMindmapAdded) onSavedMindmapAdded(mindmapData);
    setSaved(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-brand-600 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>Diagrama Gráfico Interativo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Mapas Mentais Visuais por IA</h1>
            <p className="text-sm text-purple-100 mt-1 max-w-xl">
              Transforme matérias complexas em conexões visuais intuitivas. Clique nos nós para explorar definições e exemplos.
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

      {/* Generator Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
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
                placeholder="Ex: Teorema de Pitágoras, Leis de Newton, Independência do Brasil..."
                className="w-full pl-4 pr-36 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow flex items-center space-x-1.5 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mapeando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Criar Mapa</span>
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

      {/* Visual Canvas Display */}
      {mindmapData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          
          {/* Interactive Graph Canvas (2 Cols) */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl relative min-h-[460px] flex flex-col justify-between overflow-hidden">
            
            {/* Controls Bar */}
            <div className="flex items-center justify-between z-10 bg-slate-800/80 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/80 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white px-2 py-1 rounded bg-purple-600/60">
                  {mindmapData.title}
                </span>
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
                  onClick={handleSaveMap}
                  className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors ${
                    saved ? 'bg-emerald-600 text-white' : 'bg-brand-600 hover:bg-brand-500 text-white'
                  }`}
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  <span>{saved ? 'Salvo' : 'Salvar'}</span>
                </button>
              </div>
            </div>

            {/* Visual Node Diagram Render (Multi-level Depth Layout) */}
            <div 
              className="flex-1 flex items-center justify-center p-4 transition-transform duration-200 overflow-auto"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <div className="flex flex-col items-center space-y-6 w-full max-w-xl">
                
                {/* Level 1: Root Node */}
                {mindmapData.nodes.filter(n => n.type === 'root').map((rootNode) => (
                  <div
                    key={rootNode.id}
                    onClick={() => setSelectedNode(rootNode)}
                    className={`p-4 rounded-2xl cursor-pointer text-center transition-all transform hover:scale-105 shadow-2xl border-2 ${
                      selectedNode?.id === rootNode.id
                        ? 'border-white ring-4 ring-purple-500/50 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white'
                        : 'border-brand-400 bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-brand-500/30'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-black tracking-widest text-purple-200 block mb-0.5">
                      Nível 1 • Conceito Central
                    </span>
                    <h3 className="text-lg font-extrabold">{rootNode.label}</h3>
                  </div>
                ))}

                {/* Connecting Line Level 1 -> Level 2 */}
                <div className="w-0.5 h-5 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />

                {/* Level 2: Main Subtopics Grid */}
                <div className="w-full space-y-5">
                  {mindmapData.nodes.filter(n => n.type === 'main').map((mainNode) => {
                    const isMainSelected = selectedNode?.id === mainNode.id;
                    
                    // Find child sub nodes linked to this main node via edges or parent ID convention
                    const childNodes = mindmapData.nodes.filter(n => {
                      if (n.type !== 'sub') return false;
                      const hasEdge = mindmapData.edges.some(e => e.source === mainNode.id && e.target === n.id);
                      const matchesPrefix = n.id.startsWith(mainNode.id + '_');
                      return hasEdge || matchesPrefix;
                    });

                    return (
                      <div key={mainNode.id} className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
                        {/* Main Subtopic Header Box */}
                        <div
                          onClick={() => setSelectedNode(mainNode)}
                          className={`p-3 rounded-xl cursor-pointer transition-all border flex items-center justify-between ${
                            isMainSelected
                              ? 'border-purple-400 bg-purple-900/90 text-white shadow-lg ring-2 ring-purple-400/40'
                              : 'border-purple-500/50 bg-purple-950/40 text-purple-100 hover:border-purple-400 hover:bg-purple-900/40'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0" />
                            <div>
                              <span className="text-[10px] uppercase font-bold text-purple-300 block">
                                Nível 2 • Eixo Principal
                              </span>
                              <h4 className="text-sm font-bold text-white">{mainNode.label}</h4>
                            </div>
                          </div>
                          <Info className="w-4 h-4 text-purple-300 shrink-0" />
                        </div>

                        {/* Level 3: Sub Nodes (Definitions, Examples, Formulas) */}
                        {childNodes.length > 0 && (
                          <div className="pl-4 border-l-2 border-purple-500/30 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {childNodes.map((subNode) => {
                              const isSubSelected = selectedNode?.id === subNode.id;
                              return (
                                <div
                                  key={subNode.id}
                                  onClick={() => setSelectedNode(subNode)}
                                  className={`p-2.5 rounded-xl cursor-pointer text-xs transition-all border ${
                                    isSubSelected
                                      ? 'border-amber-400 bg-amber-950/80 text-amber-100 ring-2 ring-amber-400/30 font-semibold'
                                      : 'border-slate-700 bg-slate-850 text-slate-300 hover:border-slate-500 hover:bg-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] uppercase font-bold text-amber-400">
                                      Nível 3 • Detalhe / Exemplo
                                    </span>
                                  </div>
                                  <div className="font-medium text-slate-100">{subNode.label}</div>
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
            </div>

            <div className="text-center text-[11px] text-slate-400 pt-2 z-10">
              Visualização Encadeada: Conceito Central → Eixos Principais → Definições e Exemplos. Clique para ver detalhes.
            </div>

          </div>

          {/* Details Sidebar (1 Col) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Detalhes do Nó Selecionado
                </h3>
              </div>

              {selectedNode ? (
                <div className="space-y-4 animate-in fade-in">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Tópico
                    </span>
                    <h4 className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                      {selectedNode.label}
                    </h4>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Explicação Técnica & Didática:
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedNode.description || 'Este nó representa uma parte essencial na visualização gráfica deste tema.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Clique em um dos nós do mapa mental no lado esquerdo para carregar o detalhamento.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Total de Conexões: </span>
              {mindmapData.edges.length} ligações conceituais geradas pela IA.
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
