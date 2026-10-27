import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitsContext';
import { storage } from '../../utils/storage';
import { audioManager } from '../../utils/audio';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { AddChallengeModal } from '../Modals/AddChallengeModal';
import {
  IconTrophy,
  IconMedal,
  IconFlame,
  IconNoSugar,
  IconAlarm,
  IconWater,
  IconBook,
  IconPlus,
  IconTrash,
  IconSearch,
  IconLock,
  IconCheck
} from '../Common/AppIcons';

// Helper to render high-end challenge vector emblem
function ChallengeEmblem({ id, emoji, size = 26 }) {
  if (id === 'ch_no_sugar') return <IconNoSugar size={size} />;
  if (id === 'ch_early_birds') return <IconAlarm size={size} color="#F59E0B" />;
  if (id === 'ch_water_master') return <IconWater size={size} color="#06B6D4" />;
  if (id === 'ch_reading_club') return <IconBook size={size} color="#3B82F6" />;
  if (emoji) {
    return <span style={{ fontSize: `${Math.round(size * 0.9)}px`, lineHeight: 1 }}>{emoji}</span>;
  }
  return <IconTrophy size={size} />;
}

function RankingsPageComponent() {
  const { currentUser, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { triggerBanner, addToast } = useHabits();

  const [challenges, setChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState('ch_no_sugar');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'joined' | 'available'

  const joinedCount = useMemo(() => {
    return challenges.filter(c => c.joined).length;
  }, [challenges]);

  const filteredChallenges = useMemo(() => {
    return challenges.filter(ch => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        ch.title.toLowerCase().includes(q) ||
        (ch.description || '').toLowerCase().includes(q) ||
        (ch.badgeName || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filterMode === 'joined') return ch.joined;
      if (filterMode === 'available') return !ch.joined;
      return true;
    });
  }, [challenges, searchQuery, filterMode]);

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    const storedChallenges = storage.getChallenges();

    // Fetch REAL database users from Supabase
    let realLeaderboard = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role, avatar_gradient');

        const { data: completions } = await supabase
          .from('habit_completions')
          .select('user_id, date_key');

        if (Array.isArray(profiles) && profiles.length > 0) {
          const completionsByUser = {};
          (completions || []).forEach(c => {
            if (!completionsByUser[c.user_id]) completionsByUser[c.user_id] = new Set();
            completionsByUser[c.user_id].add(c.date_key);
          });

          realLeaderboard = profiles.map(p => {
            const activeDays = (completionsByUser[p.id] || new Set()).size;
            const streak = activeDays; // Real streak / days completed
            const points = streak * 50;
            return {
              id: p.id,
              name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Foydalanuvchi',
              streak,
              completionRate: activeDays > 0 ? Math.min(100, Math.round((activeDays / 30) * 100)) : 0,
              points,
              avatarGradient: p.avatar_gradient || 'linear-gradient(135deg, #10b981, #06b6d4)',
              role: p.role || 'user'
            };
          });
        }
      } catch (err) {
        console.warn('Real users load for rankings error:', err);
      }
    }

    // Populate each challenge with REAL users
    const updatedChallenges = storedChallenges.map(ch => {
      let challengeLeaderboard = [...realLeaderboard];

      // If no users in database yet, preserve existing or empty
      if (challengeLeaderboard.length === 0 && Array.isArray(ch.leaderboard)) {
        challengeLeaderboard = [...ch.leaderboard];
      }

      // Sort by points descending, then streak
      challengeLeaderboard.sort((a, b) => b.points - a.points || b.streak - a.streak);
      challengeLeaderboard = challengeLeaderboard.map((u, idx) => ({
        ...u,
        rank: idx + 1,
        isCurrent: currentUser ? u.id === currentUser.id : false
      }));

      return {
        ...ch,
        participantsCount: Math.max(challengeLeaderboard.length, ch.participantsCount || 0),
        leaderboard: challengeLeaderboard
      };
    });

    setChallenges(updatedChallenges);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId) || challenges[0];

  const handleJoin = (challengeId) => {
    const res = storage.joinChallenge(challengeId, currentUser);
    if (res?.error === 'MAX_LIMIT_REACHED') {
      audioManager.playError?.();
      if (addToast) {
        addToast(
          "Limitga yetildi! (4/4)",
          "Siz ko'pi bilan 4 ta musobaqada bir vaqtda qatnasha olasiz. Boshqa guruhga qo'shilish uchun avval mavjudlaridan biridan chiqing.",
          "warning"
        );
      } else {
        triggerBanner(
          "⚠️ Limitga yetildi (4/4)!",
          "Siz bir vaqtning o'zida maksimal 4 ta musobaqaga a'zo bo'la olasiz. Yangisiga qo'shilish uchun avval boshqasidan chiqing."
        );
      }
      return;
    }
    loadChallenges();
    audioManager.playCheck();
    const updatedCount = storage.getChallenges().filter(c => c.joined).length;
    if (addToast) {
      addToast("🎉 Guruhga a'zo bo'ldingiz!", `Reyting jadvali ochildi. Faol musobaqalar: ${updatedCount}/4`, "success");
    } else {
      triggerBanner("🎉 Guruhga a'zo bo'ldingiz!", `Reyting jadvali ochildi. Faol musobaqalar: ${updatedCount}/4`);
    }
  };

  const handleLeave = (challengeId) => {
    storage.leaveChallenge(challengeId);
    loadChallenges();
    triggerBanner("Guruhdan chiqildi", "Reyting ma'lumotlari yashirildi.");
  };

  // Admin: Create new challenge
  const handleSaveChallenge = (newChData) => {
    const created = storage.addChallenge(newChData);
    loadChallenges();
    setSelectedChallengeId(created.id);
    if (addToast) {
      addToast("Musobaqa yaratildi! 🏆", created.title, "success");
    } else {
      triggerBanner("🏆 Yangi Challenge boshlandi!", created.title);
    }
  };

  // Admin: Delete challenge
  const handleDeleteChallenge = (challengeId, challengeTitle) => {
    if (window.confirm(`"${challengeTitle}" musobaqasini o'chirmoqchimisiz?`)) {
      storage.deleteChallenge(challengeId);
      loadChallenges();
      if (addToast) addToast("O'chirildi", "Challenge ro'yxatdan olib tashlandi", "info");
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="rankings-hero-subtag">2026 Intizom Ligasiga Xush Kelibsiz</span>
            {isAdmin && (
              <button
                type="button"
                className="primary-btn"
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  color: '#080D05',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <IconPlus size={15} />
                <span>+ Yangi Challenge</span>
              </button>
            )}
          </div>
        </div>

        <h2 className="rankings-hero-title">Intizom Chempionati & Reytinglar</h2>
        <p className="rankings-hero-desc">
          Haqiqiy foydalanuvchilar bilan birgalikda intizom musobaqalari.
          Reyting natijalari va o'zaro o'rinlarni ko'rish uchun avval ushbu guruhga a'zo bo'ling!
        </p>

        {/* 4-Challenge Limit Indicator Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 16px',
              borderRadius: '14px',
              background: joinedCount >= 4 ? 'rgba(245, 158, 11, 0.16)' : 'rgba(182, 243, 107, 0.12)',
              border: `1px solid ${joinedCount >= 4 ? 'rgba(245, 158, 11, 0.45)' : 'rgba(182, 243, 107, 0.3)'}`
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Faol Musobaqalaringiz:
            </span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: joinedCount >= 4 ? '#F59E0B' : '#B6F36B',
                fontFamily: 'monospace'
              }}
            >
              {joinedCount} / 4 ta
            </span>

            {/* 4 dots slot indicator */}
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', marginLeft: '4px' }}>
              {[0, 1, 2, 3].map(idx => (
                <span
                  key={idx}
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    background: idx < joinedCount ? (joinedCount >= 4 ? '#F59E0B' : '#B6F36B') : 'rgba(255, 255, 255, 0.2)',
                    boxShadow: idx < joinedCount ? `0 0 8px ${joinedCount >= 4 ? '#F59E0B' : '#B6F36B'}` : 'none',
                    transition: 'all 0.2s'
                  }}
                />
              ))}
            </div>

            {joinedCount >= 4 ? (
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#F59E0B', marginLeft: '6px' }}>
                (LIMIT TO'LDI)
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: '#B6F36B', marginLeft: '4px' }}>
                ({4 - joinedCount} ta bo'sh joy)
              </span>
            )}
          </div>

          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            ⚡ Bir vaqtda maksimal 4 ta musobaqaga a'zo bo'lish mumkin
          </span>
        </div>
      </div>

      {/* 2. Search & Filter Bar for Challenges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '14px'
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '380px' }}>
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <IconSearch size={15} color="var(--text-muted)" />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Guruh yoki musobaqa qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '36px',
              paddingRight: searchQuery ? '32px' : '12px',
              fontSize: '13px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              width: '100%',
              color: 'var(--text-primary)'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              &times;
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`subtab-pill ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Barchasi ({challenges.length})
          </button>

          <button
            type="button"
            className={`subtab-pill ${filterMode === 'joined' ? 'active' : ''}`}
            onClick={() => setFilterMode('joined')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            A'zo bo'lingan ({joinedCount}/4)
          </button>

          <button
            type="button"
            className={`subtab-pill ${filterMode === 'available' ? 'active' : ''}`}
            onClick={() => setFilterMode('available')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Qo'shilish mumkin ({challenges.length - joinedCount})
          </button>
        </div>
      </div>

      {/* 3. Challenge Selector Pills */}
      <div className="challenges-selector-row">
        {filteredChallenges.length === 0 ? (
          <div style={{ padding: '12px 18px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Qidiruv bo'yicha hech qanday guruh topilmadi.
          </div>
        ) : (
          filteredChallenges.map((ch) => (
            <button
              key={ch.id}
              type="button"
              className={`challenge-select-chip ${selectedChallengeId === ch.id ? 'active' : ''}`}
              onClick={() => setSelectedChallengeId(ch.id)}
            >
              <div className="chip-emblem-wrap">
                <ChallengeEmblem id={ch.id} emoji={ch.emoji} size={18} />
              </div>
              <span className="chip-title">{ch.title}</span>
              {ch.joined ? (
                <span className="chip-joined-badge">A'zo</span>
              ) : (
                <span className="chip-locked-badge">Qulf</span>
              )}
            </button>
          ))
        )}

        {isAdmin && (
          <button
            type="button"
            className="challenge-select-chip"
            onClick={() => setShowAddModal(true)}
            style={{ borderStyle: 'dashed', borderColor: 'var(--primary-accent)' }}
          >
            <IconPlus size={16} />
            <span className="chip-title">+ Yangi Challenge</span>
          </button>
        )}
      </div>

      {/* 4. Selected Challenge Details */}
      {selectedChallenge && (
        <div className="challenge-main-card">
          <div className="challenge-card-header">
            <div className="challenge-header-left">
              <div className="challenge-big-emblem">
                <ChallengeEmblem id={selectedChallenge.id} emoji={selectedChallenge.emoji} size={38} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 className="challenge-heading">{selectedChallenge.title}</h3>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteChallenge(selectedChallenge.id, selectedChallenge.title)}
                      className="icon-action-btn"
                      style={{ color: '#ef4444', padding: '4px' }}
                      title="Challengeni o'chirish"
                    >
                      <IconTrash size={16} />
                    </button>
                  )}
                </div>
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
              ) : joinedCount >= 4 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-join-challenge"
                    onClick={() => handleJoin(selectedChallenge.id)}
                    style={{
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.2))',
                      border: '1px solid rgba(245, 158, 11, 0.45)',
                      color: '#F59E0B',
                      cursor: 'pointer'
                    }}
                    title="Maksimal 4 ta musobaqaga a'zo bo'lingan"
                  >
                    <IconLock size={16} color="#F59E0B" />
                    <span>Limit To'ldi (4/4)</span>
                  </button>
                  <span style={{ fontSize: '11px', color: '#F59E0B', textAlign: 'right' }}>
                    Qo'shilish uchun avval boshqasidan chiqing
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-join-challenge"
                  onClick={() => handleJoin(selectedChallenge.id)}
                >
                  <span className="join-glow"></span>
                  <IconTrophy size={16} />
                  <span>Guruhga A'zo Bo'lish ({joinedCount}/4)</span>
                </button>
              )}
            </div>
          </div>

          {/* 5. LEADERBOARD: ONLY DISPLAY IF JOINED (Strict Requirement) */}
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
              {joinedCount >= 4 ? (
                <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-join-challenge-inline"
                    onClick={() => handleJoin(selectedChallenge.id)}
                    style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: '#F59E0B'
                    }}
                  >
                    <IconLock size={16} color="#F59E0B" />
                    <span>Limitga Yetildi (4/4 ta musobaqada a'zosiz)</span>
                  </button>
                  <span style={{ fontSize: '12px', color: '#F59E0B' }}>
                    Boshqa musobaqaga qo'shilish uchun avval a'zo bo'lganlaringizdan biridan chiqing
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-join-challenge-inline"
                  onClick={() => handleJoin(selectedChallenge.id)}
                >
                  <IconTrophy size={16} />
                  <span>Guruhga Qo'shilish va Natijalarni Ochish ({joinedCount}/4)</span>
                </button>
              )}
            </div>
          ) : (
            /* UNLOCKED STATE: FULL LEADERBOARD */
            <div className="leaderboard-unlocked-container">
              <div className="leaderboard-header-bar">
                <h4 className="leaderboard-title">Guruh Peshqadamlari (Top Natijalar)</h4>
                <span className="live-pill">
                  <span className="pulse-dot"></span>
                  <span>Haqiqiy Foydalanuvchilar</span>
                </span>
              </div>

              {selectedChallenge.leaderboard && selectedChallenge.leaderboard.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Hozircha guruhda faol intizomchilar yo'q. Birinchi bo'lib odat bajaring!
                </div>
              ) : (
                <>
                  {/* Podium for top 3 */}
                  <div className="podium-row">
                    {selectedChallenge.leaderboard.slice(0, 3).map((item, idx) => {
                      const rankNum = idx + 1;
                      return (
                        <div
                          key={item.id || idx}
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
                            key={row.id || row.rank}
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
                                  style={{ width: `${row.completionRate || 0}%` }}
                                ></div>
                                <span className="completion-text">{row.completionRate || 0}%</span>
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
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Admin Add Challenge Modal */}
      {showAddModal && (
        <AddChallengeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveChallenge}
        />
      )}
    </div>
  );
}

export const RankingsPage = memo(RankingsPageComponent);
