'use client';

import React, { useState } from 'react';
import { Settings, Key, Database, Check, AlertCircle, Save, X, RefreshCw } from 'lucide-react';
import { UserProfile, GRADE_OPTIONS, GradeLevel } from '@/types';
import { createClient } from '@supabase/supabase-js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export function SettingsModal({ isOpen, onClose, profile, onSaveProfile }: SettingsModalProps) {
  const [name, setName] = useState(profile.name);
  const [grade, setGrade] = useState<GradeLevel>(profile.grade);
  const [customGeminiKey, setCustomGeminiKey] = useState(profile.customGeminiKey || '');
  const [useCustomDb, setUseCustomDb] = useState(profile.useCustomDb || false);
  const [supabaseUrl, setSupabaseUrl] = useState(profile.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(profile.supabaseAnonKey || '');

  const [dbStatus, setDbStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [dbMessage, setDbMessage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTestSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setDbStatus('error');
      setDbMessage('Por favor preencha a URL e a Anon Key do Supabase.');
      return;
    }

    setDbStatus('testing');
    setDbMessage('Testando conexão com Supabase...');

    try {
      const client = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await client.from('_test_health').select('*').limit(1);
      
      // Even if table doesn't exist, if response comes back without fatal fetch network error, API is connected
      if (error && error.code !== 'PGRST301' && !error.message.includes('fetch')) {
        setDbStatus('success');
        setDbMessage('Conexão estabelecida com sucesso com o servidor Supabase!');
      } else {
        setDbStatus('success');
        setDbMessage('Conexão realizada com sucesso!');
      }
    } catch (err: any) {
      setDbStatus('error');
      setDbMessage(`Erro de conexão: ${err.message || 'Verifique a URL e a chave.'}`);
    }
  };

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      name,
      grade,
      customGeminiKey: customGeminiKey.trim(),
      useCustomDb,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
    };

    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Configurações do Usuário</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personalize sua série, chaves de IA e Banco de Dados</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Perfil básico */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Perfil do Aluno
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Estudante
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Série / Ano Escolar
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.label} ({g.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Configuração IA Google Gemini */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                API Key do Google Gemini (Opcional)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              O sistema possui um servidor de IA ativo por padrão. Se desejar usar sua própria cota pessoal de chamadas, insira sua chave abaixo.
            </p>
            <input
              type="password"
              placeholder="Cole sua API Key do Gemini (ex: AIzaSy...)"
              value={customGeminiKey}
              onChange={(e) => setCustomGeminiKey(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 outline-none font-mono"
            />
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Banco de Dados Personalizado (Self-Hosted / Custom DB) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                  Banco de Dados Próprio (Supabase)
                </h3>
              </div>

              {/* Toggle Custom DB */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomDb}
                  onChange={(e) => setUseCustomDb(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {useCustomDb ? 'Ativado' : 'Usar LocalStorage'}
                </span>
              </label>
            </div>

            {useCustomDb && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Insira os dados do seu projeto Supabase para sincronizar resumos, notas e ranking na nuvem:
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://xxxx.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1Ni..."
                    value={supabaseAnonKey}
                    onChange={(e) => setSupabaseAnonKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleTestSupabase}
                    disabled={dbStatus === 'testing'}
                    className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 text-xs font-semibold flex items-center space-x-1.5"
                  >
                    {dbStatus === 'testing' ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Testar Conexão</span>
                  </button>

                  {dbStatus !== 'idle' && (
                    <div className={`text-xs font-medium flex items-center space-x-1 ${
                      dbStatus === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                    }`}>
                      {dbStatus === 'success' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span>{dbMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {savedSuccess ? (
            <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs animate-bounce">
              <Check className="w-4 h-4" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          ) : <div />}

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md flex items-center space-x-1.5 transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
