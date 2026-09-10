'use client';

import React, { useState } from 'react';
import { GraduationCap, Check, Sparkles, BookOpen, ChevronRight, X } from 'lucide-react';
import { GradeLevel, GRADE_OPTIONS, UserProfile } from '@/types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSelectGrade: (grade: GradeLevel) => void;
}

export function OnboardingModal({ isOpen, onClose, profile, onSelectGrade }: OnboardingModalProps) {
  const [selected, setSelected] = useState<GradeLevel>(profile.grade);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectGrade(selected);
    onClose();
  };

  const fundamentalList = GRADE_OPTIONS.filter(g => g.category === 'Fundamental');
  const medioList = GRADE_OPTIONS.filter(g => g.category === 'Médio');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative overflow-hidden">
        
        {/* Close button if user already had grade */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 mb-3 shadow-inner">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Qual é a sua Série Atual?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            A Inteligência Artificial adaptará a linguagem, o nível de profundidade e as questões de simulado para o seu momento escolar.
          </p>
        </div>

        {/* Grade Grid */}
        <div className="space-y-5">
          {/* Ensino Fundamental */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2 block">
              Ensino Fundamental II (6º ao 9º Ano)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {fundamentalList.map((item) => {
                const isChecked = selected === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isChecked
                        ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/30 font-bold shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-sm">{item.label}</span>
                    {isChecked && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ensino Médio */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2 block">
              Ensino Médio (1º ao 3º Ano & Vestibulares)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {medioList.map((item) => {
                const isChecked = selected === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(item.id)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition-all ${
                      isChecked
                        ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/30 font-bold shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="text-[11px] opacity-75 font-normal">{item.description}</span>
                    {isChecked && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
          >
            <span>Confirmar e Continuar</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
