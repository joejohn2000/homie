import React from 'react';
import { LogOut } from 'lucide-react';
import { Navigation } from '../components/Navigation';

export function AppShell({ children, currentView, setView, matchCount, profile, onLogout }) {
  return (
    <div className="min-h-screen w-full px-4 pb-28 pt-0 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-[900] mx-auto mb-8 flex min-h-20 w-full max-w-6xl items-center justify-between border-b-2 border-[var(--border-dark)] bg-[var(--bg-main)]/95 py-4 backdrop-blur-md">
        <button
          className="group flex min-w-0 items-center gap-4 text-left"
          type="button"
          onClick={() => setView('discovery')}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] font-serif text-3xl font-normal text-[var(--bg-main)] transition-transform group-hover:rotate-12 group-hover:scale-105">
            H
          </span>
          <span className="flex min-w-0 flex-col">
            <strong className="truncate font-serif text-2xl leading-none text-[var(--text-primary)]">Homie.</strong>
            <small className="mt-1 truncate text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--text-secondary)]">
              {profile?.role ? `${profile.role} edition` : 'directory'}
            </small>
          </span>
        </button>

        <button
          className="flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border-2 border-[var(--border-dark)] bg-transparent px-5 text-xs font-bold uppercase tracking-widest text-[var(--border-dark)] transition hover:bg-[var(--border-dark)] hover:text-[var(--bg-main)] sm:px-6"
          type="button"
          onClick={onLogout}
        >
          <LogOut size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl">{children}</main>
      <Navigation currentView={currentView} setView={setView} matchCount={matchCount} />
    </div>
  );
}
