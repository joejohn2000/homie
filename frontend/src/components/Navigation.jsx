import React from 'react';
import { Compass, MessageCircle, User } from 'lucide-react';

export function Navigation({ currentView, setView, matchCount }) {
  return (
    <nav className="bottom-nav bg-[var(--bg-main)]">
      <button 
        className={`nav-item ${currentView === 'discovery' ? 'active' : ''}`}
        onClick={() => setView('discovery')}
      >
        <Compass size={24} strokeWidth={currentView === 'discovery' ? 2.5 : 2} />
        <span>Discover</span>
      </button>
      
      <button 
        className={`nav-item ${currentView === 'matches' ? 'active' : ''}`}
        onClick={() => setView('matches')}
      >
        <div className="icon-wrapper">
          <MessageCircle size={24} strokeWidth={currentView === 'matches' ? 2.5 : 2} />
          {matchCount > 0 && <span className="badge">{matchCount}</span>}
        </div>
        <span>Matches</span>
      </button>
      
      <button 
        className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
        onClick={() => setView('profile')}
      >
        <User size={24} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
        <span>Profile</span>
      </button>

      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 2rem);
          max-width: 420px;
          height: 4.5rem;
          display: flex;
          justify-content: space-evenly;
          align-items: center;
          padding: 0 0.5rem;
          z-index: 1000;
          border: 2px solid var(--border-dark);
          border-radius: 9999px;
          box-shadow: 0 12px 30px -10px rgba(10, 40, 24, 0.2);
        }
        .nav-item {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          min-width: 80px;
          height: calc(100% - 1rem);
          border-radius: 9999px;
          justify-content: center;
        }
        .nav-item:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }
        .nav-item span {
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .nav-item:hover {
          color: var(--text-primary);
        }
        .nav-item.active {
          color: var(--bg-main);
          background-color: var(--text-primary);
        }
        .icon-wrapper {
          position: relative;
        }
        .badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: var(--primary);
          color: var(--bg-main);
          font-size: 0.65rem;
          font-weight: 800;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 560px) {
          .bottom-nav {
            bottom: 1.5rem;
            max-width: 360px;
          }
          .nav-item {
            min-width: 64px;
          }
        }
      `}</style>
    </nav>
  );
}
