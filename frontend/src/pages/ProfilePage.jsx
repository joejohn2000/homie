import React from 'react';
import { Profile } from '../components/Profile';

export function ProfilePage({ profile, onSaveProfile, isSaving }) {
  return (
    <section className="w-full max-w-4xl mx-auto flex flex-col gap-6 fade-in">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]">Identity</p>
        <h1 className="font-serif text-5xl font-normal leading-[0.95] text-[var(--text-primary)]">
          Your Profile.
        </h1>
      </div>
      <Profile profile={profile} onSaveProfile={onSaveProfile} isSaving={isSaving} />
    </section>
  );
}
