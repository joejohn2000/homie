import React from 'react';
import { CardDeck } from '../components/CardDeck';

export function DiscoverPage({ userId, setMatchCount, setAppError }) {
  return (
    <section className="flex w-full flex-col gap-8 fade-in items-center">
      <div className="flex flex-col gap-4 w-full text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Curated For You</p>
        <h1 className="font-serif text-5xl font-normal leading-[0.95] text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
          Find your people. <br/> Find your place.
        </h1>
      </div>
      <CardDeck userId={userId} setMatchCount={setMatchCount} setAppError={setAppError} />
    </section>
  );
}
