import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, X, MapPin, Briefcase, Star, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

export function CardDeck({ userId, setMatchCount, setAppError }) {
  const MotionDiv = motion.div;
  const [cards, setCards] = useState([]);
  const [lastDirection, setLastDirection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    let isCancelled = false;

    async function loadCards() {
      if (!userId) {
        return;
      }

      setLoading(true);

      try {
        const response = await api.discover(userId);
        if (!isCancelled) {
          setCards(response.cards);
          setAppError('');
        }
      } catch (error) {
        if (!isCancelled) {
          setAppError(error.message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadCards();

    return () => {
      isCancelled = true;
    };
  }, [userId, setAppError]);

  const swiped = async (direction, item) => {
    setLastDirection(direction);

    try {
      const response = await api.swipe({
        userId,
        targetId: item.id,
        targetType: item.type,
        decision: direction === 'right' ? 'like' : 'pass'
      });

      setMatchCount(response.newBadgeCount);
      setActionMessage(response.matchCreated ? "It's a match." : direction === 'right' ? 'Saved to your match directory.' : 'Skipped.');
      setAppError('');
    } catch (error) {
      setAppError(error.message);
      return;
    }

    setTimeout(() => {
      setCards((prev) => prev.filter((candidate) => candidate.id !== item.id));
    }, 200);
  };

  return (
    <div className="deck-container stagger-2">
      {actionMessage && <div className="deck-status scale-in">{actionMessage}</div>}
      <div className="card-stack">
        {loading && <div className="empty-state fade-in"><RefreshCw size={32} className="animate-spin text-[var(--primary)] mx-auto mb-4" /><p className="font-bold text-lg">Curating recommendations...</p></div>}
        <AnimatePresence>
          {!loading && cards.map((item, index) => (
            <MotionDiv
              key={item.id}
              className="swipe-card"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_event, { offset }) => {
                const swipe = offset.x;
                if (swipe > 100) swiped('right', item);
                else if (swipe < -100) swiped('left', item);
              }}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: 0,
                zIndex: cards.length - index,
                rotate: 0
              }}
              exit={{ 
                x: lastDirection === 'right' ? 1000 : -1000,
                opacity: 0,
                rotate: lastDirection === 'right' ? 45 : -45,
                transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }
              }}
              whileTap={{ scale: 0.95, rotate: lastDirection === 'left' ? -2 : 2 }}
            >
              <div className="card-image-wrapper">
                <div className="card-img-container">
                  <img src={item.image} alt={item.name} className="card-img" />
                  <div className="compat-badge">
                     <Star size={12} fill="currentColor" />
                     {item.compat}% Match
                  </div>
                </div>
                
                <div className="card-info-container">
                  <div className="card-info">
                    <h3 className="font-serif">{item.name}{item.age ? `, ${item.age}` : ''}</h3>
                    <div className="info-row">
                      <MapPin size={16} strokeWidth={2.5} className="text-[var(--primary)]" />
                      <span className="font-medium text-[var(--text-primary)]">{item.location}</span>
                    </div>
                    {item.job && (
                      <div className="info-row">
                        <Briefcase size={16} strokeWidth={2.5} className="text-[var(--text-secondary)]" />
                        <span className="font-medium">{item.job}</span>
                      </div>
                    )}
                    {item.rent && (
                      <div className="info-row highlight mt-1">
                        <span>{item.rent}</span>
                      </div>
                    )}
                    <div className="tag-list">
                      {item.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </MotionDiv>
          ))}
        </AnimatePresence>

        {!loading && cards.length === 0 && (
          <div className="empty-state fade-in p-8 rounded-3xl border-2 border-[var(--border-dark)] bg-white shadow-[8px_8px_0px_var(--border-dark)] max-w-sm w-full mx-auto">
            <Heart size={48} className="icon-pulse mx-auto" />
            <h3 className="font-serif text-4xl mt-4 mb-2 text-[var(--text-primary)]">All caught up.</h3>
            <p className="font-medium text-[var(--text-secondary)]">Your curated directory pool is empty for now. Check back later for more.</p>
            <button className="btn-secondary mt-6" onClick={async () => {
              const response = await api.discover(userId);
              setCards(response.cards);
            }}>Refresh Directory</button>
          </div>
        )}
      </div>

      <div className="controls">
        <button className="btn-circle x" onClick={() => cards.length > 0 && swiped('left', cards[0])} disabled={loading}>
          <X size={28} strokeWidth={3} />
        </button>
        <button className="btn-circle heart" onClick={() => cards.length > 0 && swiped('right', cards[0])} disabled={loading}>
          <Heart size={28} fill="currentColor" />
        </button>
      </div>

      <style>{`
        .deck-container {
          width: 100%;
          min-height: 680px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          position: relative;
        }
        .deck-status {
          margin-bottom: 1rem;
          padding: 0.75rem 1.5rem;
          border-radius: 999px;
          border: 2px solid var(--border-dark);
          color: var(--text-primary);
          background: var(--warning);
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 4px 4px 0px var(--border-dark);
          z-index: 50;
        }
        .card-stack {
          position: relative;
          width: 100%;
          height: 560px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .swipe-card {
          position: absolute;
          width: 100%;
          max-width: 380px;
          height: 100%;
          cursor: grab;
          touch-action: none;
        }
        .swipe-card:active {
          cursor: grabbing;
        }
        .card-image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 8px 8px 0px var(--border-dark);
          border: 2px solid var(--border-dark);
          background: var(--bg-card);
          display: flex;
          flex-direction: column;
        }
        .card-img-container {
          flex: 1;
          min-height: 0;
          position: relative;
        }
        .card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-bottom: 2px solid var(--border-dark);
        }
        .compat-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--primary);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          z-index: 10;
          border: 2px solid var(--border-dark);
          box-shadow: 2px 2px 0px var(--border-dark);
        }
        .card-info-container {
          background: var(--bg-card);
          padding: 1.5rem;
          color: var(--text-primary);
          flex-shrink: 0;
        }
        .card-info {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .card-info h3 {
          font-size: 2.5rem;
          font-weight: 400;
          line-height: 0.9;
          margin-bottom: 0.25rem;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .info-row.highlight {
          color: var(--text-primary);
          font-weight: 800;
          font-size: 1.25rem;
        }
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.75rem;
        }
        .tag {
          background: var(--bg-subtle);
          color: var(--text-primary);
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid var(--border-light);
        }
        .controls {
          display: flex;
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .btn-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 2px solid var(--border-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 4px 4px 0px var(--border-dark);
        }
        .btn-circle:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          box-shadow: none;
          transform: translateY(4px);
        }
        .btn-circle:not(:disabled):hover {
          transform: translateY(-4px);
          box-shadow: 6px 8px 0px var(--border-dark);
        }
        .btn-circle:not(:disabled):active {
          transform: translateY(4px);
          box-shadow: 0px 0px 0px var(--border-dark);
        }
        .btn-circle.x {
          background: var(--bg-card);
          color: var(--text-primary);
        }
        .btn-circle.heart {
          background: var(--primary);
          color: white;
        }
        .empty-state {
          text-align: center;
          color: var(--text-secondary);
        }
        .icon-pulse {
          color: var(--primary);
          margin-bottom: 1rem;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .btn-secondary {
          background: var(--text-primary);
          border: 2px solid var(--border-dark);
          color: var(--bg-main);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.85rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s;
          box-shadow: 4px 4px 0px var(--border-light);
        }
        .btn-secondary:active {
          transform: translateY(2px);
          box-shadow: 2px 2px 0px var(--border-light);
        }
        @media (max-width: 560px) {
          .deck-container {
            min-height: 590px;
          }
          .swipe-card {
            max-width: 100%;
            height: min(520px, 68vh);
          }
          .controls {
            gap: 1rem;
            margin-top: 1.5rem;
          }
          .btn-circle {
            width: 64px;
            height: 64px;
          }
        }
      `}</style>
    </div>
  );
}
