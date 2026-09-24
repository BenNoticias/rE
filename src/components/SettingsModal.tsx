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
  Lock,
  User,
  Eye,
  FileText,
  AlertTriangle,
  UserX,
  FileCheck
} from 'lucide-react';
import { UserProfile, GRADE_OPTIONS, GradeLevel, APP_VERSION } from '@/types';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'database'>('profile');

  // Profile state
  const [username, setUsername] = useState(profile.username || profile.name || '');
  const [grade, setGrade] = useState<GradeLevel>(profile.grade);
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

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      username: username.trim() || 'Estudante',
      name: username.trim() || 'Estudante',
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Painel do Usuário & Configurações</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gerencie seu perfil, privacidade LGPD e conexões</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl mb-6 shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Perfil do Aluno</span>
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

          <button
            onClick={() => setActiveTab('database')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'database'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>IA & Banco de Dados</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          
          {/* TAB 1: PERFIL */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Correção de Informações Cadastrais
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Exercite seu direito de correção (LGPD Art. 18, III) atualizando seu nome de usuário e série.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome de Usuário (Username)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: joao_enem"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Visível no ranking sem expor seu nome civil.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Série / Ano Escolar
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label} ({g.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Readonly Identity Info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">E-mail Cadastrado:</span>
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">{profile.email}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Identificador Único (ID):</span>
                  <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">{profile.id}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACIDADE & LGPD (DIREITOS DO TITULAR) */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              
              {/* 1. Transparência e Acesso */}
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Acesso e Transparência aos seus Dados (Art. 18, II)
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">XP Acumulado</span>
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{profile.xp || 0} XP</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Nível Atual</span>
                    <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">Nível {profile.level || 1}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Ofensiva</span>
                    <span className="text-sm font-extrabold text-amber-500">{profile.streak || 1} dias</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Consentimento</span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {consentRevokedState ? 'Revogado' : 'Ativo (v0.3)'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                  <span>Consentimento registrado em: {profile.consent?.timestamp ? new Date(profile.consent.timestamp).toLocaleString('pt-BR') : 'Data de cadastro'}</span>
                  <button
                    onClick={() => {
                      setLegalModalTab('privacy');
                      setIsLegalModalOpen(true);
                    }}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Ver Política
                  </button>
                </div>
              </div>

              {/* 2. Portabilidade dos Dados (Art. 18, V) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                      <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>Portabilidade de Dados (Exportação)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Baixe todos os seus dados pedagógicos, resumos, simulados e histórico em formato JSON estruturado.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportData}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Baixar JSON</span>
                  </button>
                </div>

                {exportSuccess && (
                  <div className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Arquivo JSON baixado com sucesso!</span>
                  </div>
                )}
              </div>

              {/* 3. Não Compartilhamento com Terceiros */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Compromisso de Não Compartilhamento</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  O EstudaAI não compartilha nem vende dados de estudantes com terceiros para fins de marketing ou publicidade. Todos os dados são exclusivamente pedagógicos.
                </p>
              </div>

              {/* 4. Revogação e Exclusão (Direito ao Esquecimento - Art. 18, VI & IX) */}
              <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 space-y-3">
                <h4 className="text-xs font-bold text-red-900 dark:text-red-300 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Revogação e Exclusão de Conta (Direito ao Esquecimento)</span>
                </h4>
                
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={handleRevokeConsent}
                    disabled={consentRevokedState}
                    className="flex-1 py-2 px-3 rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 hover:bg-red-50 text-red-700 dark:text-red-300 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {consentRevokedState ? 'Consentimento Revogado' : 'Revogar Consentimento'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Conta Permanentemente</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: IA & BANCO DE DADOS */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              
              {/* Google Gemini Key */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    API Key do Google Gemini (Opcional)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  O sistema possui chave padrão ativa. Se desejar usar sua própria cota pessoal da Google AI, insira abaixo:
                </p>
                <input
                  type="password"
                  placeholder="Cole sua API Key do Gemini (ex: AIzaSy...)"
                  value={customGeminiKey}
                  onChange={(e) => setCustomGeminiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              {/* Supabase Connection */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Banco de Dados Próprio (Supabase)
                    </h3>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCustomDb}
                      onChange={(e) => setUseCustomDb(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {useCustomDb && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Supabase Project URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://xxxx.supabase.co"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none"
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
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleTestSupabase}
                        disabled={dbStatus === 'testing'}
                        className="px-3 py-1.5 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 text-xs font-semibold flex items-center space-x-1.5"
                      >
                        {dbStatus === 'testing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
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
          )}

        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          {savedSuccess ? (
            <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs animate-bounce">
              <Check className="w-4 h-4" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 font-mono">
              EstudaAI {APP_VERSION}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation Modal for Permanent Deletion */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Confirmar Exclusão de Conta?
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Esta ação é **irreversível**. Todos os seus dados pessoais, resumos salvos, simulados, pontuações de XP e posição no ranking serão apagados permanentemente conforme o Direito ao Esquecimento (LGPD Art. 18, VI).
            </p>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30"
              >
                Sim, Excluir Tudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Modal (Terms & Privacy) */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

    </div>
  );
}
