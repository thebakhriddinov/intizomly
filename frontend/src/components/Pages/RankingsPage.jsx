import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitsContext';
import { storage } from '../../utils/storage';
import { audioManager } from '../../utils/audio';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { supabaseService } from '../../services/supabaseService';
import { formatUzbekPhone } from '../../utils/phone';
import { AddChallengeModal } from '../Modals/AddChallengeModal';
import { PublicProfileModal } from '../Modals/PublicProfileModal';
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
  IconCheck,
  IconUsers,
  IconUserPlus
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
  const { t, lang } = useLanguage();
  const { triggerBanner, addToast } = useHabits();

  const [challenges, setChallenges] = useState(() => {
    try {
      return storage.getChallenges() || [];
    } catch {
      return [];
    }
  });
  const [selectedChallengeId, setSelectedChallengeId] = useState('ch_no_sugar');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);

  const joinedCount = useMemo(() => {
    return challenges.filter(c => c.joined).length;
  }, [challenges]);

  const filteredChallenges = useMemo(() => {
    return challenges.filter(ch => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        ch.title.toLowerCase().includes(q) ||
        (ch.description || '').toLowerCase().includes(q) ||
          (ch.badgeName || '').toLowerCase().includes(q)
      );
  });
}, [challenges, searchQuery]);

  const loadChallenges = useCallback(async () => {
    setLoading(true);
    const storedChallenges = storage.getChallenges();

    // 1. Fetch REAL database users from Supabase profiles
    let realLeaderboard = [];
    if (isSupabaseConfigured && supabase) {
      try {
        let profiles = null;
        try {
          const res = await supabase
            .from('profiles')
            .select('id, first_name, last_name, role, avatar_gradient, avatar_url, bio, phone, social_links');
          if (!res.error && Array.isArray(res.data)) {
            profiles = res.data;
          }
        } catch {
          // ignore
        }

        // Fallback to basic columns if extended table not yet migrated
        if (!profiles) {
          const coreRes = await supabase
            .from('profiles')
            .select('id, first_name, last_name, role, avatar_gradient');
          if (!coreRes.error && Array.isArray(coreRes.data)) {
            profiles = coreRes.data;
          }
        }

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
            const pub = storage.getPublicProfile(p.id, {
              id: p.id,
              first_name: p.first_name,
              last_name: p.last_name,
              phone: p.phone,
              bio: p.bio,
              avatar_url: p.avatar_url,
              avatar_gradient: p.avatar_gradient,
              social_links: p.social_links,
              role: p.role,
              streak,
              points
            });

            const rawFirst = (p.first_name || pub?.firstName || '').trim();
            const rawLast = (p.last_name || pub?.lastName || '').trim();
            let displayName = `${rawFirst} ${rawLast}`.trim();
            if (!displayName && p.phone) {
              displayName = formatUzbekPhone(p.phone) || p.phone;
            }
            if (!displayName && pub?.name && pub.name !== 'Foydalanuvchi') {
              displayName = pub.name;
            }
            if (!displayName) {
              displayName = 'Foydalanuvchi';
            }

            const avatarUrl = p.avatar_url || pub?.avatarUrl || (p.avatar_gradient && (p.avatar_gradient.startsWith('data:image') || p.avatar_gradient.startsWith('http')) ? p.avatar_gradient : '');

            return {
              id: p.id,
              name: displayName,
              firstName: rawFirst,
              lastName: rawLast,
              phone: p.phone || pub?.phone || '',
              bio: p.bio || pub?.bio || '',
              socialLinks: pub?.socialLinks || [],
              streak,
              completionRate: activeDays > 0 ? Math.min(100, Math.round((activeDays / 30) * 100)) : 0,
              points,
              avatarGradient: p.avatar_gradient || pub?.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)',
              avatarUrl,
              role: p.role || 'user'
            };
          });
        }
      } catch (err) {
        console.warn('Real users load for rankings error:', err);
      }
    }

    // Fallback if Supabase profiles not loaded yet
    if (realLeaderboard.length === 0) {
      const allUsers = storage.getUsers?.() || [];
      realLeaderboard = allUsers.map(u => {
        const pub = storage.getPublicProfile(u.id, u);
        const rawFirst = (u.firstName || pub?.firstName || '').trim();
        const rawLast = (u.lastName || pub?.lastName || '').trim();
        let displayName = `${rawFirst} ${rawLast}`.trim();
        if (!displayName && u.phone) displayName = formatUzbekPhone(u.phone) || u.phone;
        if (!displayName) displayName = pub?.name || 'Foydalanuvchi';

        return {
          id: u.id,
          name: displayName,
          firstName: rawFirst,
          lastName: rawLast,
          phone: u.phone || '',
          bio: u.bio || pub?.bio || '',
          socialLinks: u.socialLinks || pub?.socialLinks || [],
          streak: storage.getGlobalStreak() || 10,
          completionRate: 85,
          points: (storage.getGlobalStreak() || 10) * 50,
          avatarGradient: u.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)',
          avatarUrl: u.avatarUrl || pub?.avatarUrl || '',
          role: u.role || 'user'
        };
      });
    }

    // 2. Query challenge_participants from Supabase
    const participantsMap = {};
    try {
      const remoteParticipants = await supabaseService.getChallengeParticipants();
      if (Array.isArray(remoteParticipants) && remoteParticipants.length > 0) {
        remoteParticipants.forEach(row => {
          if (!participantsMap[row.challenge_id]) {
            participantsMap[row.challenge_id] = new Set();
          }
          participantsMap[row.challenge_id].add(row.user_id);
        });
      }
    } catch (e) {
      console.warn('Error fetching challenge participants:', e);
    }

    // Merge with local storage participant tracking
    storedChallenges.forEach(ch => {
      const localList = storage.getChallengeParticipants(ch.id);
      if (Array.isArray(localList)) {
        if (!participantsMap[ch.id]) participantsMap[ch.id] = new Set();
        localList.forEach(uid => participantsMap[ch.id].add(uid));
      }
      if (ch.joined && currentUser?.id) {
        if (!participantsMap[ch.id]) participantsMap[ch.id] = new Set();
        participantsMap[ch.id].add(currentUser.id);
      }
    });

    // Default requirement: All users participate in ch_no_sugar by default
    if (!participantsMap['ch_no_sugar'] || participantsMap['ch_no_sugar'].size === 0) {
      participantsMap['ch_no_sugar'] = new Set();
      realLeaderboard.forEach(u => participantsMap['ch_no_sugar'].add(u.id));
      if (currentUser?.id) participantsMap['ch_no_sugar'].add(currentUser.id);
    } else if (currentUser?.id) {
      participantsMap['ch_no_sugar'].add(currentUser.id);
    }

    // 3. Build each challenge with its SPECIFIC real participants
    const updatedChallenges = storedChallenges.map(ch => {
      const joinedUserIds = participantsMap[ch.id] || new Set();

      // Filter to users who joined THIS specific challenge
      let challengeMembers = realLeaderboard.filter(u => joinedUserIds.has(u.id));

      // Check whether current user is joined
      const isCurrentJoined = currentUser
        ? (joinedUserIds.has(currentUser.id) || (ch.id === 'ch_no_sugar' ? true : Boolean(ch.joined)))
        : false;

      // If current user is joined but not in list, add them
      if (isCurrentJoined && currentUser && !challengeMembers.some(u => u.id === currentUser.id)) {
        const myFirst = (currentUser.firstName || '').trim();
        const myLast = (currentUser.lastName || '').trim();
        const myName = `${myFirst} ${myLast}`.trim() || formatUzbekPhone(currentUser.phone) || 'Siz';
        challengeMembers.push({
          id: currentUser.id,
          name: myName,
          firstName: myFirst,
          lastName: myLast,
          phone: currentUser.phone || '',
          bio: currentUser.bio || '',
          socialLinks: currentUser.socialLinks || [],
          streak: storage.getGlobalStreak() || 12,
          completionRate: 90,
          points: (storage.getGlobalStreak() || 12) * 50,
          avatarGradient: currentUser.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)',
          avatarUrl: currentUser.avatarUrl || '',
          role: currentUser.role || 'user',
          isCurrent: true
        });
      }

      // If current user is in members, enrich with latest profile state
      if (currentUser) {
        const myExtras = storage.getProfileExtras();
        const myPub = storage.getPublicProfile(currentUser.id);
        const myAvatar = myExtras?.avatarUrl || myPub?.avatarUrl || currentUser.avatarUrl || '';
        const myBio = myExtras?.bio !== undefined ? myExtras.bio : (currentUser.bio || myPub?.bio || '');
        const myFirst = (currentUser.firstName || myPub?.firstName || '').trim();
        const myLast = (currentUser.lastName || myPub?.lastName || '').trim();
        const myName = `${myFirst} ${myLast}`.trim() || myPub?.name || 'Siz';

        challengeMembers = challengeMembers.map(u => {
          if (u.id === currentUser.id) {
            return {
              ...u,
              name: myName,
              firstName: myFirst,
              lastName: myLast,
              phone: currentUser.phone || myPub?.phone || u.phone || '',
              bio: myBio,
              socialLinks: myExtras?.socialLinks || myPub?.socialLinks || u.socialLinks || [],
              avatarUrl: myAvatar || u.avatarUrl,
              isCurrent: true
            };
          }
          return { ...u, isCurrent: false };
        });
      }

      // Sort by points descending, then streak
      challengeMembers.sort((a, b) => (b.points || 0) - (a.points || 0) || (b.streak || 0) - (a.streak || 0));
      challengeMembers = challengeMembers.map((u, idx) => ({
        ...u,
        rank: idx + 1
      }));

      return {
        ...ch,
        joined: isCurrentJoined,
        participantsCount: challengeMembers.length,
        leaderboard: challengeMembers
      };
    });

    setChallenges(updatedChallenges);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const selectedChallenge = challenges.find((c) => c.id === selectedChallengeId) || challenges[0];

  const handleJoin = async (challengeId) => {
    if (!currentUser) return;

    // Check limit in storage
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

    // Persist to Supabase challenge_participants table
    try {
      await supabaseService.joinChallenge(currentUser.id, challengeId);
    } catch (err) {
      console.warn('[Rankings] joinChallenge supabase notice:', err?.message);
    }

    audioManager.playCheck();
    await loadChallenges();

    const updatedCount = storage.getChallenges().filter(c => c.joined).length;
    if (addToast) {
      addToast("🎉 Guruhga a'zo bo'ldingiz!", `Musobaqa ishtirokchisi bo'ldingiz! Faol musobaqalar: ${updatedCount}/4`, "success");
    } else {
      triggerBanner("🎉 Guruhga a'zo bo'ldingiz!", `Musobaqa ishtirokchisi bo'ldingiz! Faol musobaqalar: ${updatedCount}/4`);
    }
  };

  const handleLeave = async (challengeId) => {
    if (!currentUser) return;

    storage.leaveChallenge(challengeId, currentUser);

    try {
      await supabaseService.leaveChallenge(currentUser.id, challengeId);
    } catch (err) {
      console.warn('[Rankings] leaveChallenge supabase notice:', err?.message);
    }

    await loadChallenges();
    triggerBanner("Guruhdan chiqildi", "Ushbu musobaqa a'zoligingiz bekor qilindi.");
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
              <span>Yangi Challenge</span>
            </button>
          )}
        </div>
      </div>

      <h2 className="rankings-hero-title">
        {lang === 'ru' ? "Чемпионат дисциплины и рейтинги" : lang === 'en' ? "Discipline Championship & Rankings" : "Intizom Chempionati & Reytinglar"}
      </h2>
      <p className="rankings-hero-desc">
        {lang === 'ru'
          ? "Соревнования по дисциплине с реальными участниками. Чтобы видеть результаты и занимать места, присоединяйтесь к группам!"
          : lang === 'en'
          ? "Discipline competitions with real members. Join groups to track ranks, progress and compete!"
          : "Haqiqiy foydalanuvchilar bilan birgalikda intizom musobaqalari. Reyting natijalari va o'zaro o'rinlarni ko'rish uchun avval ushbu guruhga a'zo bo'ling!"}
      </p>

      {/* 4-Challenge Limit Indicator Banner - Single clean row on all screens */}
      <div className="active-competitions-banner">
        <div className="active-comp-left">
          <IconTrophy size={16} color={joinedCount >= 4 ? '#F59E0B' : 'var(--primary-accent)'} />
          <span className="active-comp-label">
            {lang === 'ru' ? "Активные соревнования:" : lang === 'en' ? "Active Competitions:" : "Faol musobaqalar:"}
          </span>
          <span className="active-comp-badge" style={{ color: joinedCount >= 4 ? '#F59E0B' : 'var(--primary-accent)' }}>
            {joinedCount}/4
          </span>
          <div className="active-comp-dots">
            {[0, 1, 2, 3].map(idx => (
              <span
                key={idx}
                className={`comp-dot ${idx < joinedCount ? 'filled' : ''} ${joinedCount >= 4 ? 'warning' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="active-comp-right">
          {joinedCount >= 4 ? (
            <span className="comp-limit-tag warning">
              {lang === 'ru' ? "Лимит исчерпан (4/4)" : lang === 'en' ? "Limit reached (4/4)" : "Limit to'ldi (4/4)"}
            </span>
          ) : (
            <span className="comp-limit-tag success">
              {lang === 'ru' ? `${4 - joinedCount} мест свободно` : lang === 'en' ? `${4 - joinedCount} slots left` : `${4 - joinedCount} ta bo'sh joy`}
            </span>
          )}
        </div>
      </div>
    </div>

    {/* 2. Challengelar Section Header & Search */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.14)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10B981',
            flexShrink: 0
          }}
        >
          <IconTrophy size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
            Challengelar
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Faol guruhlar va musobaqalar ro'yxati ({challenges.length} ta)
          </span>
        </div>
      </div>

      {/* Search input */}
      <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
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
          placeholder="Guruh qidirish..."
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
    </div>

    {/* 3. Challenge List in Column Layout */}
    <div className="challenges-column-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginBottom: '24px' }}>
      {filteredChallenges.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          Qidiruv bo'yicha hech qanday challenge topilmadi.
        </div>
      ) : (
        filteredChallenges.map((ch) => {
          const isSelected = selectedChallengeId === ch.id;
          return (
            <div
              key={ch.id}
              onClick={() => setSelectedChallengeId(ch.id)}
              className={`challenge-column-card ${isSelected ? 'active' : ''}`}
              role="button"
              tabIndex={0}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '16px',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(6, 182, 212, 0.08) 100%)'
                  : 'var(--bg-card, rgba(18, 24, 38, 0.75))',
                border: `1px solid ${isSelected ? 'var(--primary-accent, #10B981)' : 'var(--border-subtle, rgba(255, 255, 255, 0.08))'}`,
                boxShadow: isSelected
                  ? '0 0 20px rgba(16, 185, 129, 0.25), 0 4px 16px rgba(0, 0, 0, 0.3)'
                  : '0 4px 14px rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                width: '100%',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                <div className="chip-emblem-wrap" style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(16, 185, 129, 0.22)' : 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ChallengeEmblem id={ch.id} emoji={ch.emoji} size={22} />
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {ch.title}
                    </span>
                    {ch.joined ? (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '8px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10B981',
                        border: '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        A'zo bo'lingan
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-muted)'
                      }}>
                        Qo'shilish mumkin
                      </span>
                    )}
                  </div>
                  {ch.description && (
                    <p style={{
                      fontSize: '12.5px',
                      color: 'var(--text-muted)',
                      margin: '3px 0 0 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {ch.description}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                {ch.leaderboard && ch.leaderboard.length > 0 && (
                  <div className="challenge-card-avatar-stack">
                    {ch.leaderboard.slice(0, 3).map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="stacked-mini-avatar"
                        style={{
                          zIndex: 3 - idx,
                          background: p.avatarUrl ? 'transparent' : (p.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)')
                        }}
                        title={p.name}
                      >
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt={p.name} />
                        ) : (
                          <span>{(p.name || 'U')[0]}</span>
                        )}
                      </div>
                    ))}
                    {ch.leaderboard.length > 3 && (
                      <span className="stacked-more-count">+{ch.leaderboard.length - 3}</span>
                    )}
                  </div>
                )}

                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <IconUsers size={14} color="var(--text-muted)" />
                  <span>{ch.participantsCount || 0} nafar</span>
                </span>

                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: isSelected ? 'var(--primary-accent, #10B981)' : 'rgba(255, 255, 255, 0.06)',
                  color: isSelected ? '#080D05' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })
      )}

      {isAdmin && (
        <button
          type="button"
          className="challenge-column-card"
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px',
            borderRadius: '16px',
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1.5px dashed rgba(16, 185, 129, 0.4)',
            color: 'var(--primary-accent, #10B981)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '14px',
            width: '100%',
            transition: 'all 0.2s'
          }}
        >
          <IconPlus size={16} />
          <span>Yangi Challenge Qo'shish</span>
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
                  <IconUsers size={14} />
                  <span>{selectedChallenge.participantsCount || 0} {lang === 'ru' ? 'участников' : lang === 'en' ? 'participants' : 'nafar ishtirokchi'}</span>
                </span>
                <span className="meta-pill">
                  <IconTrophy size={14} />
                  <span>{lang === 'ru' ? 'Награда:' : lang === 'en' ? 'Reward:' : 'Mukofot:'} {selectedChallenge.badgeName}</span>
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
                  <span>{lang === 'ru' ? 'Вы состоите в группе' : lang === 'en' ? 'You are a member' : 'Siz guruh a\'zosisiz'}</span>
                </span>
                <button
                  type="button"
                  className="btn-leave-challenge"
                  onClick={() => handleLeave(selectedChallenge.id)}
                >
                  {lang === 'ru' ? 'Покинуть группу' : lang === 'en' ? 'Leave Group' : 'Guruhdan chiqish'}
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
                  title={lang === 'ru' ? "Максимум 4 соревнования" : "Maksimal 4 ta musobaqaga a'zo bo'lingan"}
                >
                  <IconLock size={16} color="#F59E0B" />
                  <span>{lang === 'ru' ? "Лимит исчерпан (4/4)" : lang === 'en' ? "Limit Reached (4/4)" : "Limit To'ldi (4/4)"}</span>
                </button>
                <span style={{ fontSize: '11px', color: '#F59E0B', textAlign: 'right' }}>
                  {lang === 'ru' ? "Сначала покиньте другое соревнование" : lang === 'en' ? "Leave another group first to join" : "Qo'shilish uchun avval boshqasidan chiqing"}
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
                <span>{lang === 'ru' ? `Вступить в группу (${joinedCount}/4)` : lang === 'en' ? `Join Group (${joinedCount}/4)` : `Guruhga A'zo Bo'lish (${joinedCount}/4)`}</span>
              </button>
            )}
          </div>
        </div>

        {/* 5. DEDICATED CHALLENGE PARTICIPANTS GALLERY */}
        <div className="challenge-participants-section">
          <div className="section-title-row">
            <div className="section-title-left">
              <div className="section-icon-badge">
                <IconUsers size={16} />
              </div>
              <div>
                <h4 className="participants-heading">
                  {lang === 'ru' ? 'Участники группы' : lang === 'en' ? 'Group Participants' : 'Guruh Ishtirokchilari'}
                  <span className="participants-count-tag">
                    {selectedChallenge.participantsCount || 0} {lang === 'ru' ? 'чел.' : lang === 'en' ? 'users' : 'nafar'}
                  </span>
                </h4>
                <span className="participants-subtext">
                  {lang === 'ru' ? 'Все участники, соревнующиеся в этом челлендже' : lang === 'en' ? 'All members competing in this challenge' : 'Ushbu challengeda qatnashayotgan barcha a\'zolar'}
                </span>
              </div>
            </div>

            {!selectedChallenge.joined && joinedCount < 4 && (
              <button
                type="button"
                className="btn-quick-join"
                onClick={() => handleJoin(selectedChallenge.id)}
              >
                <IconUserPlus size={14} />
                <span>{lang === 'ru' ? 'Вступить' : lang === 'en' ? 'Join' : 'Guruhga qo\'shilish'}</span>
              </button>
            )}
          </div>

          {(!selectedChallenge.leaderboard || selectedChallenge.leaderboard.length === 0) ? (
            <div className="participants-empty-card">
              <div className="empty-users-icon" style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
                margin: '0 auto 8px'
              }}>
                <IconUsers size={24} />
              </div>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-primary)' }}>
                Hozircha ishtirokchilar yo'q
              </h5>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                Ushbu challengeda birinchi bo'lib ishtirok eting va o'z o'rningizni egallang!
              </p>
              {joinedCount < 4 && (
                <button
                  type="button"
                  className="btn-join-challenge"
                  onClick={() => handleJoin(selectedChallenge.id)}
                  style={{ marginTop: '12px' }}
                >
                  <IconTrophy size={15} />
                  <span>Birinchi bo'lib qo'shilish</span>
                </button>
              )}
            </div>
          ) : (
            <div className="participants-cards-grid">
              {selectedChallenge.leaderboard.map((member) => (
                <div
                  key={member.id}
                  className={`participant-card ${member.isCurrent ? 'is-current-member' : ''}`}
                  onClick={() => setSelectedUserProfile(member)}
                  role="button"
                  tabIndex={0}
                  title={`${member.name} profilini ko'rish`}
                >
                  <div className="participant-card-avatar-wrap">
                    <div
                      className="participant-card-avatar"
                      style={{
                        background: member.avatarUrl ? 'transparent' : (member.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)')
                      }}
                    >
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.name} />
                      ) : (
                        <span>{(member.name || 'U')[0]}</span>
                      )}
                    </div>
                    {member.rank && member.rank <= 3 && (
                      <span className="member-rank-medal">
                        <IconMedal rank={member.rank} size={15} />
                      </span>
                    )}
                  </div>

                  <div className="participant-card-info">
                    <div className="participant-card-name-row">
                      <span className="participant-card-name">{member.name}</span>
                      {member.isCurrent && <span className="member-you-badge">{lang === 'ru' ? 'Вы' : lang === 'en' ? 'You' : 'Siz'}</span>}
                    </div>
                    <div className="participant-card-meta">
                      <span className="participant-streak-pill">
                        <IconFlame size={12} />
                        <span>{member.streak || 0} {t('daysCount')}</span>
                      </span>
                      <span className="participant-points-pill">
                        {member.points || 0} {lang === 'ru' ? 'баллов' : lang === 'en' ? 'pts' : 'ball'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. JOIN CTA BANNER (IF NOT JOINED) */}
        {!selectedChallenge.joined && (
          <div className="challenge-join-banner">
            <div className="join-banner-left">
              <div className="join-banner-emblem">
                <IconTrophy size={20} />
              </div>
              <div>
                <h5 className="join-banner-title">Guruh Reytingida O'z O'rningizni Egallang!</h5>
                <p className="join-banner-desc">
                  Musobaqaga qo'shiling, har kuni odatingizni bajaring va sovrinli medalni qo'lga kiritish uchun kurashing.
                </p>
              </div>
            </div>
            {joinedCount >= 4 ? (
              <button
                type="button"
                className="btn-join-challenge"
                disabled
                style={{ opacity: 0.65, cursor: 'not-allowed', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}
              >
                <IconLock size={15} color="#F59E0B" />
                <span>Limit To'ldi (4/4)</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-join-challenge"
                onClick={() => handleJoin(selectedChallenge.id)}
              >
                <IconTrophy size={16} />
                <span>Guruhga Qo'shilish ({joinedCount}/4)</span>
              </button>
            )}
          </div>
        )}

        {/* 7. FULL LEADERBOARD & PODIUM - ALWAYS VISIBLE */}
        <div className="leaderboard-unlocked-container">
          <div className="leaderboard-header-bar">
            <h4 className="leaderboard-title">Guruh Peshqadamlari & Reyting</h4>
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
                  {(selectedChallenge.leaderboard || []).slice(0, 3).map((item, idx) => {
                    const rankNum = idx + 1;
                    return (
                      <div
                        key={item.id || idx}
                        className={`podium-card podium-rank-${rankNum} ${item.isCurrent ? 'is-user-podium' : ''}`}
                        onClick={() => setSelectedUserProfile(item)}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        title="Foydalanuvchi profilini ko'rish"
                      >
                        <div className="podium-medal-wrap">
                          <IconMedal rank={rankNum} size={28} />
                        </div>
                        <div
                          className="podium-avatar"
                          style={{
                            background: item.avatarUrl ? 'transparent' : (item.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)'),
                            overflow: 'hidden'
                          }}
                        >
                          {item.avatarUrl ? (
                            <img src={item.avatarUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            item.name?.[0] || 'U'
                          )}
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
                      {(selectedChallenge.leaderboard || []).map((row) => (
                        <tr
                          key={row.id || row.rank}
                          className={`leaderboard-row ${row.isCurrent ? 'is-current-user-row' : ''}`}
                          onClick={() => setSelectedUserProfile(row)}
                          style={{ cursor: 'pointer' }}
                          title="Foydalanuvchi profilini ko'rish"
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
                                style={{
                                  background: row.avatarUrl ? 'transparent' : (row.avatarGradient || 'linear-gradient(135deg, #6366f1, #a855f7)'),
                                  overflow: 'hidden'
                                }}
                              >
                                {row.avatarUrl ? (
                                  <img src={row.avatarUrl} alt={row.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  row.name?.[0] || 'U'
                                )}
                              </div>
                              <div className="user-cell-info">
                                <span className="user-cell-name">{row.name}</span>
                                {row.isCurrent && <span className="user-cell-you-badge">{lang === 'ru' ? 'Вы' : lang === 'en' ? 'You' : 'Siz'}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="streak-col">
                            <span className="table-streak-pill">
                              <IconFlame size={13} />
                              <span>{row.streak} {t('daysCount')}</span>
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

    {/* Public Profile View Modal */}
    <PublicProfileModal
      user={selectedUserProfile}
      isOpen={!!selectedUserProfile}
      onClose={() => setSelectedUserProfile(null)}
      currentUser={currentUser}
      onFollowChange={loadChallenges}
    />
  </div>
);
}

export const RankingsPage = memo(RankingsPageComponent);
