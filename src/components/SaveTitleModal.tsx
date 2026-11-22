'use client';

import React, { useState, useEffect } from 'react';
import { Bookmark, X, Check, Tag } from 'lucide-react';

interface SaveTitleModalProps {
  isOpen: boolean;
  defaultTitle: string;
  itemTypeLabel: string;
  onSave: (customTitle: string) => void;
  onClose: () => void;
}

export function SaveTitleModal({
  isOpen,
  defaultTitle,
  itemTypeLabel,
  onSave,
  onClose
}: SaveTitleModalProps) {
  const [title, setTitle] = useState(defaultTitle || '');

  useEffect(() => {
    setTitle(defaultTitle || '');
  }, [defaultTitle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || defaultTitle || 'Meu Conteúdo Salvo';
    onSave(finalTitle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Bookmark className="w-5 h-5 fill-amber-500" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                Salvar em Meus Conteúdos
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Nomear {itemTypeLabel}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Defina um título personalizado para organizar seus estudos:
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Revisão ENEM 2026 - Termodinâmica e Gases"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Este nome aparecerá em destaque na aba <strong>Salvos</strong> para busca rápida.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar com este Nome</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
