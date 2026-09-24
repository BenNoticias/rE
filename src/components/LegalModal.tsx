'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, Lock, ArrowRight, Eye, UserCheck } from 'lucide-react';
import { LEGAL_TEXTS } from '@/lib/security';
import { APP_VERSION } from '@/types';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy';
}

export function LegalModal({ isOpen, onClose, initialTab = 'terms' }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[88vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Transparência & Conformidade LGPD
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Lei Geral de Proteção de Dados (Lei 13.709/2018) • {APP_VERSION}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl mb-4 shrink-0">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'terms'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Termos de Uso</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Política de Privacidade (LGPD)</span>
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
          {activeTab === 'terms' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-blue-200">
                <p className="font-semibold text-xs mb-1">
                  {LEGAL_TEXTS.TERMS_OF_USE.title}
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300">
                  Última atualização: {LEGAL_TEXTS.TERMS_OF_USE.lastUpdate}
                </p>
              </div>

              {LEGAL_TEXTS.TERMS_OF_USE.sections.map((sec, idx) => (
                <div key={idx} className="space-y-1.5 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                    {sec.heading}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200">
                <p className="font-semibold text-xs mb-1">
                  {LEGAL_TEXTS.PRIVACY_POLICY.title}
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  {LEGAL_TEXTS.PRIVACY_POLICY.summary}
                </p>
              </div>

              {LEGAL_TEXTS.PRIVACY_POLICY.sections.map((sec, idx) => (
                <div key={idx} className="space-y-1.5 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{sec.heading}</span>
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 flex items-center space-x-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Dados protegidos por criptografia</span>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
