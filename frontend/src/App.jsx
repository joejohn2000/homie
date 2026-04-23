import React, { useEffect, useState } from 'react';
import { AppShell } from './pages/AppShell';
import { LandingPage } from './pages/LandingPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { MatchesPage } from './pages/MatchesPage';
import { ProfilePage } from './pages/ProfilePage';
import { api } from './lib/api';
import './index.css';

const STORAGE_KEY = 'homie.session';

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function App() {
  const [session, setSession] = useState(() => readStoredSession());
  const [view, setView] = useState(() => (readStoredSession() ? 'discovery' : 'onboarding'));
  const [profile, setProfile] = useState(() => readStoredSession()?.profile ?? null);
  const [matchCount, setMatchCount] = useState(() => readStoredSession()?.matchCount ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [appError, setAppError] = useState('');
  const userId = session?.userId ?? null;

  useEffect(() => {
    if (!session) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...session,
        profile,
        matchCount
      })
    );
  }, [session, profile, matchCount]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let isCancelled = false;

    async function hydrateSession() {
      try {
        const [profileResponse, matchesResponse] = await Promise.all([
          api.profile(userId),
          api.matches(userId)
        ]);

        if (!isCancelled) {
          setProfile(profileResponse.profile);
          setMatchCount(matchesResponse.total);
        }
      } catch (error) {
        if (!isCancelled) {
          setAppError(error.message);
        }
      }
    }

    hydrateSession();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  const handleOnboardingComplete = async (onboardingProfile) => {
    setIsSubmitting(true);
    setAppError('');

    try {
      const response = await api.onboard(onboardingProfile);
      setSession({
        userId: response.userId,
        token: response.token
      });
      setProfile(response.profile);
      setMatchCount(response.matchCount);
      setView('discovery');
    } catch (error) {
      setAppError(error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (credentials) => {
    setIsSubmitting(true);
    setAppError('');

    try {
      const response = await api.login(credentials);
      setSession({
        userId: response.userId,
        token: response.token
      });
      setProfile(response.profile);
      setMatchCount(response.matchCount);
      setView('discovery');
    } catch (error) {
      setAppError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async (payload) => {
    if (!userId) {
      return;
    }

    setIsSavingProfile(true);
    setAppError('');

    try {
      const response = await api.updateProfile({
        userId,
        ...payload
      });
      setProfile(response.profile);
    } catch (error) {
      setAppError(error.message);
      throw error;
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setProfile(null);
    setMatchCount(0);
    setView('onboarding');
    setAppError('');
  };

  if (!session) {
    return (
      <div className="app-container">
        <LandingPage
          onRegister={handleOnboardingComplete}
          onLogin={handleLogin}
          isSubmitting={isSubmitting}
          errorMessage={appError}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <AppShell
        currentView={view}
        setView={setView}
        matchCount={matchCount}
        profile={profile}
        onLogout={handleLogout}
      >
        {appError && <div className="app-alert">{appError}</div>}
        {view === 'discovery' && (
          <DiscoverPage
            userId={userId}
            setMatchCount={setMatchCount}
            setAppError={setAppError}
          />
        )}
        {view === 'matches' && (
          <MatchesPage
            userId={userId}
            onMatchCountChange={setMatchCount}
          />
        )}
        {view === 'profile' && (
          <ProfilePage
            profile={profile}
            onSaveProfile={handleSaveProfile}
            isSaving={isSavingProfile}
          />
        )}
      </AppShell>

      <style>{`
        .app-alert {
          width: 100%;
          margin-top: 1rem;
          padding: 0.85rem 1rem;
          border-radius: 8px;
          background: rgba(244, 63, 94, 0.14);
          color: #fecdd3;
          border: 1px solid rgba(244, 63, 94, 0.28);
        }
      `}</style>
    </div>
  );
}

export default App;
