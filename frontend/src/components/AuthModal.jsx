import React, { useState, useEffect } from 'react';
import { Camera, Home, Lock, Mail, MapPin, User, ArrowRight, X, Sparkles } from 'lucide-react';

const HABIT_OPTIONS = ['clean', 'quiet', 'early-riser', 'night-owl', 'pet-friendly', 'social'];

function toggleValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function splitPlaces(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

export function AuthModal({
  initialMode = 'register',
  onClose,
  onRegister,
  onLogin,
  isSubmitting,
  errorMessage,
}) {
  const [mode, setMode] = useState(initialMode);
  const [imageError, setImageError] = useState('');
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    location: '',
    avatar: '',
    budgetMin: '1000',
    budgetMax: '1500',
    preferredPlaces: '',
    habits: []
  });

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const updateRegister = (field, value) => {
    setRegisterForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Upload an image file.');
      return;
    }

    if (file.size > 1_500_000) {
      setImageError('Use an image smaller than 1.5 MB.');
      return;
    }

    try {
      const dataUrl = await readImageFile(file);
      updateRegister('avatar', dataUrl);
      setImageError('');
    } catch (error) {
      setImageError(error.message);
    }
  };

  const preferredLocations = splitPlaces(registerForm.preferredPlaces);
  const registerDisabled = (
    isSubmitting ||
    !registerForm.name ||
    !registerForm.email ||
    registerForm.password.length < 6 ||
    !registerForm.role ||
    !registerForm.avatar ||
    preferredLocations.length === 0 ||
    registerForm.habits.length === 0 ||
    Number(registerForm.budgetMin) > Number(registerForm.budgetMax)
  );

  const loginDisabled = isSubmitting || !loginForm.email || !loginForm.password;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 fade-in">
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-[#0A2818]/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <section className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white/95 backdrop-blur-xl border border-white/60 p-6 sm:p-8 lg:p-10 shadow-2xl scale-in" style={{ scrollbarWidth: 'none' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          section::-webkit-scrollbar { display: none; }
        `}} />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--primary)] hover:text-white transition-all transform hover:scale-105 active:scale-95 z-20"
          aria-label="Close modal"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="text-center mb-6 mt-2">
          <h2 className="text-3xl font-bold font-serif text-[var(--text-primary)] flex justify-center items-center gap-2">
            Welcome to Homie <Sparkles className="text-[var(--primary)]" size={24} />
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Find your perfect living space and roommates.</p>
        </div>

        <div className="flex gap-2 rounded-2xl bg-[var(--bg-subtle)]/60 p-1.5 mb-8" role="tablist" aria-label="Authentication mode">
          {['register', 'login'].map((item) => (
            <button
              key={item}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold capitalize tracking-wide transition-all ${mode === item
                ? 'bg-white text-[var(--primary)] shadow-sm scale-[1.02]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/40'
                }`}
              onClick={() => setMode(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 font-medium text-rose-700 backdrop-blur-sm fade-in">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white shadow-sm">!</span>
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {mode === 'login' ? (
          <form
            className="flex flex-col gap-5 fade-in"
            onSubmit={(event) => {
              event.preventDefault();
              onLogin(loginForm);
            }}
          >
            <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
              Email Address
              <span className="flex min-h-[3.5rem] items-center gap-3 rounded-2xl border border-[var(--border-light)] bg-white/70 px-4 focus-within:bg-white focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[var(--primary)]/10 transition-all">
                <Mail size={20} className="shrink-0 text-[var(--text-secondary)]" />
                <input
                  className="min-w-0 flex-1 bg-transparent py-3 text-base font-medium outline-none placeholder:font-normal placeholder:text-[var(--text-secondary)]/70"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                />
              </span>
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
              Password
              <span className="flex min-h-[3.5rem] items-center gap-3 rounded-2xl border border-[var(--border-light)] bg-white/70 px-4 focus-within:bg-white focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[var(--primary)]/10 transition-all">
                <Lock size={20} className="shrink-0 text-[var(--text-secondary)]" />
                <input
                  className="min-w-0 flex-1 bg-transparent py-3 text-base font-medium outline-none placeholder:font-normal placeholder:text-[var(--text-secondary)]/70"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                />
              </span>
            </label>

            <button
              className="mt-4 flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-6 text-base font-bold text-white shadow-lg shadow-[var(--primary)]/20 hover:bg-[var(--primary-hover)] hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--primary)]/30 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 transition-all duration-300"
              type="submit"
              disabled={loginDisabled}
            >
              {isSubmitting ? 'Logging in...' : 'Sign In'}
              {!isSubmitting && <ArrowRight size={18} strokeWidth={2.5} />}
            </button>
          </form>
        ) : (
          <form
            className="flex flex-col gap-6 fade-in"
            onSubmit={(event) => {
              event.preventDefault();
              onRegister({
                name: registerForm.name,
                email: registerForm.email,
                password: registerForm.password,
                role: registerForm.role,
                location: registerForm.location,
                avatar: registerForm.avatar,
                habits: registerForm.habits,
                budgetMin: Number(registerForm.budgetMin),
                budgetMax: Number(registerForm.budgetMax),
                preferredLocations,
              });
            }}
          >
            {/* Photo & Basics Grid */}
            <section className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_120px] sm:items-start">
              <div className="flex flex-col gap-5 order-2 sm:order-1">
                <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  Full Name
                  <input
                    className="min-h-[3.5rem] rounded-2xl border border-[var(--border-light)] bg-white/70 px-4 py-3 text-base font-medium outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all placeholder:text-[var(--text-secondary)]/70"
                    placeholder="Jane Doe"
                    value={registerForm.name}
                    onChange={(event) => updateRegister('name', event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
                  Email Address
                  <input
                    className="min-h-[3.5rem] rounded-2xl border border-[var(--border-light)] bg-white/70 px-4 py-3 text-base font-medium outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all placeholder:text-[var(--text-secondary)]/70"
                    type="email"
                    placeholder="jane@example.com"
                    autoComplete="email"
                    value={registerForm.email}
                    onChange={(event) => updateRegister('email', event.target.value)}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-2 order-1 sm:order-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Profile Photo</span>
                <label className="group relative flex aspect-square w-full sm:w-[120px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[var(--border-light)] bg-white/50 text-center transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)]/5">
                  {registerForm.avatar ? (
                    <img className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" src={registerForm.avatar} alt="Uploaded profile preview" />
                  ) : (
                    <span className="flex flex-col items-center gap-2 px-3 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors">
                      <div className="rounded-full bg-[var(--bg-subtle)] p-3 group-hover:bg-[var(--primary)]/10 transition-colors">
                        <Camera size={24} strokeWidth={2} />
                      </div>
                      <span className="text-xs font-semibold tracking-wide">Upload</span>
                    </span>
                  )}
                  <input className="sr-only" type="file" accept="image/*" onChange={handlePhotoUpload} />
                </label>
                {imageError && <p className="text-xs font-semibold text-rose-500 mt-1">{imageError}</p>}
              </div>
            </section>

            <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
              Password
              <input
                className="min-h-[3.5rem] rounded-2xl border border-[var(--border-light)] bg-white/70 px-4 py-3 text-base font-medium outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all placeholder:text-[var(--text-secondary)]/70"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={registerForm.password}
                onChange={(event) => updateRegister('password', event.target.value)}
              />
              <span className="text-xs font-medium text-[var(--text-secondary)] ml-1">Use at least 6 characters.</span>
            </label>

            {/* Role Selection */}
            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-semibold text-[var(--text-primary)] mb-1">I am...</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: 'seeker', label: 'Looking for a room', icon: User },
                  { value: 'host', label: 'Offering a room', icon: Home }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    className={`group flex min-h-[4rem] items-center gap-3 rounded-2xl border-2 p-4 font-semibold transition-all duration-300 ${registerForm.role === value
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)] shadow-sm ring-4 ring-[var(--primary)]/10'
                      : 'border-[var(--border-light)] bg-white/60 text-[var(--text-secondary)] hover:border-[var(--primary)]/40 hover:bg-white hover:text-[var(--text-primary)] hover:shadow-sm'
                      }`}
                    type="button"
                    onClick={() => updateRegister('role', value)}
                  >
                    <div className={`p-2 rounded-xl transition-colors ${registerForm.role === value ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]'}`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
                Current location <span className="text-xs font-normal text-[var(--text-secondary)]">(optional)</span>
                <span className="flex min-h-[3.5rem] items-center gap-2 rounded-2xl border border-[var(--border-light)] bg-white/70 px-4 focus-within:bg-white focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[var(--primary)]/10 transition-all">
                  <MapPin size={18} className="shrink-0 text-[var(--text-secondary)]" />
                  <input
                    className="min-w-0 flex-1 bg-transparent py-3 text-base font-medium outline-none placeholder:font-normal placeholder:text-[var(--text-secondary)]/70"
                    placeholder="e.g. Manhattan"
                    value={registerForm.location}
                    onChange={(event) => updateRegister('location', event.target.value)}
                  />
                </span>
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
                Preferred areas
                <input
                  className="min-h-[3.5rem] rounded-2xl border border-[var(--border-light)] bg-white/70 px-4 py-3 text-base font-medium outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all placeholder:text-[var(--text-secondary)]/70"
                  placeholder="Brooklyn, Soho, Queens"
                  value={registerForm.preferredPlaces}
                  onChange={(event) => updateRegister('preferredPlaces', event.target.value)}
                />
                <span className="text-xs font-medium text-[var(--text-secondary)] ml-1">Separate with commas.</span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
                Budget Min ($)
                <input
                  className="min-h-[3.5rem] rounded-2xl border border-[var(--border-light)] bg-white/70 px-4 py-3 text-base font-medium outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all"
                  type="number"
                  min="0"
                  value={registerForm.budgetMin}
                  onChange={(event) => updateRegister('budgetMin', event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[var(--text-primary)]">
                Budget Max ($)
                <input
                  className="min-h-[3.5rem] rounded-2xl border border-[var(--border-light)] bg-white/70 px-4 py-3 text-base font-medium outline-none focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition-all"
                  type="number"
                  min="0"
                  value={registerForm.budgetMax}
                  onChange={(event) => updateRegister('budgetMax', event.target.value)}
                />
              </label>
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className="text-sm font-semibold text-[var(--text-primary)] mb-1">Living Style Tags</legend>
              <div className="flex flex-wrap gap-2.5">
                {HABIT_OPTIONS.map((habit) => {
                  const isSelected = registerForm.habits.includes(habit);
                  return (
                    <button
                      key={habit}
                      className={`min-h-[2.5rem] rounded-xl border px-4 text-sm font-medium capitalize transition-all duration-300 ${isSelected
                        ? 'border-transparent bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/30 transform scale-105'
                        : 'border-[var(--border-light)] bg-white/60 text-[var(--text-secondary)] hover:border-[var(--primary)]/30 hover:bg-white hover:text-[var(--text-primary)] hover:shadow-sm'
                        }`}
                      type="button"
                      onClick={() => updateRegister('habits', toggleValue(registerForm.habits, habit))}
                    >
                      {habit.replace('-', ' ')}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <button
              className="mt-4 flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-6 text-base font-bold text-white shadow-lg shadow-[var(--primary)]/20 hover:bg-[var(--primary-hover)] hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--primary)]/30 active:translate-y-0 disabled:pointer-events-none disabled:opacity-50 transition-all duration-300"
              type="submit"
              disabled={registerDisabled}
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
              {!isSubmitting && <ArrowRight size={18} strokeWidth={2.5} />}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
