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
import { OnboardingModal } from '@/components/OnboardingModal';
import { SettingsModal } from '@/components/SettingsModal';
import { AuthModal } from '@/components/AuthModal';
import { SearchModal } from '@/components/SearchModal';
import { LoginPage } from '@/components/LoginPage';

import { UserProfile, SubjectId, GradeLevel, UserConsent, APP_VERSION } from '@/types';
import { getUserProfile, saveUserProfile, getRegisteredUsers } from '@/lib/storage';

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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#051838] text-white font-sans">
        <div className="animate-pulse font-bold text-lg">Carregando EstudaAI...</div>
      </div>
    );
  }

  // Handle SAS Login Screen Success (with LGPD Username and Consent)
  const handleInitialLogin = (
    username: string, 
    email: string, 
    grade: GradeLevel,
    passwordHash?: string,
    consent?: UserConsent
  ) => {
    const registered = getRegisteredUsers();
    const existing = registered.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

    const updated: UserProfile = existing ? {
      ...existing,
      username: username || existing.username || existing.name,
      name: username || existing.name,
      grade: grade || existing.grade,
      passwordHash: passwordHash || existing.passwordHash,
      consent: consent || existing.consent,
    } : {
      id: profile.id || ('user_' + Date.now().toString(36)),
      username: username,
      name: username,
      email: email,
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
    setIsAuthenticated(true);
  };

  // If not authenticated, render SAS Inspired LoginPage
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
    consent?: UserConsent
  ) => {
    const registered = getRegisteredUsers();
    const existing = registered.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

    const updated: UserProfile = existing ? {
      ...existing,
      username: username || existing.username || existing.name,
      name: username || existing.name,
      passwordHash: passwordHash || existing.passwordHash,
      consent: consent || existing.consent,
    } : {
      ...profile,
      username: username,
      name: username,
      email: email,
      passwordHash: passwordHash || profile.passwordHash,
      consent: consent || profile.consent,
    };

    setProfile(updated);
    saveUserProfile(updated);
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

          {activeTab === 'history' && (
            <HistoryModule
              onOpenSummary={() => setActiveTab('summary')}
              onOpenMindmap={() => setActiveTab('mindmap')}
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
