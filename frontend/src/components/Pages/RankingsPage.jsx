import React, { useState, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitsContext';
import { storage } from '../../utils/storage';

function RankingsPageComponent() {
  const { currentUser } = useAuth();
  const { t, lang } = useLanguage();
  const { triggerBanner } = useHabits();

  const [challenges, setChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);

  const loadChallenges = useCallback(() => {
    const list = storage.getChallenges();
    setChallenges(list);
    if (list.length > 0 && !selectedChallengeId) {
      setSelectedChallengeId(list[0].id);
    }
  }, [selectedChallengeId]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId) || challenges[0];

  const handleJoin = (challengeId) => {
    const updated = storage.joinChallenge(challengeId);
    setChallenges(updated);
    const ch = updated.find((c) => c.id === challengeId);
    triggerBanner("🎉 Guruhga muvaffaqiyatli qo'shildingiz!", `${ch?.title} chempionati natijalari ochildi! Intizomni saqlang! 🏆`);
  };

  const handleLeave = (challengeId) => {
    if (window.confirm("Haqiqatan ham ushbu guruh marafoni va reytingidan chiqmoqchimisiz?")) {
      const updated = storage.leaveChallenge(challengeId);
      setChallenges(updated);
      triggerBanner("ℹ️ Guruhdan chiqildi", "Siz ushbu chempionatdan chiqdingiz.");
    }
  };

  return (
    <div className="rankings-page">
      {/* 1. Header Banner */}
      <div className="rankings-hero-card">
        <div className="rankings-hero-content">
          <div className="rankings-pill-tag">
            <span>🏆 JAMOAVIY INTIZOM LIGALARI</span>
          </div>
          <h2 className="rankings-hero-title">Intizom Chempionati va Reytinglar</h2>
          <p className="rankings-hero-sub">
            Har bir guruhning o'ziga xos qat'iy qoidalari mavjud. Guruhga qo'shiling va haqiqiy natijalarni ko'ring!
          </p>
        </div>
      </div>

      {/* 2. Challenge Selector Pills */}
      <div className="challenge-selector-scroll">
        {challenges.map((ch) => (
          <button
            key={ch.id}
            type="button"
            className={`challenge-tab-chip ${selectedChallenge?.id === ch.id ? 'active' : ''}`}
            onClick={() => setSelectedChallengeId(ch.id)}
          >
            <span className="chip-emoji">{ch.emoji}</span>
            <span className="chip-title">{ch.title}</span>
            {ch.joined ? (
              <span className="chip-joined-badge">A'zo ✅</span>
            ) : (
              <span className="chip-locked-badge">🔒 Qulf</span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Selected Challenge Details */}
      {selectedChallenge && (
        <div className="challenge-main-card">
          <div className="challenge-card-header">
            <div className="challenge-header-left">
              <span className="challenge-big-emoji">{selectedChallenge.emoji}</span>
              <div>
                <h3 className="challenge-heading">{selectedChallenge.title}</h3>
                <p className="challenge-description">{selectedChallenge.description}</p>
                <div className="challenge-meta-row">
                  <span className="meta-pill">👥 {selectedChallenge.participantsCount} nafar ishtirokchi</span>
                  <span className="meta-pill">🏅 Mukofot: {selectedChallenge.badgeName}</span>
                </div>
              </div>
            </div>

            <div className="challenge-header-right">
              {selectedChallenge.joined ? (
                <div className="joined-action-box">
                  <span className="joined-status-badge">Siz guruh a'zosisiz ✅</span>
                  <button
                    type="button"
                    className="btn-leave-challenge"
                    onClick={() => handleLeave(selectedChallenge.id)}
                  >
                    Guruhdan chiqish
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-join-challenge"
                  onClick={() => handleJoin(selectedChallenge.id)}
                >
                  <span className="join-glow"></span>
                  <span>🚀 Guruhga A'zo Bo'lish</span>
                </button>
              )}
            </div>
          </div>

          {/* 4. LEADERBOARD: ONLY DISPLAY IF JOINED (Strict Requirement) */}
          {!selectedChallenge.joined ? (
            /* LOCKED STATE */
            <div className="leaderboard-locked-card">
              <div className="lock-icon-circle">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h4 className="locked-title">Reyting Natijalari Yashirin</h4>
              <p className="locked-desc">
                Ushbu guruhdagi qatnashchilar va peshqadamlar natijalarini ko'rish uchun yuqoridagi <strong>"Guruhga A'zo Bo'lish"</strong> tugmasini bosing!
              </p>
              <button
                type="button"
                className="btn-join-challenge-inline"
                onClick={() => handleJoin(selectedChallenge.id)}
              >
                Guruhga Qo'shilish va Natijalarni Ochish 🔓
              </button>
            </div>
          ) : (
            /* UNLOCKED STATE: FULL LEADERBOARD */
            <div className="leaderboard-unlocked-container">
              <div className="leaderboard-header-bar">
                <h4 className="leaderboard-title">Guruh Peshiqadamlari (Top Natijalar)</h4>
                <span className="live-pill">🔴 Jonli Natijalar</span>
              </div>

              {/* Podium for top 3 */}
              <div className="podium-row">
                {selectedChallenge.leaderboard.slice(0, 3).map((item, idx) => {
                  const placeColors = ['#f59e0b', '#94a3b8', '#cd7f32'];
                  const placeIcons = ['🥇', '🥈', '🥉'];
                  return (
                    <div
                      key={idx}
                      className={`podium-card podium-rank-${idx + 1} ${item.isCurrent ? 'is-user-podium' : ''}`}
                    >
                      <span className="podium-medal">{placeIcons[idx]}</span>
                      <div
                        className="podium-avatar"
                        style={{ background: item.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                      >
                        {item.name?.[0] || 'U'}
                      </div>
                      <h5 className="podium-name">{item.name}</h5>
                      <span className="podium-streak">🔥 {item.streak} kun streak</span>
                      <span className="podium-points">{item.points} ball</span>
                      {item.isCurrent && <span className="podium-you-tag">Siz</span>}
                    </div>
                  );
                })}
              </div>

              {/* Table of all ranks */}
              <div className="leaderboard-table-wrap">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>O'rin</th>
                      <th>Ishtirokchi</th>
                      <th>Streak</th>
                      <th>Bajarilish</th>
                      <th>Ball</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedChallenge.leaderboard.map((row) => (
                      <tr
                        key={row.rank}
                        className={`leaderboard-row ${row.isCurrent ? 'is-current-user-row' : ''}`}
                      >
                        <td className="rank-col">
                          <span className={`rank-badge rank-${row.rank}`}>
                            {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : `#${row.rank}`}
                          </span>
                        </td>
                        <td className="user-col">
                          <div className="user-cell">
                            <div
                              className="user-cell-avatar"
                              style={{ background: row.avatarGradient || 'linear-gradient(135deg, #6366f1, #a855f7)' }}
                            >
                              {row.name?.[0] || 'U'}
                            </div>
                            <div className="user-cell-info">
                              <span className="user-cell-name">{row.name}</span>
                              {row.isCurrent && <span className="user-cell-you-badge">Siz</span>}
                            </div>
                          </div>
                        </td>
                        <td className="streak-col">
                          <span className="table-streak-pill">🔥 {row.streak} kun</span>
                        </td>
                        <td className="rate-col">
                          <div className="completion-bar-wrap">
                            <div
                              className="completion-fill"
                              style={{ width: `${row.completionRate || 90}%` }}
                            ></div>
                            <span className="completion-text">{row.completionRate || 90}%</span>
                          </div>
                        </td>
                        <td className="points-col">
                          <strong className="points-num">{row.points}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const RankingsPage = memo(RankingsPageComponent);
