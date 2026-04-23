import React from 'react';
import { Matches } from '../components/Matches';

export function MatchesPage({ userId, onMatchCountChange }) {
  return (
    <section className="w-full max-w-3xl mx-auto flex flex-col gap-6 fade-in">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Connections</p>
        <h1 className="font-serif text-5xl font-normal leading-[0.95] text-[var(--text-primary)]">
          Your Matches.
        </h1>
      </div>
      <Matches userId={userId} onMatchCountChange={onMatchCountChange} />
    </section>
  );
}
