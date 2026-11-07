import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { storage } from '../../utils/storage';
import { formatUzbekPhone } from '../../utils/phone';
import { useLanguage } from '../../context/LanguageContext';
import {
  IconPhone,
  IconFlame,
  IconTrophy,
  IconShield,
  IconSword,
  IconCrown,
  IconLightning,
  IconDiamond,
  IconSocialPlatform,
  IconCheck,
  IconLock,
  IconUsers
} from '../Common/AppIcons';

function BadgeEmblem({ id, color = '#10B981', size = 26 }) {
  if (id === 'badge_10') return <IconShield size={size} color={color} />;
  if (id === 'badge_20') return <IconFlame size={size} />;
  if (id === 'badge_50') return <IconSword size={size} color={color} />;
  if (id === 'badge_70') return <IconCrown size={size} />;
  if (id === 'badge_90') return <IconLightning size={size} color={color} />;
  if (id === 'badge_100') return <IconDiamond size={size} color={color} />;
  return <IconTrophy size={size} color={color} />;
}

const SOCIAL_PLATFORMS = [
  { id: 'telegram', name: 'Telegram', prefix: 'https://t.me/', icon: 'telegram' },
  { id: 'instagram', name: 'Instagram', prefix: 'https://instagram.com/', icon: 'instagram' },
  { id: 'youtube', name: 'YouTube', prefix: 'https://youtube.com/@', icon: 'youtube' },
  { id: 'tiktok', name: 'TikTok', prefix: 'https://tiktok.com/@', icon: 'tiktok' },
  { id: 'twitter', name: 'X / Twitter', prefix: 'https://x.com/', icon: 'twitter' },
  { id: 'linkedin', name: 'LinkedIn', prefix: 'https://linkedin.com/in/', icon: 'linkedin' },
  { id: 'github', name: 'GitHub', prefix: 'https://github.com/', icon: 'github' }
];

