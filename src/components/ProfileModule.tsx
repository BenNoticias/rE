'use client';

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Target, 
  School, 
  Save, 
  Check, 
  LogOut, 
  Flame, 
  Gem, 
  Trophy, 
  ShieldCheck, 
  Sparkles,
  Camera
} from 'lucide-react';
import { UserProfile, GRADE_OPTIONS, GradeLevel } from '@/types';
import { saveUserProfile } from '@/lib/storage';
import { syncUserProfileToSupabase, signOutUser } from '@/lib/supabase';

interface ProfileModuleProps {
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  onLogout: () => void;
}

// Preset avatars with friendly academic themes and modern gradients
const AVATAR_PRESETS = [
  { id: 'avatar_blue', gradient: 'from-blue-600 to-indigo-700', emoji: '🎓', label: 'Acadêmico' },
  { id: 'avatar_emerald', gradient: 'from-emerald-500 to-teal-700', emoji: '🔬', label: 'Cientista' },
  { id: 'avatar_amber', gradient: 'from-amber-500 to-orange-600', emoji: '💡', label: 'Criativo' },
  { id: 'avatar_purple', gradient: 'from-purple-600 to-pink-600', emoji: '🚀', label: 'Inovador' },
  { id: 'avatar_cyan', gradient: 'from-cyan-500 to-blue-600', emoji: '📚', label: 'Leitor' },
  { id: 'avatar_rose', gradient: 'from-rose-500 to-red-600', emoji: '✍️', label: 'Redator' },
  { id: 'avatar_violet', gradient: 'from-violet-600 to-purple-800', emoji: '🏛️', label: 'Humanista' },
  { id: 'avatar_slate', gradient: 'from-slate-700 to-zinc-900', emoji: '⚡', label: 'Estrategista' },
];

export function ProfileModule({ profile, onProfileUpdated, onLogout }: ProfileModuleProps) {
  const [username, setUsername] = useState(profile.username || profile.name || '');
  const [email] = useState(profile.email || '');
  const [grade, setGrade] = useState<GradeLevel>(profile.grade || '1_em');
  const [studyGoal, setStudyGoal] = useState(profile.studyGoal || '');
  const [school, setSchool] = useState(profile.school || '');
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarUrl || 'avatar_blue');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      username: username.trim() || 'Estudante',
      name: username.trim() || 'Estudante',
      grade,
      avatarUrl: selectedAvatar,
      studyGoal: studyGoal.trim(),
      school: school.trim(),
    };

    saveUserProfile(updated);
    syncUserProfileToSupabase(updated);
    onProfileUpdated(updated);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const currentPreset = AVATAR_PRESETS.find(a => a.id === selectedAvatar) || AVATAR_PRESETS[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans animate-in fade-in duration-300">
      
      {/* Profile Header Hero */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#07193b] via-[#0b2559] to-[#051433] text-white shadow-xl relative overflow-hidden border border-blue-900/50">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          
          {/* Avatar Display */}
          <div className="relative group">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${currentPreset.gradient} flex items-center justify-center text-4xl shadow-xl shadow-blue-950/50 border-2 border-white/20 transition-transform group-hover:scale-105`}>
              {currentPreset.emoji}
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-blue-600 text-white shadow-md border-2 border-slate-900">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* User Basic Info & Stats */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 backdrop-blur-md text-xs font-semibold text-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Estudante Autenticado • The Educator</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile.username || profile.name || 'Estudante'}
            </h1>
            <p className="text-xs text-blue-200/80">
              {email || 'Conta local sincronizada'}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-800/40">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>{profile.streak || 1} dias de ofensiva</span>
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-400 bg-blue-950/40 px-3 py-1.5 rounded-xl border border-blue-800/40">
                <Gem className="w-4 h-4" />
                <span>{profile.xp || 0} XP Acumulados</span>
              </div>

              <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-400 bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-800/40">
                <Trophy className="w-4 h-4" />
                <span>Nível {profile.level || 1}</span>
              </div>
            </div>

          </div>

          {/* Logout Button */}
          <div className="shrink-0">
            <button
              onClick={() => {
                if (confirm('Deseja realmente sair da sua conta?')) {
                  signOutUser();
                  onLogout();
                }
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-white/10"
              title="Desconectar sessão"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>

        </div>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Editar Informações do Estudante
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personalize seu perfil para que a IA adapte a linguagem e a dificuldade dos conteúdos.
          </p>
        </div>

        {/* 1. Escolha de Avatar */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Escolha seu Avatar de Estudante
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {AVATAR_PRESETS.map((avatar) => {
              const isSelected = selectedAvatar === avatar.id;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`p-3 rounded-2xl flex flex-col items-center space-y-1.5 transition-all ${
                    isSelected
                      ? 'ring-2 ring-blue-600 bg-blue-50/50 dark:bg-blue-950/40 scale-105'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${avatar.gradient} flex items-center justify-center text-xl shadow-sm text-white`}>
                    {avatar.emoji}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    {avatar.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          
          {/* Nome de Usuário */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Nome ou Apelido de Estudante
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: Pedro Alvares, Maria Silva..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* E-mail (Read only) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              E-mail Vinculado
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                value={email || 'Não informado'}
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-sm outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Série / Ano Escolar */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Série / Ano Escolar
            </label>
            <div className="relative">
              <GraduationCap className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g.id} value={g.id} className="text-slate-900 bg-white">
                    {g.label} ({g.description})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Foco de Estudos / Meta */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Foco / Meta de Estudos Principal
            </label>
            <div className="relative">
              <Target className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={studyGoal}
                onChange={(e) => setStudyGoal(e.target.value)}
                placeholder="Ex: Medicina no ENEM, FUVEST, Concurso Militar, ITA..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Escola / Colégio */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Escola / Colégio / Cursinho (Opcional)
            </label>
            <div className="relative">
              <School className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Ex: Colégio Santo Agostinho, Anglo, Poliedro..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Perfil salvo e sincronizado com sucesso!</span>
              </span>
            )}
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>

      </div>

    </div>
  );
}
