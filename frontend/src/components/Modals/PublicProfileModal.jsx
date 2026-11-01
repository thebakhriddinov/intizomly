import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { storage } from '../../utils/storage';
import { formatUzbekPhone } from '../../utils/phone';
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
  { id: 'telegram', name: 'Telegram', prefix: 'https://t.me/' },
  { id: 'instagram', name: 'Instagram', prefix: 'https://instagram.com/' },
  { id: 'youtube', name: 'YouTube', prefix: 'https://youtube.com/@' },
  { id: 'github', name: 'GitHub', prefix: 'https://github.com/' },
  { id: 'x', name: 'X / Twitter', prefix: 'https://x.com/' },
  { id: 'linkedin', name: 'LinkedIn', prefix: 'https://linkedin.com/in/' }
];

export function PublicProfileModal({ user, isOpen, onClose, currentUser, onFollowChange }) {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'followers' | 'following'
  const [currentProfile, setCurrentProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    const userId = typeof user === 'string' ? user : user.id;
    const prof = storage.getPublicProfile(userId, typeof user === 'object' ? user : {});
    setCurrentProfile(prof);

    const following = storage.isFollowing(userId, currentUser?.id);
    setIsFollowing(following);
    setActiveTab('info');
  }, [isOpen, user, currentUser]);

  if (!isOpen || !currentProfile) return null;

  const isSelf = currentUser && currentProfile.id === currentUser.id;

  const handleToggleFollow = () => {
    if (isSelf) return;

    if (isFollowing) {
      storage.unfollowUser(currentProfile.id, currentUser?.id);
      setIsFollowing(false);
      const updated = storage.getPublicProfile(currentProfile.id);
      setCurrentProfile({ ...updated });
    } else {
      storage.followUser(currentProfile, currentUser);
      setIsFollowing(true);
      const updated = storage.getPublicProfile(currentProfile.id);
      setCurrentProfile({ ...updated });
    }

    if (typeof onFollowChange === 'function') {
      onFollowChange();
    }
  };

  const handleSelectOtherUser = (otherUser) => {
    if (!otherUser?.id) return;
    const prof = storage.getPublicProfile(otherUser.id, otherUser);
    setCurrentProfile(prof);
    setIsFollowing(storage.isFollowing(otherUser.id, currentUser?.id));
    setActiveTab('info');
  };

  const allBadges = storage.getBadgesStatus(currentProfile.streak || 0);
  const unlockedBadges = allBadges.filter(b => b.isUnlocked || b.unlocked);

  const initials = (currentProfile.name || 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('') || 'U';

  const formattedPhone = currentProfile.phone && currentProfile.phone !== '+998 -- --- -- --'
    ? (formatUzbekPhone(currentProfile.phone) || currentProfile.phone)
    : '+998 (90) 123-45-67';

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
                />
              ) : (
                <div
                  className="pub-modal-avatar-gradient"
                  style={{ background: currentProfile.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                >
                  {initials}
                </div>
              )}
            </div>

            {/* Follow Button if not self */}
            {!isSelf && (
              <div className="pub-modal-action-box">
                <button
                  type="button"
                  className={`btn-pub-follow ${isFollowing ? 'is-following' : ''}`}
                  onClick={handleToggleFollow}
                >
                  {isFollowing ? (
                    <>
                      <IconCheck size={14} color="#10B981" />
                      <span>Kuzatilyapti</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      <span>Kuzatish</span>
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
            <div className="pub-phone-badge">
              <IconPhone size={13} color="#10B981" />
              <span>{formattedPhone}</span>
            </div>

            {/* Bio Text */}
            <p className="pub-bio-paragraph">
              {currentProfile.bio || "Foydalanuvchi hali bio yozmagan."}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="pub-stats-grid">
            <div className="pub-stat-chip">
              <span className="pub-stat-chip-icon"><IconFlame size={15} /></span>
              <span className="pub-stat-chip-val">{currentProfile.streak || 0} kun</span>
              <span className="pub-stat-chip-lbl">Streak</span>
            </div>

            <div className="pub-stat-chip">
              <span className="pub-stat-chip-icon"><IconTrophy size={15} /></span>
              <span className="pub-stat-chip-val">{currentProfile.points || 0}</span>
              <span className="pub-stat-chip-lbl">Ball</span>
            </div>

            <div
              className={`pub-stat-chip is-clickable ${activeTab === 'followers' ? 'active' : ''}`}
              onClick={() => setActiveTab('followers')}
            >
              <span className="pub-stat-chip-icon"><IconUsers size={15} /></span>
              <span className="pub-stat-chip-val">{currentProfile.followers?.length || 0}</span>
              <span className="pub-stat-chip-lbl">Followers</span>
            </div>

            <div
              className={`pub-stat-chip is-clickable ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              <span className="pub-stat-chip-icon"><IconUsers size={15} /></span>
              <span className="pub-stat-chip-val">{currentProfile.following?.length || 0}</span>
              <span className="pub-stat-chip-lbl">Following</span>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="pub-modal-tabs-bar">
            <button
              type="button"
              className={`pub-subtab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              Mukofotlar & Tarmoqlar
            </button>
            <button
              type="button"
              className={`pub-subtab-btn ${activeTab === 'followers' ? 'active' : ''}`}
              onClick={() => setActiveTab('followers')}
            >
              Followers ({currentProfile.followers?.length || 0})
            </button>
            <button
              type="button"
              className={`pub-subtab-btn ${activeTab === 'following' ? 'active' : ''}`}
              onClick={() => setActiveTab('following')}
            >
              Following ({currentProfile.following?.length || 0})
            </button>
          </div>

          {/* TAB 1: Badges & Social Links */}
          {activeTab === 'info' && (
            <div className="pub-tab-body">
              {/* Social links */}
              <div className="pub-section-block">
                <span className="pub-section-title">Ijtimoiy tarmoqlar</span>
                {(!currentProfile.socialLinks || currentProfile.socialLinks.length === 0) ? (
                  <p className="pub-empty-text">Ijtimoiy tarmoqlar ulanmagan</p>
                ) : (
                  <div className="pub-socials-list">
                    {currentProfile.socialLinks.map((soc) => {
                      const platObj = SOCIAL_PLATFORMS.find(p => p.id === soc.platform);
                      const fullUrl = soc.username.startsWith('http')
                        ? soc.username
                        : platObj
                          ? `${platObj.prefix}${soc.username.replace(/^@/, '')}`
                          : `https://${soc.username}`;

                      return (
                        <a
                          key={soc.id || soc.platform}
                          href={fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pub-social-btn"
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
                  <span className="pub-section-title">Mendagi bor badgelar ({unlockedBadges.length} ta)</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Streak: {currentProfile.streak || 0} kun
                  </span>
                </div>

                {unlockedBadges.length === 0 ? (
                  <div className="pub-empty-badges-card">
                    <IconLock size={20} color="var(--text-muted)" />
                    <span>Hali badgelar ochilmagan (10 kunlik to'xtovsiz intizomda birinchi nishon beriladi)</span>
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
                            {badge.tag || `${badge.streakReq} KUN`}
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
                  <span>Hozircha followers yo'q</span>
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
                          <IconFlame size={12} /> {usr.streak || 0} kun streak
                        </span>
                      </div>
                      <span className="pub-view-profile-arrow">Ko'rish &rarr;</span>
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
                  <span>Hozircha hech kimni kuzatmayapti</span>
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
                          <IconFlame size={12} /> {usr.streak || 0} kun streak
                        </span>
                      </div>
                      <span className="pub-view-profile-arrow">Ko'rish &rarr;</span>
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