export function PublicProfileModal({ user, isOpen, onClose, currentUser }) {
  const { t, lang } = useLanguage();
  const [currentProfile, setCurrentProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'followers' | 'following'
  const [isFollowing, setIsFollowing] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) {
      setCurrentProfile(null);
      return;
    }

    // Load full profile with fallbacks from storage
    const targetUserId = user.id || user.userId;
    const initialName = user.name || `${user.firstName || user.first_name || ''} ${user.lastName || user.last_name || ''}`.trim() || 'Foydalanuvchi';
    const profile = storage.getPublicProfile(targetUserId, {
      ...user,
      id: targetUserId,
      name: initialName
    });

    setCurrentProfile(profile);

    if (currentUser?.id) {
      setIsFollowing(storage.isFollowing(targetUserId, currentUser.id));
      setIsRequested(storage.isFollowRequested(targetUserId, currentUser.id));
    }
    setActiveTab('info');
  }, [isOpen, user, currentUser]);

  if (!isOpen || !currentProfile) return null;

  const isSelf = currentUser?.id && currentUser.id === currentProfile.id;

  const handleToggleFollow = () => {
    if (!currentUser?.id || isSelf) return;

    const res = storage.toggleFollow(currentProfile.id, currentUser.id);
    setIsFollowing(res.isFollowing);
    setIsRequested(res.isRequested);

    // Refresh current profile state from storage
    const refreshed = storage.getPublicProfile(currentProfile.id);
    setCurrentProfile(refreshed);
  };

  const handleSelectOtherUser = (otherUser) => {
    if (!otherUser?.id) return;
    const prof = storage.getPublicProfile(otherUser.id, otherUser);
    setCurrentProfile(prof);
    setIsFollowing(storage.isFollowing(otherUser.id, currentUser?.id));
    setActiveTab('info');
  };

  const allBadges = storage.getBadgesStatus(currentProfile.streak || 0, lang);
  const unlockedBadges = allBadges.filter(b => b.isUnlocked || b.unlocked);

  const initials = (currentProfile.name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('') || 'U';

  const formattedPhone = currentProfile.phone && currentProfile.phone !== '+998 -- --- -- --'
    ? (formatUzbekPhone(currentProfile.phone) || currentProfile.phone)
    : '';

  return createPortal(
    <div className="modal-overlay public-profile-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="modal-card public-profile-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Cover Banner */}
        <div className="pub-modal-banner">
          <div className="pub-modal-banner-gradient" />
          <button
            type="button"
            className="pub-modal-close-btn"
            onClick={onClose}
            aria-label="Yopish"
          >
            &times;
          </button>
        </div>

        {/* Identity & Main Card Body */}
        <div className="pub-modal-hero-content">
          <div className="pub-avatar-row">
            <div className="pub-modal-avatar-wrapper">
              {currentProfile.avatarUrl ? (
                <img
                  src={currentProfile.avatarUrl}
                  alt={currentProfile.name}
                  className="pub-modal-avatar-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className="pub-modal-avatar-placeholder"
                style={{
                  background: currentProfile.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)',
                  display: currentProfile.avatarUrl ? 'none' : 'flex'
                }}
              >
                <span>{initials}</span>
              </div>
            </div>

            {/* Follow / Unfollow Action Button */}
            {!isSelf && currentUser && (
              <div className="pub-actions-row">
                <button
                  type="button"
                  className={`pub-follow-btn ${isFollowing ? 'is-following' : isRequested ? 'is-requested' : 'primary-glow'}`}
                  onClick={handleToggleFollow}
                >
                  {isFollowing ? (
                    <>
                      <IconCheck size={14} />
                      <span>{lang === 'ru' ? "Отписаться" : lang === 'en' ? "Unfollow" : "Kuzatishni to'xtatish"}</span>
                    </>
                  ) : isRequested ? (
                    <>
                      <IconLock size={13} />
                      <span>{lang === 'ru' ? "Запрос отправлен" : lang === 'en' ? "Requested" : "Kutilmoqda"}</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: '15px', lineHeight: 1 }}>+</span>
                      <span>{lang === 'ru' ? "Подписаться" : lang === 'en' ? "Follow" : "Kuzatish"}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* User Name & Role */}
          <div className="pub-user-header-text">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 className="pub-user-name">{currentProfile.name}</h3>
              {currentProfile.role === 'admin' ? (
                <span className="user-role-badge role-admin">
                  <IconShield size={12} color="#10B981" /> Admin
                </span>
              ) : currentProfile.role === 'premium' ? (
                <span className="user-role-badge role-premium">
                  <IconLightning size={12} color="#F59E0B" /> PRO
                </span>
              ) : null}
            </div>

            {/* Phone Number (Raqam) */}
            {formattedPhone ? (
              <div className="pub-phone-badge">
                <IconPhone size={13} color="#10B981" />
                <span>{formattedPhone}</span>
              </div>
            ) : null}

            {/* Bio Text */}
            <p className="pub-bio-paragraph" style={{ fontStyle: currentProfile.bio ? 'normal' : 'italic', opacity: currentProfile.bio ? 1 : 0.75 }}>
              {currentProfile.bio || (lang === 'ru' ? "Пользователь еще не указал био." : lang === 'en' ? "User hasn't added a bio yet." : "Foydalanuvchi hali bio kiritmagan.")}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="pub-stats-grid">
            <div className="pub-stat-chip">
              <span className="pub-stat-chip-icon"><IconFlame size={15} /></span>
              <span className="pub-stat-chip-val">{currentProfile.streak || 0} {t('daysCount')}</span>
              <span className="pub-stat-chip-lbl">Streak</span>
            </div>

            <div className="pub-stat-chip">
              <span className="pub-stat-chip-icon"><IconTrophy size={15} /></span>
              <span className="pub-stat-chip-val">{currentProfile.points || 0}</span>
              <span className="pub-stat-chip-lbl">{lang === 'ru' ? "Баллы" : lang === 'en' ? "Points" : "Ball"}</span>
            </div>

            <div
              className={`pub-stat-chip is-clickable ${activeTab === 'followers' ? 'active' : ''}`}
              onClick={() => setActiveTab('followers')}
            >
              <span className="pub-stat-chip-icon"><IconUsers size={15} /></span>
              <span className="pub-stat-chip-val">{currentProfile.followers?.length || 0}</span>
              <span className="pub-stat-chip-lbl">{lang === 'ru' ? "Подписчики" : "Followers"}</span>
            </div>

            <div
              className={`pub-stat-chip is-clickable ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              <span className="pub-stat-chip-icon"><IconUsers size={15} /></span>
              <span className="pub-stat-chip-val">{currentProfile.following?.length || 0}</span>
              <span className="pub-stat-chip-lbl">{lang === 'ru' ? "Подписки" : "Following"}</span>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="pub-modal-tabs-bar">
            <button
              type="button"
              className={`pub-subtab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              {lang === 'ru' ? "Уровни & Соцсети" : lang === 'en' ? "Levels & Networks" : "Level & Tarmoqlar"}
            </button>
            <button
              type="button"
              className={`pub-subtab-btn ${activeTab === 'followers' ? 'active' : ''}`}
              onClick={() => setActiveTab('followers')}
            >
              {lang === 'ru' ? "Подписчики" : "Followers"} ({currentProfile.followers?.length || 0})
            </button>
            <button
              type="button"
              className={`pub-subtab-btn ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              {lang === 'ru' ? "Подписки" : "Following"} ({currentProfile.following?.length || 0})
            </button>
          </div>

          {/* TAB 1: Badges & Social Links */}
          {activeTab === 'info' && (
            <div className="pub-tab-body">
              {/* Social links */}
              <div className="pub-section-block">
                <span className="pub-section-title">{lang === 'ru' ? "Социальные сети" : lang === 'en' ? "Social Networks" : "Ijtimoiy tarmoqlar"}</span>
                {(!currentProfile.socialLinks || currentProfile.socialLinks.length === 0) ? (
                  <p className="pub-empty-text-note" style={{ margin: 0, fontStyle: 'italic', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {lang === 'ru' ? "Социальные сети пока не добавлены." : lang === 'en' ? "No social networks added yet." : "Hali ijtimoiy tarmoqlar qo'shilmagan."}
                  </p>
                ) : (
                  <div className="pub-social-chips-grid">
                    {currentProfile.socialLinks.map((soc) => {
                      const platformObj = SOCIAL_PLATFORMS.find(p => p.id === soc.platform);
                      const prefix = platformObj?.prefix || 'https://';
                      const cleanUser = soc.username.replace(/^@/, '');
                      const fullUrl = cleanUser.startsWith('http') ? cleanUser : `${prefix}${cleanUser}`;

                      return (
                        <a
                          key={soc.platform}
                          href={fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pub-social-pill"
                          title={soc.username}
                        >
                          <IconSocialPlatform platform={soc.platform} size={16} />
                          <span className="pub-social-label">@{soc.username.replace(/^@/, '')}</span>
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ marginLeft: 'auto', opacity: 0.6 }}>
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                          </svg>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Badges / Rewards */}
              <div className="pub-section-block">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className="pub-section-title">
                    {isSelf
                      ? `${t('myBadges')} (${unlockedBadges.length})`
                      : (lang === 'ru' ? `Уровни и бейджи (${unlockedBadges.length})` : lang === 'en' ? `Levels & Badges (${unlockedBadges.length})` : `Erishilgan levelingiz va badgelar (${unlockedBadges.length} ta)`)}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {t('currentStreakLabel')} {currentProfile.streak || 0} {t('daysCount')}
                  </span>
                </div>

                {unlockedBadges.length === 0 ? (
                  <div className="pub-empty-badges-card">
                    <IconLock size={20} color="var(--text-muted)" />
                    <span>
                      {lang === 'ru'
                        ? "Уровни еще не открыты (первый знак выдается за 10 дней дисциплины)"
                        : lang === 'en'
                        ? "No levels unlocked yet (first badge earned at 10-day streak)"
                        : "Hali badgelar ochilmagan (10 kunlik to'xtovsiz intizomda birinchi nishon beriladi)"}
                    </span>
                  </div>
                ) : (
                  <div className="pub-badges-grid">
                    {unlockedBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="pub-badge-card"
                        style={{
                          borderColor: badge.color,
                          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, ${badge.glow || 'rgba(16, 185, 129, 0.1)'} 100%)`
                        }}
                      >
                        <div className="pub-badge-emblem" style={{ color: badge.color }}>
                          <BadgeEmblem id={badge.id} color={badge.color} size={28} />
                        </div>
                        <div className="pub-badge-info">
                          <h5 className="pub-badge-name" style={{ color: 'var(--text-primary)' }}>{badge.title}</h5>
                          <p className="pub-badge-desc">{badge.description}</p>
                          <span className="pub-badge-tag-pill" style={{ color: badge.color, borderColor: badge.color }}>
                            {badge.tag || `${badge.streakReq} ${t('daysCount').toUpperCase()}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Followers */}
          {activeTab === 'followers' && (
            <div className="pub-tab-body">
              {(!currentProfile.followers || currentProfile.followers.length === 0) ? (
                <div className="pub-empty-users-box">
                  <IconUsers size={28} color="var(--text-muted)" />
                  <span>{lang === 'ru' ? "Пока нет подписчиков" : lang === 'en' ? "No followers yet" : "Hozircha followers yo'q"}</span>
                </div>
              ) : (
                <div className="pub-users-scroll-list">
                  {currentProfile.followers.map((usr) => (
                    <div
                      key={usr.id}
                      className="pub-user-dialog-item"
                      onClick={() => handleSelectOtherUser(usr)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="pub-user-item-avatar" style={{ background: usr.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                        {usr.avatarUrl ? (
                          <img src={usr.avatarUrl} alt={usr.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          (usr.name?.[0] || 'U').toUpperCase()
                        )}
                      </div>
                      <div className="pub-user-item-info">
                        <span className="pub-user-item-name">{usr.name}</span>
                        <span className="pub-user-item-meta">
                          <IconFlame size={12} /> {usr.streak || 0} {t('daysCount')} streak
                        </span>
                      </div>
                      <span className="pub-view-profile-arrow">{lang === 'ru' ? "Профиль →" : lang === 'en' ? "View →" : "Ko'rish →"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Following */}
          {activeTab === 'following' && (
            <div className="pub-tab-body">
              {(!currentProfile.following || currentProfile.following.length === 0) ? (
                <div className="pub-empty-users-box">
                  <IconUsers size={28} color="var(--text-muted)" />
                  <span>{lang === 'ru' ? "Пока никого не отслеживает" : lang === 'en' ? "Not following anyone yet" : "Hozircha hech kimni kuzatmayapti"}</span>
                </div>
              ) : (
                <div className="pub-users-scroll-list">
                  {currentProfile.following.map((usr) => (
                    <div
                      key={usr.id}
                      className="pub-user-dialog-item"
                      onClick={() => handleSelectOtherUser(usr)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="pub-user-item-avatar" style={{ background: usr.avatarGradient || 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                        {usr.avatarUrl ? (
                          <img src={usr.avatarUrl} alt={usr.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          (usr.name?.[0] || 'U').toUpperCase()
                        )}
                      </div>
                      <div className="pub-user-item-info">
                        <span className="pub-user-item-name">{usr.name}</span>
                        <span className="pub-user-item-meta">
                          <IconFlame size={12} /> {usr.streak || 0} {t('daysCount')} streak
                        </span>
                      </div>
                      <span className="pub-view-profile-arrow">{lang === 'ru' ? "Профиль →" : lang === 'en' ? "View →" : "Ko'rish →"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
