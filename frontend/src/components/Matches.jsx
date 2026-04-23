import React from 'react';
import { MessageCircle, Phone, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

function formatTime(timestamp) {
  const diffInMinutes = Math.max(1, Math.round((Date.now() - new Date(timestamp).getTime()) / 60000));
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.round(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.round(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export function Matches({ userId, onMatchCountChange }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    let isCancelled = false;

    async function loadMatches() {
      if (!userId) {
        return;
      }

      try {
        setLoading(true);
        const response = await api.matches(userId);
        if (!isCancelled) {
          setMatches(response.matches);
          onMatchCountChange(response.total);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError.message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadMatches();

    return () => {
      isCancelled = true;
    };
  }, [userId, onMatchCountChange]);

  const handleAction = async (match) => {
    try {
      if (match.type === 'place') {
        await api.createViewingRequest({
          conversationId: match.conversationId,
          listingId: match.targetId ?? match.id,
          requesterUserId: userId,
          proposedSlots: [
            {
              startAt: '2026-04-25T18:00:00Z',
              endAt: '2026-04-25T18:30:00Z'
            }
          ],
          note: 'Requested through the Homie matches screen.'
        });
        setStatus(`Viewing request sent for ${match.name}.`);
      } else {
        await api.sendMessage({
          conversationId: match.conversationId,
          senderUserId: userId,
          messageText: `Hey ${match.name.split(' ')[0]}, I'd love to connect on Homie.`
        });
        setStatus(`Intro message sent to ${match.name}.`);
      }
    } catch (actionError) {
      setError(actionError.message);
    }
  };

  return (
    <div className="matches-container fade-in">
      {status && <div className="status-banner scale-in">{status}</div>}
      {error && <div className="error-banner scale-in">{error}</div>}

      <div className="matches-list">
        {loading && <p className="font-bold text-[var(--text-secondary)]">Loading matches...</p>}
        {!loading && matches.map((match, index) => (
          <div key={match.id} className={`match-item stagger-${Math.min(index + 1, 4)}`}>
            <img src={match.image} alt={match.name} className="match-avatar" />
            <div className="match-content">
              <h4>{match.name}</h4>
              <p className="last-msg">{match.lastMsg}</p>
              <span className="time">{formatTime(match.time)}</span>
            </div>
            <div className="match-actions">
              <button className="icon-btn-small" onClick={() => handleAction(match)}>
                <MessageCircle size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ))}
        {!loading && matches.length === 0 && (
          <div className="match-item empty">
            <div className="match-content p-4 text-center w-full">
              <h4 className="mx-auto">No active matches</h4>
              <p className="last-msg mx-auto">Swipe right on strong candidates to build your directory.</p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .matches-container {
          width: 100%;
          padding-bottom: 2rem;
        }
        .matches-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .status-banner,
        .error-banner {
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 2px solid var(--border-dark);
          box-shadow: 4px 4px 0px var(--border-dark);
        }
        .status-banner {
          background: #4ade80;
          color: var(--border-dark);
        }
        .error-banner {
          background: #f43f5e;
          color: white;
        }
        .match-item {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          cursor: pointer;
          border: 2px solid var(--border-light);
          border-radius: 20px;
          background: var(--bg-card);
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .match-item:hover {
          border-color: var(--border-dark);
          transform: translateY(-4px);
          box-shadow: 4px 4px 0px var(--border-light);
        }
        .match-item.empty {
          border-style: dashed;
          background: transparent;
          cursor: default;
        }
        .match-item.empty:hover {
          transform: none;
          box-shadow: none;
          border-color: var(--border-light);
        }
        .match-avatar {
          width: 72px;
          height: 72px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid var(--border-dark);
        }
        .match-content {
          flex: 1;
        }
        .match-content h4 {
          font-family: 'Instrument Serif', serif;
          font-size: 2.2rem;
          font-weight: 400;
          line-height: 1;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }
        .last-msg {
          font-size: 0.95rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 280px;
        }
        .time {
          font-size: 0.65rem;
          color: var(--primary);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: block;
          margin-top: 0.25rem;
        }
        .icon-btn-small {
          background: var(--primary);
          border: 2px solid var(--border-dark);
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
          box-shadow: 2px 2px 0px var(--border-dark);
        }
        .icon-btn-small:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 4px 4px 0px var(--border-dark);
        }
        .icon-btn-small:active {
          transform: translateY(2px) scale(0.95);
          box-shadow: 0px 0px 0px var(--border-dark);
        }
        @media (max-width: 560px) {
          .match-item {
            padding: 0.75rem;
            gap: 1rem;
          }
          .match-avatar {
            width: 60px;
            height: 60px;
          }
          .last-msg {
            max-width: 180px;
          }
        }
      `}</style>
    </div>
  );
}
