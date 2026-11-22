'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  BookOpen, 
  Network, 
  CheckCircle2, 
  Calendar, 
  Trash2, 
  Search, 
  Award, 
  Clock, 
  Bookmark, 
  AlertTriangle,
  CheckSquare,
  Square,
  Filter,
  Check
} from 'lucide-react';
import { UnifiedHistoryItem, SUBJECTS, GRADE_OPTIONS } from '@/types';
import { 
  getAllHistoryItems, 
  deleteHistoryItem, 
  deleteHistoryBatch, 
  deleteHistoryByTimeframe, 
  toggleItemSaved 
} from '@/lib/storage';
import { HistoryViewerModal } from './HistoryViewerModal';

export function HistoryModule() {
  const [items, setItems] = useState<UnifiedHistoryItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingItem, setViewingItem] = useState<UnifiedHistoryItem | null>(null);

  // Modais de exclusão
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<'today' | 'week' | 'month' | 'all' | 'batch' | null>(null);

  const loadData = () => {
    setItems(getAllHistoryItems());
    setSelectedIds(new Set());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleSaved = (item: UnifiedHistoryItem) => {
    toggleItemSaved(item.type, item.id);
    loadData();
    if (viewingItem && viewingItem.id === item.id) {
      setViewingItem(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null);
    }
  };

  const handleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredItems = items.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.subject && item.subject.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleSelectAllFiltered = () => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => `${i.type}_${i.id}`)));
    }
  };

  const handleDeleteSingle = (item: UnifiedHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(item.type, item.id);
    loadData();
  };

  const executeConfirmAction = () => {
    if (!confirmAction) return;

    if (confirmAction === 'batch') {
      const targetItems = items
        .filter(i => selectedIds.has(`${i.type}_${i.id}`))
        .map(i => ({ type: i.type, id: i.id }));
      deleteHistoryBatch(targetItems);
    } else {
      deleteHistoryByTimeframe(confirmAction);
    }

    setShowConfirmModal(false);
    setConfirmAction(null);
    loadData();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Registro Completo de Estudos</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Histórico de Atividades</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Todas as suas gerações de IA ficam registradas aqui automaticamente. Clique em qualquer item para ver os detalhes completos ou gerencie exclusões por período.
            </p>
          </div>

          <div className="w-full md:w-auto relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar histórico..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder-slate-400 text-xs border border-white/20 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Action Toolbar: Filter Types + Timeframe Clear Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Category Tabs */}
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Todos', count: items.length },
            { id: 'summary', label: 'Resumos', count: items.filter(i => i.type === 'summary').length },
            { id: 'mindmap', label: 'Mapas', count: items.filter(i => i.type === 'mindmap').length },
            { id: 'quiz', label: 'Simulados', count: items.filter(i => i.type === 'quiz').length },
            { id: 'essay', label: 'Redações', count: items.filter(i => i.type === 'essay').length },
            { id: 'schedule', label: 'Cronogramas', count: items.filter(i => i.type === 'schedule').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Management & Deletion Controls */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          
          {/* Select all checkbox button */}
          {filteredItems.length > 0 && (
            <button
              onClick={handleSelectAllFiltered}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{selectedIds.size > 0 ? `${selectedIds.size} selecionados` : 'Selecionar Todos'}</span>
            </button>
          )}

          {/* Delete Selected (Batch) */}
          {selectedIds.size > 0 && (
            <button
              onClick={() => {
                setConfirmAction('batch');
                setShowConfirmModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Apagar ({selectedIds.size})</span>
            </button>
          )}

          {/* Period presets dropdown / buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setConfirmAction('today');
                setShowConfirmModal(true);
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Apagar registros do dia de hoje"
            >
              Hoje
            </button>

            <button
              onClick={() => {
                setConfirmAction('week');
                setShowConfirmModal(true);
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Apagar registros dos últimos 7 dias"
            >
              Última Semana
            </button>

            <button
              onClick={() => {
                setConfirmAction('month');
                setShowConfirmModal(true);
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Apagar registros dos últimos 30 dias"
            >
              Último Mês
            </button>

            <button
              onClick={() => {
                setConfirmAction('all');
                setShowConfirmModal(true);
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/60 transition-colors flex items-center space-x-1"
              title="Limpar todo o histórico de estudos"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar Tudo</span>
            </button>
          </div>

        </div>

      </div>

      {/* History Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto stroke-1" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Nenhum registro encontrado no histórico
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Quando você gerar resumos, mapas mentais, simulados ou redações com IA, eles aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const key = `${item.type}_${item.id}`;
            const isSelected = selectedIds.has(key);
            const subjObj = SUBJECTS.find(s => s.id === item.subject);
            const gradeObj = GRADE_OPTIONS.find(g => g.id === item.grade);

            return (
              <div
                key={key}
                onClick={() => setViewingItem(item)}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all cursor-pointer group flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                  isSelected 
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20' 
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar with Selection Checkbox & Type Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleSelectOne(key, e)}
                        className="text-slate-400 hover:text-blue-600 p-0.5 rounded transition-colors"
                        title={isSelected ? 'Desmarcar' : 'Selecionar'}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.type === 'summary' && 'Resumo'}
                        {item.type === 'mindmap' && 'Mapa Mental'}
                        {item.type === 'quiz' && 'Simulado'}
                        {item.type === 'essay' && 'Redação'}
                        {item.type === 'schedule' && 'Cronograma'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSaved(item);
                        }}
                        className={`p-1 rounded-lg transition-colors ${
                          item.isSaved
                            ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950'
                            : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title={item.isSaved ? 'Salvo nos Favoritos' : 'Salvar nos Meus Conteúdos'}
                      >
                        <Bookmark className={`w-4 h-4 ${item.isSaved ? 'fill-amber-500' : ''}`} />
                      </button>

                      {/* Single Delete Button */}
                      <button
                        onClick={(e) => handleDeleteSingle(item, e)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Excluir este registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Subject and Grade */}
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{subjObj?.name || item.subject || 'Geral'}</span>
                    {gradeObj && (
                      <>
                        <span>•</span>
                        <span>{gradeObj.label}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(item.createdAt).toLocaleDateString('pt-BR')} {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {item.score !== undefined && (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {item.score}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Deletion Actions */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Confirmar Exclusão de Histórico
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {confirmAction === 'all' && 'Tem certeza de que deseja apagar TODO o seu histórico de estudos? Esta ação não pode ser desfeita.'}
                {confirmAction === 'today' && 'Deseja apagar todos os registros gerados hoje?'}
                {confirmAction === 'week' && 'Deseja apagar todos os registros gerados nos últimos 7 dias?'}
                {confirmAction === 'month' && 'Deseja apagar todos os registros gerados nos últimos 30 dias?'}
                {confirmAction === 'batch' && `Deseja apagar os ${selectedIds.size} registros selecionados?`}
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={executeConfirmAction}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
              >
                Confirmar e Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Full Details Modal */}
      <HistoryViewerModal
        item={viewingItem}
        onClose={() => setViewingItem(null)}
        onToggleSaved={handleToggleSaved}
      />

    </div>
  );
}
