'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Lock, 
  Mail, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Trophy, 
  Brain,
  LogIn,
  UserCheck,
  User,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { GradeLevel, GRADE_OPTIONS, APP_VERSION, UserConsent } from '@/types';
import { hashPassword } from '@/lib/security';
import { LegalModal } from './LegalModal';

interface LoginPageProps {
  onLoginSuccess: (
    username: string, 
    email: string, 
    grade: GradeLevel, 
    passwordHash?: string, 
    consent?: UserConsent
  ) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('1_em');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Consent Checkboxes (LGPD)
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Legal Modal
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<'terms' | 'privacy'>('terms');

  const openLegalModal = (tab: 'terms' | 'privacy', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegistering) {
      if (!termsAccepted || !privacyAccepted) {
        setErrorMsg('É necessário aceitar os Termos de Uso e a Política de Privacidade para cadastrar.');
        return;
      }
      if (!username.trim()) {
        setErrorMsg('Por favor, informe um Nome de Usuário.');
        return;
      }
    }

    setLoading(true);

    try {
      // Hash password securely (SHA-256)
      const pwHash = password ? await hashPassword(password) : undefined;
      
      const studentUsername = isRegistering 
        ? username.trim() 
        : (username.trim() || (email ? email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_') : 'Estudante'));

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
          grade, 
          pwHash, 
          consentData
        );
      }, 500);
    } catch (err) {
      setLoading(false);
      setErrorMsg('Ocorreu um erro ao processar o login. Tente novamente.');
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    const studentUsername = username.trim() || 'Estudante';
    const pwHash = await hashPassword('google_oauth_token');
    
    const consentData: UserConsent = {
      termsAccepted: true,
      privacyAccepted: true,
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
    };

    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(studentUsername, 'aluno.google@escola.edu.br', grade, pwHash, consentData);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between font-sans antialiased text-slate-900 dark:text-slate-100">
      
      {/* Top Academic Header Bar */}
      <header className="bg-[#051838] border-b border-slate-800 text-white py-3.5 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <BookOpen className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white block leading-none">
              Estuda<span className="text-blue-400">AI</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Plataforma de Ensino • Estilo SAS
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-xs font-medium text-slate-300">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Ambiente Seguro & LGPD Compliant</span>
          </span>
          <span className="text-slate-600">•</span>
          <span>Portal da Educação Básica</span>
        </div>
      </header>

      {/* Main Split Screen Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="max-w-5xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* Left Institutional Highlight Panel (SAS Blue) */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#051838] via-[#08285c] to-[#04132e] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-300 border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sistema de Inteligência Educacional</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                Excelência nos estudos e alta performance no ENEM e Vestibulares.
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed">
                Acesse a plataforma guiada por IA do Google Gemini para resumos didáticos por série, mapas mentais visuais multinível e simulados com gabarito comentado.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3 text-xs text-slate-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Conteúdos adaptados do 6º EF ao 3º ano do Ensino Médio</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Simulados inéditos com correção comentada em tempo real</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-200 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Privacidade garantida (LGPD) com identificação por Nome de Usuário</span>
                </div>
              </div>
            </div>

            {/* Quote / Footer Note */}
            <div className="pt-8 border-t border-white/10 relative z-10">
              <p className="text-xs text-slate-400 italic">
                "A tecnologia aliada à metodologia de ensino e à proteção de dados transforma a preparação escolar em conquistas seguras."
              </p>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white dark:bg-slate-900">
            <div>
              
              {/* Form Title */}
              <div className="mb-5">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {isRegistering ? 'Criar Conta de Aluno' : 'Acesse o Portal do Aluno'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isRegistering 
                    ? 'Preencha apenas o nome de usuário, e-mail e senha para começar'
                    : 'Digite suas credenciais de estudante para acessar a plataforma'}
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Google Auth Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full mb-4 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Entrar com o Google</span>
              </button>

              <div className="relative my-3.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[11px] font-semibold">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 uppercase">
                    ou use seu e-mail
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* 1. Nome de Usuário (Username) - Minimização LGPD */}
                {isRegistering && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nome de Usuário (Username)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: ana_estudante ou joao_enem"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Usado para identificação no ranking sem expor seu nome civil.
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail do Estudante
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="aluno@escola.edu.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
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
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Série / Ano Escolar
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value as GradeLevel)}
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.label} ({g.description})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* LGPD Consent Checkboxes (Explicit & Mandatory on Registration) */}
                {isRegistering && (
                  <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="flex items-start space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        required
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                        Li e concordo com os{' '}
                        <button
                          type="button"
                          onClick={(e) => openLegalModal('terms', e)}
                          className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center"
                        >
                          Termos de Uso
                        </button>
                      </span>
                    </label>

                    <label className="flex items-start space-x-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        required
                        checked={privacyAccepted}
                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                        Autorizo o tratamento pedagógico dos meus dados conforme a{' '}
                        <button
                          type="button"
                          onClick={(e) => openLegalModal('privacy', e)}
                          className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center"
                        >
                          Política de Privacidade (LGPD)
                        </button>
                      </span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#051838] hover:bg-blue-900 text-white text-xs font-bold shadow-lg shadow-blue-950/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isRegistering ? 'Criar Conta e Aceitar Termos' : 'Entrar no Portal'}</span>
                </button>
              </form>

            </div>

            {/* Footer toggle */}
            <div className="pt-4 text-center border-t border-slate-100 dark:border-slate-800 mt-3">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMsg('');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
              >
                {isRegistering ? 'Já possui conta? Faça Login' : 'Primeiro Acesso? Cadastre-se'}
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* Institutional Footer with Discreet Version Tag & Legal Links */}
      <footer className="py-3 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center space-x-3">
          <span>Plataforma EstudaAI • SAS</span>
          <span>•</span>
          <button
            onClick={(e) => openLegalModal('terms', e)}
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
          >
            Termos
          </button>
          <span>•</span>
          <button
            onClick={(e) => openLegalModal('privacy', e)}
            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
          >
            Privacidade & LGPD
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400">Versão</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs">
            {APP_VERSION}
          </span>
        </div>
      </footer>

      {/* Terms and Privacy Modal */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

    </div>
  );
}
