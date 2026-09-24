'use client';

import React, { useState } from 'react';
import { UserProfile, APP_VERSION, UserConsent } from '@/types';
import { X, Mail, Lock, LogIn, UserPlus, Sparkles, CheckCircle2, User, AlertCircle } from 'lucide-react';
import { hashPassword } from '@/lib/security';
import { LegalModal } from './LegalModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onLoginSuccess: (
    username: string, 
    email: string, 
    passwordHash?: string, 
    consent?: UserConsent
  ) => void;
}

export function AuthModal({ isOpen, onClose, profile, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [msg, setMsg] = useState('');

  // Legal modal
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');

  if (!isOpen) return null;

  const openLegalModal = (tab: 'terms' | 'privacy', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setMsg('');

    if (!isLogin && (!termsAccepted || !privacyAccepted)) {
      setErrorMsg('É necessário aceitar os Termos de Uso e a Política de Privacidade.');
      return;
    }

    setLoading(true);

    try {
      const pwHash = password ? await hashPassword(password) : undefined;
      const studentUsername = isLogin 
        ? (username.trim() || (email ? email.split('@')[0] : 'Estudante')) 
        : (username.trim() || 'Estudante');

      const consentData: UserConsent = {
        termsAccepted: true,
        privacyAccepted: true,
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
      };

      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(
          studentUsername, 
          email.trim().toLowerCase() || 'aluno@escola.edu.br', 
          pwHash, 
          consentData
        );
        setMsg('Autenticado com sucesso!');
        setTimeout(() => {
          setMsg('');
          onClose();
        }, 700);
      }, 500);
    } catch (err) {
      setLoading(false);
      setErrorMsg('Erro na autenticação. Tente novamente.');
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    const studentUsername = username.trim() || 'Estudante Google';
    const pwHash = await hashPassword('google_token');
    const consentData: UserConsent = {
      termsAccepted: true,
      privacyAccepted: true,
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
    };

    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(studentUsername, 'aluno.google@escola.edu.br', pwHash, consentData);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-2 shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isLogin ? 'Acessar sua Conta' : 'Criar Conta de Estudante'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Salve seu progresso, simulados e conquistas no ranking oficial (LGPD)
          </p>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full mb-3.5 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continuar com o Google</span>
        </button>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">ou com seu e-mail</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome de Usuário (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Ex: ana_estudos"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              E-mail do Estudante
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="seu.email@escola.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1.5 pt-1">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  Aceito os{' '}
                  <button
                    type="button"
                    onClick={(e) => openLegalModal('terms', e)}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Termos de Uso
                  </button>
                </span>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  Concordo com a{' '}
                  <button
                    type="button"
                    onClick={(e) => openLegalModal('privacy', e)}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    Política de Privacidade (LGPD)
                  </button>
                </span>
              </label>
            </div>
          )}

          {msg && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1 pt-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{msg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-all"
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{isLogin ? 'Entrar' : 'Cadastrar e Aceitar Termos'}</span>
          </button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
            }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
          >
            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem conta? Faça Login'}
          </button>
        </div>

      </div>

      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
    </div>
  );
}
