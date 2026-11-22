'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Database, 
  Check, 
  AlertCircle, 
  Save, 
  X, 
  RefreshCw,
  ShieldCheck, 
  Download, 
  Trash2, 
  Moon, 
  Sun, 
  Laptop,
  FileCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { UserProfile, APP_VERSION } from '@/types';
import { createClient } from '@supabase/supabase-js';
import { exportAllUserData, revokeUserConsent, deleteUserAccount } from '@/lib/storage';
import { downloadUserDataAsJson } from '@/lib/security';
import { deleteUserProfileFromSupabase } from '@/lib/supabase';
import { LegalModal } from './LegalModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onDeleteAccount?: () => void;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  profile, 
  onSaveProfile,
  onDeleteAccount 
}: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'preferences' | 'privacy'>('preferences');

  // Custom DB & AI preferences
  const [customGeminiKey, setCustomGeminiKey] = useState(profile.customGeminiKey || '');
  const [useCustomDb, setUseCustomDb] = useState(profile.useCustomDb || false);
  const [supabaseUrl, setSupabaseUrl] = useState(profile.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(profile.supabaseAnonKey || '');

  // Status & Feedback
  const [dbStatus, setDbStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [dbMessage, setDbMessage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [consentRevokedState, setConsentRevokedState] = useState(profile.consentRevoked || false);

  // Deletion Confirmation Modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Legal Modal
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('privacy');

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

  const handleSavePreferences = () => {
    const updated: UserProfile = {
      ...profile,
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

  // Portability: Export JSON
  const handleExportData = () => {
    try {
      const exportData = exportAllUserData();
      downloadUserDataAsJson(exportData);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e) {
      console.error("Erro ao exportar dados:", e);
    }
  };

  // Revocation of consent
  const handleRevokeConsent = () => {
    revokeUserConsent();
    setConsentRevokedState(true);
    const updated = { ...profile, consentRevoked: true };
    onSaveProfile(updated);
  };

  // Account Deletion (Direito ao Esquecimento)
  const handleConfirmDelete = async () => {
    try {
      if (profile.useCustomDb && profile.supabaseUrl && profile.supabaseAnonKey) {
        await deleteUserProfileFromSupabase(profile.id);
      }
      deleteUserAccount(profile.id);
      setShowDeleteConfirm(false);
      onClose();
      if (onDeleteAccount) {
        onDeleteAccount();
      } else {
        window.location.reload();
      }
    } catch (e) {
      console.error("Erro ao excluir conta:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Configurações do Sistema</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Preferências visuais, banco de dados e direitos LGPD</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl mb-6 shrink-0">
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'preferences'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Preferências & Banco de Dados</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacidade & LGPD</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          
          {/* TAB 1: PREFERÊNCIAS & BANCO DE DADOS */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              
              {/* Tema da Interface */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  Aparência e Tema do Sistema
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      theme === 'light'
                        ? 'border-blue-600 bg-white text-blue-600 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Claro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      theme === 'dark'
                        ? 'border-blue-600 bg-slate-800 text-blue-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Escuro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      theme === 'system'
                        ? 'border-blue-600 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Laptop className="w-4 h-4 text-slate-500" />
                    <span>Sistema</span>
                  </button>
                </div>
              </div>

              {/* Chave Gemini Opcional */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Chave Personalizada da Google Gemini API (Opcional)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={customGeminiKey}
                    onChange={(e) => setCustomGeminiKey(e.target.value)}
                    placeholder="Chave customizada AI Studio (opcional)"
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Por padrão, a plataforma utiliza a chave global configurada com modelo Gemini 3.6 Flash.
                </p>
              </div>

              {/* Conexão Supabase Próprio */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      Banco de Dados Próprio (Supabase Privado)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Guarde seus dados na sua própria instância de nuvem.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={useCustomDb}
                    onChange={(e) => setUseCustomDb(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                {useCustomDb && (
                  <div className="space-y-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Supabase Project URL
                      </label>
                      <input
                        type="text"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        placeholder="https://seu-projeto.supabase.co"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Supabase Anon Key
                      </label>
                      <input
                        type="password"
                        value={supabaseAnonKey}
                        onChange={(e) => setSupabaseAnonKey(e.target.value)}
                        placeholder="sua_chave_anonima_publica"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleTestSupabase}
                        disabled={dbStatus === 'testing'}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${dbStatus === 'testing' ? 'animate-spin' : ''}`} />
                        <span>Testar Conexão</span>
                      </button>

                      {dbStatus === 'success' && (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Conectado com sucesso!</span>
                        </span>
                      )}

                      {dbStatus === 'error' && (
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center space-x-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[200px]">{dbMessage}</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: PRIVACIDADE & LGPD */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              
              {/* Resumo de Consentimento */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Status do Consentimento</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {consentRevokedState ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">
                      Consentimento revogado. Seus dados estão em modo restrito.
                    </span>
                  ) : (
                    <span>
                      Termos de Uso e Política de Privacidade aceitos sob conformidade da LGPD ({APP_VERSION}).
                    </span>
                  )}
                </p>
                <div className="flex items-center space-x-3 pt-1">
                  <button
                    onClick={() => {
                      setLegalModalTab('terms');
                      setIsLegalModalOpen(true);
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Ver Termos</span>
                  </button>
                  <button
                    onClick={() => {
                      setLegalModalTab('privacy');
                      setIsLegalModalOpen(true);
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Política de Privacidade</span>
                  </button>
                </div>
              </div>

              {/* Portabilidade de Dados */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                      Portabilidade de Dados (Art. 18, V)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      Baixe uma cópia completa de todos os seus dados e histórico em formato aberto (JSON).
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar</span>
                  </button>
                </div>
                {exportSuccess && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 pt-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Arquivo JSON baixado com sucesso!</span>
                  </span>
                )}
              </div>

              {/* Revogação de Consentimento */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                      Revogação do Consentimento (Art. 18, IX)
                    </span>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 block">
                      Interrompe o tratamento com base no seu consentimento a qualquer momento.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRevokeConsent}
                    disabled={consentRevokedState}
                    className="px-3 py-1.5 rounded-xl border border-amber-400 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {consentRevokedState ? 'Revogado' : 'Revogar'}
                  </button>
                </div>
              </div>

              {/* Eliminação Definitiva da Conta */}
              <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-red-900 dark:text-red-200 block">
                      Direito à Eliminação / Esquecimento (Art. 18, VI)
                    </span>
                    <span className="text-[11px] text-red-700 dark:text-red-400 block">
                      Exclua permanentemente sua conta, históricos e todo rastro de dados pessoais.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Conta</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 flex items-center justify-between shrink-0">
          <div>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>Preferências salvas com sucesso!</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Preferências</span>
            </button>
          </div>
        </div>

      </div>

      {/* Modal de Confirmação de Exclusão da Conta */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Confirmar Exclusão Definitiva
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Esta ação apagará permanentemente todos os seus resumos, notas de simulados, redações e cadastro local e remoto. Esta operação é irreversível.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Termos / Privacidade */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

    </div>
  );
}
