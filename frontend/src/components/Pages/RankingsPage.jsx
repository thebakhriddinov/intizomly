import React, { useState, useEffect, useCallback, memo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitsContext';
import { storage } from '../../utils/storage';
import { audioManager } from '../../utils/audio';
import {
  IconTrophy,
  IconMedal,
  IconFlame,
  IconNoSugar,
  IconAlarm,
  IconWater,
  IconBook
} from '../Common/AppIcons';

// Helper to render high-end challenge vector emblem
function ChallengeEmblem({ id, size = 26 }) {
  if (id === 'ch_no_sugar') return <IconNoSugar size={size} />;
  if (id === 'ch_early_birds') return <IconAlarm size={size} color="#F59E0B" />;
  if (id === 'ch_water_master') return <IconWater size={size} color="#06B6D4" />;
  if (id === 'ch_reading_club') return <IconBook size={size} color="#3B82F6" />;
  return <IconTrophy size={size} />;
}

function RankingsPageComponent() {
  const { t } = useLanguage();
  const { triggerBanner } = useHabits();

  const [challenges, setChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState('ch_no_sugar');

  const loadChallenges = useCallback(() => {
    const list = storage.getChallenges();
    setChallenges(list);
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId) || challenges[0];

  const handleJoin = (challengeId) => {
    storage.joinChallenge(challengeId);
    loadChallenges();
    audioManager.playCheck();
    triggerBanner("🎉 Guruhga a'zo bo'ldingiz!", "Reyting jadvali ochildi. Natijalaringiz endi hisoblanadi!");
  };

  const handleLeave = (challengeId) => {
    storage.leaveChallenge(challengeId);
    loadChallenges();
    triggerBanner("Guruhdan chiqildi", "Reyting ma'lumotlari yashirildi.");
  };

  return (
    <div className="rankings-page">
      {/* 1. Hero Card */}
      <div className="rankings-hero-card">
        <div className="rankings-hero-top">
          <div className="rankings-pill-tag">
            <IconTrophy size={14} />
            <span>Guruhlar & Musobaqalar</span>
          </div>
          <span className="rankings-hero-subtag">2026 Intizom Ligasiga Xush Kelibsiz</span>
        </div>

        <h2 className="rankings-hero-title">Intizom Chempionati & Reytinglar</h2>
        <p className="rankings-hero-desc">
          Do'stlaringiz va intizomli insonlar bilan birgalikda musobaqalashish — odatlarni tark etmaslikning eng kuchli siri.
          Reyting natijalarini ko'rish uchun avval ushbu guruhga a'zo bo'ling!
        </p>
      </div>

      {/* 2. Challenge Selector Pills */}
      <div className="challenges-selector-row">
        {challenges.map((ch) => (
          <button
            key={ch.id}
            type="button"
            className={`challenge-select-chip ${selectedChallengeId === ch.id ? 'active' : ''}`}
            onClick={() => setSelectedChallengeId(ch.id)}
          >
            <div className="chip-emblem-wrap">
              <ChallengeEmblem id={ch.id} size={18} />
            </div>
            <span className="chip-title">{ch.title}</span>
            {ch.joined ? (
              <span className="chip-joined-badge">A'zo</span>
            ) : (
              <span className="chip-locked-badge">Qulf</span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Selected Challenge Details */}
      {selectedChallenge && (
        <div className="challenge-main-card">
          <div className="challenge-card-header">
            <div className="challenge-header-left">
              <div className="challenge-big-emblem">
                <ChallengeEmblem id={selectedChallenge.id} size={38} />
              </div>
              <div>
                <h3 className="challenge-heading">{selectedChallenge.title}</h3>
                <p className="challenge-description">{selectedChallenge.description}</p>
                <div className="challenge-meta-row">
                  <span className="meta-pill">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span>{selectedChallenge.participantsCount} nafar ishtirokchi</span>
                  </span>
                  <span className="meta-pill">
                    <IconTrophy size={14} />
                    <span>Mukofot: {selectedChallenge.badgeName}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="challenge-header-right">
              {selectedChallenge.joined ? (
                <div className="joined-action-box">
                  <span className="joined-status-badge">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#10B981" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Siz guruh a'zosisiz</span>
                  </span>
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
                  <IconTrophy size={16} />
                  <span>Guruhga A'zo Bo'lish</span>
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
                Ushbu musobaqa peshqadamlari va ishtirokchilar natijalarini ko'rish uchun yuqoridagi <strong>"Guruhga A'zo Bo'lish"</strong> tugmasini bosing!
              </p>
              <button
                type="button"
                className="btn-join-challenge-inline"
                onClick={() => handleJoin(selectedChallenge.id)}
              >
                <IconTrophy size={16} />
                <span>Guruhga Qo'shilish va Natijalarni Ochish</span>
              </button>
            </div>
          ) : (
            /* UNLOCKED STATE: FULL LEADERBOARD */
            <div className="leaderboard-unlocked-container">
              <div className="leaderboard-header-bar">
                <h4 className="leaderboard-title">Guruh Peshqadamlari (Top Natijalar)</h4>
                <span className="live-pill">
                  <span className="pulse-dot"></span>
                  <span>Jonli Natijalar</span>
                </span>
              </div>

              {/* Podium for top 3 */}
              <div className="podium-row">
                {selectedChallenge.leaderboard.slice(0, 3).map((item, idx) => {
                  const rankNum = idx + 1;
                  return (
                    <div
                      key={idx}
                      className={`podium-card podium-rank-${rankNum} ${item.isCurrent ? 'is-user-podium' : ''}`}
                    >
                      <div className="podium-medal-wrap">
                        <IconMedal rank={rankNum} size={28} />
                      </div>
                      <div
                        className="podium-avatar"
                        style={{ background: item.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                      >
                        {item.name?.[0] || 'U'}
                      </div>
                      <h5 className="podium-name">{item.name}</h5>
                      <span className="podium-streak">
                        <IconFlame size={14} />
                        <span>{item.streak} kun streak</span>
                      </span>
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
                          {row.rank <= 3 ? (
                            <IconMedal rank={row.rank} size={22} />
                          ) : (
                            <span className="rank-badge rank-num">#{row.rank}</span>
                          )}
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
                          <span className="table-streak-pill">
                            <IconFlame size={13} />
                            <span>{row.streak} kun</span>
                          </span>
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
