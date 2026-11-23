'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { Dashboard } from '@/components/Dashboard';
import { SummaryModule } from '@/components/SummaryModule';
import { MindmapModule } from '@/components/MindmapModule';
import { QuizModule } from '@/components/QuizModule';
import { ScheduleModule } from '@/components/ScheduleModule';
import { LeaderboardModule } from '@/components/LeaderboardModule';
import { HistoryModule } from '@/components/HistoryModule';
import { VestibularesModule } from '@/components/VestibularesModule';
import { RedacaoModule } from '@/components/RedacaoModule';
import { SavedModule } from '@/components/SavedModule';
import { ProfileModule } from '@/components/ProfileModule';
import { OnboardingModal } from '@/components/OnboardingModal';
import { SettingsModal } from '@/components/SettingsModal';
import { AuthModal } from '@/components/AuthModal';
import { SearchModal } from '@/components/SearchModal';
import { LoginPage } from '@/components/LoginPage';

import { UserProfile, SubjectId, GradeLevel, UserConsent, APP_VERSION } from '@/types';
import { getUserProfile, saveUserProfile, getRegisteredUsers } from '@/lib/storage';
import { getSupabaseClient, syncUserProfileToSupabase } from '@/lib/supabase';

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('matematica');

  // Modals state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleAuthSessionUser = async (user: any) => {
    const userEmail = (user.email || '').trim().toLowerCase();
    const metadata = user.user_metadata || {};
    const metaUsername = metadata.username || metadata.name || metadata.full_name || (userEmail ? userEmail.split('@')[0] : 'Estudante');
    const metaGrade = (metadata.grade as GradeLevel) || '1_em';

    // Sincroniza com dados oficiais da tabela 'profiles' no Supabase
    const supabase = getSupabaseClient();
    let dbProfile: any = null;
    if (supabase && user.id) {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (data) dbProfile = data;
      } catch (err) {
        console.warn('Erro ao carregar perfil do Supabase:', err);
      }
    }

    const registered = getRegisteredUsers();
    const existing = registered.find(u => (u.id && u.id === user.id) || (u.email && u.email.toLowerCase() === userEmail.toLowerCase()));

    const resolvedUsername = dbProfile?.username || dbProfile?.name || existing?.username || existing?.name || metaUsername;
    const resolvedGrade = (dbProfile?.grade as GradeLevel) || existing?.grade || metaGrade;
    const resolvedAvatar = dbProfile?.avatar_url || existing?.avatarUrl || metadata.avatar_url || metadata.picture || 'avatar_blue';

    const updated: UserProfile = {
      id: user.id || (existing ? existing.id : 'user_' + Date.now().toString(36)),
      username: resolvedUsername,
      name: resolvedUsername,
      email: userEmail,
      avatarUrl: resolvedAvatar,
      grade: resolvedGrade,
      xp: dbProfile?.xp !== undefined ? Number(dbProfile.xp) : (existing?.xp ?? 0),
      streak: dbProfile?.streak !== undefined ? Number(dbProfile.streak) : (existing?.streak ?? 1),
      level: dbProfile?.level !== undefined ? Number(dbProfile.level) : (existing?.level ?? 1),
      studyGoal: dbProfile?.study_goal || existing?.studyGoal || '',
      school: dbProfile?.school || existing?.school || '',
      consent: existing?.consent || {
        termsAccepted: true,
        privacyAccepted: true,
        timestamp: dbProfile?.consent_timestamp || new Date().toISOString(),
        version: dbProfile?.consent_version || APP_VERSION,
      },
      createdAt: dbProfile?.created_at || existing?.createdAt || new Date().toISOString(),
      useCustomDb: existing?.useCustomDb || false,
    };

    setProfile(updated);
    saveUserProfile(updated);
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const loadedProfile = getUserProfile();
    setProfile(loadedProfile);

    // Keyboard shortcut for Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Supabase Auth listener para validação e sincronização de sessão oficial
    let authSubscription: any = null;
    const supabase = getSupabaseClient();

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          handleAuthSessionUser(session.user);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          handleAuthSessionUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
        }
      });
      authSubscription = subscription;
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#051838] text-white font-sans">
        <div className="animate-pulse font-bold text-lg">Carregando The Educator...</div>
      </div>
    );
  }

  // Handle Login Screen Success
  const handleInitialLogin = (
    username: string, 
    email: string, 
    grade: GradeLevel,
    passwordHash?: string,
    consent?: UserConsent,
    userId?: string,
    passedProfile?: UserProfile | null
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const registered = getRegisteredUsers();
    const existing = registered.find(u => (userId && u.id === userId) || (u.email && u.email.toLowerCase() === cleanEmail));

    const updated: UserProfile = passedProfile ? {
      ...passedProfile,
      passwordHash: passwordHash || passedProfile.passwordHash,
    } : existing ? {
      ...existing,
      id: userId || existing.id,
      username: username || existing.username || existing.name,
      name: username || existing.name,
      grade: grade || existing.grade,
      passwordHash: passwordHash || existing.passwordHash,
      consent: consent || existing.consent,
    } : {
      id: userId || profile.id || ('user_' + Date.now().toString(36)),
      username: username,
      name: username,
      email: cleanEmail,
      passwordHash: passwordHash,
      grade: grade,
      xp: profile.xp || 0,
      streak: profile.streak || 1,
      level: profile.level || 1,
      consent: consent || {
        termsAccepted: true,
        privacyAccepted: true,
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
      },
      createdAt: new Date().toISOString(),
      useCustomDb: profile.useCustomDb || false,
      supabaseUrl: profile.supabaseUrl,
      supabaseAnonKey: profile.supabaseAnonKey,
    };

    setProfile(updated);
    saveUserProfile(updated);
    syncUserProfileToSupabase(updated);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleInitialLogin} />;
  }

  const handleNavigate = (tab: string, subject?: SubjectId) => {
    if (subject) {
      setSelectedSubject(subject);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectGrade = (newGrade: GradeLevel) => {
    const updated = { ...profile, grade: newGrade };
    setProfile(updated);
    saveUserProfile(updated);
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveUserProfile(updated);
  };

  const handleLoginSuccess = (
    username: string, 
    email: string,
    passwordHash?: string,
    consent?: UserConsent,
    userId?: string,
    dbProfile?: UserProfile | null
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const registered = getRegisteredUsers();
    const existing = registered.find(u => (userId && u.id === userId) || (u.email && u.email.toLowerCase() === cleanEmail));

    const updated: UserProfile = dbProfile ? {
      ...dbProfile,
      passwordHash: passwordHash || dbProfile.passwordHash,
    } : existing ? {
      ...existing,
      id: userId || existing.id,
      username: username || existing.username || existing.name,
      name: username || existing.name,
      passwordHash: passwordHash || existing.passwordHash,
      consent: consent || existing.consent,
    } : {
      ...profile,
      id: userId || profile.id,
      username: username,
      name: username,
      email: cleanEmail,
      passwordHash: passwordHash || profile.passwordHash,
      consent: consent || profile.consent,
    };

    setProfile(updated);
    saveUserProfile(updated);
    setIsAuthenticated(true);
  };

  const handleDeleteAccount = () => {
    setIsAuthenticated(false);
    setProfile(getUserProfile());
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(t) => handleNavigate(t)}
        openSettings={() => setIsSettingsOpen(true)}
        openAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Area (Header + Scrollable Content) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <TopHeader
          profile={profile}
          openSettings={() => setIsSettingsOpen(true)}
          openAuth={() => setIsAuthOpen(true)}
          openSearchModal={() => setIsSearchOpen(true)}
          openOnboarding={() => setIsOnboardingOpen(true)}
          onNavigate={handleNavigate}
        />

        {/* Dynamic Viewport */}
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              profile={profile}
              onNavigate={handleNavigate}
              openOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}

          {activeTab === 'redacao' && (
            <RedacaoModule
              profile={profile}
              onProfileUpdated={(updated) => setProfile(updated)}
            />
          )}

          {activeTab === 'vestibulares' && (
            <VestibularesModule
              profile={profile}
              onProfileUpdated={(updated) => setProfile(updated)}
            />
          )}

          {activeTab === 'summary' && (
            <SummaryModule
              profile={profile}
              selectedSubject={selectedSubject}
            />
          )}

          {activeTab === 'mindmap' && (
            <MindmapModule
              profile={profile}
              selectedSubject={selectedSubject}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizModule
              profile={profile}
              selectedSubject={selectedSubject}
              onProfileUpdated={(updated) => setProfile(updated)}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleModule
              profile={profile}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardModule
              profile={profile}
            />
          )}

          {activeTab === 'saved' && (
            <SavedModule
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'history' && (
            <HistoryModule />
          )}

          {activeTab === 'profile' && (
            <ProfileModule
              profile={profile}
              onProfileUpdated={(updated) => setProfile(updated)}
              onLogout={handleDeleteAccount}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        profile={profile}
        onSelectGrade={handleSelectGrade}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onDeleteAccount={handleDeleteAccount}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        profile={profile}
        onLoginSuccess={handleLoginSuccess}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
      />

    </div>
  );
}
