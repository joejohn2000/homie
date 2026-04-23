import React, { useState } from 'react';
import { ArrowRight, Sparkles, Home, User } from 'lucide-react';

const HABIT_OPTIONS = ['Clean', 'Quiet', 'Early Riser', 'Night Owl', 'Pet Friendly', 'Social'];

export function Onboarding({ onComplete, isSubmitting, errorMessage, helperCopy, compact = false }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    name: '',
    role: '', // 'seeker' or 'host'
    budget: '',
    habits: []
  });

  const steps = [
    {
      title: "Welcome to Homie",
      content: "Let's find you the perfect match. First, what's your name?",
      input: (
        <input
          type="text"
          placeholder="Type your name..."
          className="onboarding-input"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
        />
      )
    },
    {
      title: "Your Goal",
      content: "Are you looking for a room or do you have a room to offer?",
      input: (
        <div className="role-options">
          <button 
            className={`role-card ${profile.role === 'seeker' ? 'active' : ''}`}
            onClick={() => setProfile({ ...profile, role: 'seeker' })}
          >
            <User size={32} />
            <span>Looking for a Room</span>
          </button>
          <button 
            className={`role-card ${profile.role === 'host' ? 'active' : ''}`}
            onClick={() => setProfile({ ...profile, role: 'host' })}
          >
            <Home size={32} />
            <span>Offering a Room</span>
          </button>
        </div>
      )
    },
    {
      title: "Budget Range",
      content: "What is your monthly budget range?",
      input: (
        <select 
          className="onboarding-input"
          value={profile.budget}
          onChange={(e) => setProfile({ ...profile, budget: e.target.value })}
        >
          <option value="">Select range...</option>
          <option value="500-1000">$500 - $1000</option>
          <option value="1000-1500">$1000 - $1500</option>
          <option value="1500+">$1500+</option>
        </select>
      )
    },
    {
      title: "Lifestyle Fit",
      content: "Pick a few traits that matter for your shared living style.",
      input: (
        <div className="habit-options">
          {HABIT_OPTIONS.map((habit) => {
            const normalized = habit.toLowerCase().replace(/\s+/g, '-');
            const active = profile.habits.includes(normalized);
            return (
              <button
                key={habit}
                type="button"
                className={`habit-chip ${active ? 'active' : ''}`}
                onClick={() => {
                  setProfile((current) => ({
                    ...current,
                    habits: active
                      ? current.habits.filter((item) => item !== normalized)
                      : [...current.habits, normalized]
                  }));
                }}
              >
                {habit}
              </button>
            );
          })}
        </div>
      )
    }
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      try {
        await onComplete(profile);
      } catch {
        // parent handles the visible error state
      }
    }
  };

  return (
    <div className="onboarding-container fade-in">
      <div className={`${compact ? '' : 'glass'} onboarding-card`}>
        <div className="step-indicator">
          {steps.map((_, i) => (
            <div key={i} className={`dot ${i === step ? 'active' : ''}`} />
          ))}
        </div>
        
        <h2>{steps[step].title} <Sparkles size={20} className="icon-sparkle" /></h2>
        <p>{steps[step].content}</p>

        <div className="input-wrapper">
          {steps[step].input}
        </div>

        {helperCopy && <p className="helper-copy">{helperCopy}</p>}
        {errorMessage && <div className="error-copy">{errorMessage}</div>}

        <button 
          className="btn-primary" 
          onClick={handleNext}
          disabled={
            isSubmitting ||
            (step === 0 && !profile.name) ||
            (step === 1 && !profile.role) ||
            (step === 2 && !profile.budget)
          }
        >
          {isSubmitting ? 'Creating Profile...' : step === steps.length - 1 ? 'Start Swiping' : 'Continue'}
          <ArrowRight size={18} />
        </button>
      </div>

      <style>{`
        .onboarding-container {
          width: 100%;
          text-align: center;
        }
        .onboarding-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
        }
        .step-indicator {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 8px;
          background: var(--glass-border);
          transition: var(--transition-smooth);
        }
        .dot.active {
          background: var(--primary);
          width: 24px;
          border-radius: 4px;
        }
        h2 {
          font-size: 1.75rem;
          font-weight: 700;
        }
        p {
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .onboarding-input {
          width: 100%;
          padding: 1rem;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: var(--transition-smooth);
        }
        .onboarding-input:focus {
          border-color: var(--primary);
        }
        .role-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .role-card {
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          padding: 1.5rem;
          border-radius: 8px;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .role-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
        }
        .role-card.active {
          border-color: var(--primary);
          background: rgba(47, 191, 113, 0.12);
          color: var(--primary);
        }
        .habit-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
        }
        .habit-chip {
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .habit-chip.active {
          border-color: var(--primary);
          color: white;
          background: rgba(47, 191, 113, 0.22);
        }
        .helper-copy {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .error-copy {
          padding: 0.85rem 1rem;
          border-radius: 8px;
          background: rgba(244, 63, 94, 0.14);
          border: 1px solid rgba(244, 63, 94, 0.28);
          color: #fecdd3;
          font-size: 0.92rem;
        }
        .btn-primary {
          background: var(--primary);
          color: #07110b;
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .btn-primary:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(47, 191, 113, 0.28);
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .icon-sparkle {
          color: var(--warning);
          display: inline;
          vertical-align: middle;
        }
        @media (max-width: 560px) {
          .onboarding-card {
            padding: 1rem;
          }
          .role-options {
            grid-template-columns: 1fr;
          }
          h2 {
            font-size: 1.45rem;
          }
        }
      `}</style>
    </div>
  );
}
