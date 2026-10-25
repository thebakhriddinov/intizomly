import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitsContext';
import { storage, BADGES_CONFIG } from '../../utils/storage';

const SOCIAL_PLATFORMS = [
  { id: 'telegram', name: 'Telegram', icon: '✈️', prefix: 'https://t.me/' },
  { id: 'instagram', name: 'Instagram', icon: '📸', prefix: 'https://instagram.com/' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', prefix: 'https://youtube.com/@' },
  { id: 'x', name: 'X / Twitter', icon: '✖️', prefix: 'https://x.com/' },
  { id: 'github', name: 'GitHub', icon: '🐙', prefix: 'https://github.com/' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', prefix: 'https://linkedin.com/in/' }
];

function ProfilePageComponent({ onOpenSettings }) {
  const { currentUser, isAdmin, isPremium } = useAuth();
  const { t, lang } = useLanguage();
  const { triggerBanner } = useHabits();

  const fileInputRef = useRef(null);

  const [profileExtras, setProfileExtras] = useState(storage.getProfileExtras());
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(profileExtras.bio || '');

  // Active sub-tab in Profile: 'badges' | 'socials' | 'network'
  const [profileTab, setProfileTab] = useState('badges');

  // New social account modal / inputs
  const [showAddSocialModal, setShowAddSocialModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('telegram');
  const [socialUsername, setSocialUsername] = useState('');

  // Follow suggestions list
  const [suggestedUsers, setSuggestedUsers] = useState([
    { id: 'sug_1', name: 'Sanjar Beknazarov', streak: 42, role: 'premium', avatarGradient: 'linear-gradient(135deg, #f59e0b, #b6f36b)' },
    { id: 'sug_2', name: 'Nodira Saidova', streak: 31, role: 'user', avatarGradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
    { id: 'sug_3', name: 'Azizbek Normatov', streak: 33, role: 'user', avatarGradient: 'linear-gradient(135deg, #10b981, #b6f36b)' }
  ]);

  const streak = storage.getGlobalStreak();
  const badges = storage.getBadgesStatus(streak);

  const loadData = useCallback(() => {
    const extras = storage.getProfileExtras();
    setProfileExtras(extras);
    setBioText(extras.bio || '');
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle avatar upload via file reader
  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Rasm hajmi 2MB dan kichik bo'lishi kerak!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      if (base64Url) {
        storage.updateProfileExtras({ avatarUrl: base64Url });
        loadData();
        triggerBanner("📸 Profil rasmi yangilandi!", "Yangi fotosuratingiz muvaffaqiyatli saqlandi.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Bio
  const handleSaveBio = () => {
    storage.updateProfileExtras({ bio: bioText.trim() });
    setIsEditingBio(false);
    loadData();
    triggerBanner("✅ Bio saqlandi", "Profilingiz tavsifi yangilandi.");
  };

  // Add social link
  const handleAddSocial = (e) => {
    e.preventDefault();
    if (!socialUsername.trim()) return;

    const platObj = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform) || SOCIAL_PLATFORMS[0];
    const cleanUsername = socialUsername.trim().replace(/^@/, '');

    storage.addSocialLink({
      platform: platObj.id,
      label: platObj.name,
      username: cleanUsername,
      icon: platObj.icon
    });

    setSocialUsername('');
    setShowAddSocialModal(false);
    loadData();
    triggerBanner("🌐 Ijtimoiy tarmoq qo'shildi", `@${cleanUsername} profilingizga ulandi!`);
  };

  // Delete social link
  const handleDeleteSocial = (id) => {
    storage.deleteSocialLink(id);
    loadData();
  };

  // Follow user
  const handleFollow = (user) => {
    storage.followUser(user);
    setSuggestedUsers(prev => prev.filter(u => u.id !== user.id));
    loadData();
    triggerBanner("👥 Do'stlik o'rnatildi", `${user.name} sizning kuzatuvchilaringiz safiga qo'shildi!`);
  };

  // Unfollow user
  const handleUnfollow = (userId) => {
    storage.unfollowUser(userId);
    loadData();
  };

  // Accept follow request
  const handleAcceptRequest = (req) => {
    storage.acceptFollowRequest(req.id);
    loadData();
    triggerBanner("🤝 So'rov qabul qilindi", `${req.name} sizning do'stingizga aylandi!`);
  };

  const initials = currentUser
    ? `${currentUser.firstName?.[0] || 'U'}${currentUser.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <div className="profile-page">
      {/* 1. Profile Header Card */}
      <div className="profile-hero-card">
        {/* Top-left Settings Gear Button (User Prompt: "yuqori chap qismida settings tugmasi boladi") */}
        <div className="profile-top-bar">
          <button
            type="button"
            className="btn-profile-settings"
            onClick={onOpenSettings}
            title="Sozlamalar"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Sozlamalar</span>
          </button>

          <div className="profile-role-tag">
            {isAdmin ? (
              <span className="user-role-badge role-admin">🛡️ Administrator</span>
            ) : isPremium ? (
              <span className="user-role-badge role-premium">⚡ PRO A'zo</span>
            ) : (
              <span className="user-role-badge role-user">👤 Oddiy A'zo</span>
            )}
          </div>
        </div>

        {/* Profile Avatar & Info Row */}
        <div className="profile-identity-row">
          <div className="profile-avatar-wrapper">
            {profileExtras.avatarUrl ? (
              <img
                src={profileExtras.avatarUrl}
                alt="Avatar"
                className="profile-custom-img"
              />
            ) : (
              <div
                className="profile-gradient-avatar"
                style={{ background: currentUser?.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)' }}
              >
                {initials}
              </div>
            )}

            {/* Hidden file input for uploading profile picture */}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleAvatarFileChange}
            />

            <button
              type="button"
              className="btn-change-avatar"
              onClick={() => fileInputRef.current?.click()}
              title="Rasm yuklash / almashtirish"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>

          <div className="profile-names-block">
            <h2 className="profile-fullname">
              {currentUser?.firstName} {currentUser?.lastName}
            </h2>
            <span className="profile-email">{currentUser?.email || currentUser?.phone}</span>

            {/* Global streak badge */}
            <div className="profile-streak-pill">
              <span className="fire-icon">🔥</span>
              <span><strong>{streak} kun</strong> ketma-ket intizom</span>
            </div>
          </div>
        </div>

        {/* 2. Editable Bio Section */}
        <div className="profile-bio-box">
          {isEditingBio ? (
            <div className="bio-edit-form">
              <textarea
                className="bio-textarea"
                rows="3"
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                maxLength={200}
                placeholder="O'zingiz haqingizda, intizom shioringiz..."
              />
              <div className="bio-actions-row">
                <span className="bio-counter">{bioText.length}/200</span>
                <div className="bio-btn-group">
                  <button
                    type="button"
                    className="btn-bio-cancel"
                    onClick={() => {
                      setBioText(profileExtras.bio || '');
                      setIsEditingBio(false);
                    }}
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    className="btn-bio-save"
                    onClick={handleSaveBio}
                  >
                    Saqlash ✅
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bio-display-row" onClick={() => setIsEditingBio(true)}>
              <p className="bio-text">
                {profileExtras.bio || "Intizom haqida shioringizni yozing..."}
              </p>
              <button
                type="button"
                className="btn-edit-bio"
                title="Bio tahrirlash"
              >
                ✏️
              </button>
            </div>
          )}
        </div>

        {/* 3. Follow Stats Summary */}
        <div className="profile-network-stats">
          <div className="net-stat-item" onClick={() => setProfileTab('network')}>
            <span className="net-stat-num">{profileExtras.followers?.length || 0}</span>
            <span className="net-stat-lbl">Kuzatuvchilar</span>
          </div>
          <div className="net-stat-divider"></div>
          <div className="net-stat-item" onClick={() => setProfileTab('network')}>
            <span className="net-stat-num">{profileExtras.following?.length || 0}</span>
            <span className="net-stat-lbl">Kuzatilyapti</span>
          </div>
          <div className="net-stat-divider"></div>
          <div className="net-stat-item" onClick={() => setProfileTab('badges')}>
            <span className="net-stat-num">
              {badges.filter(b => b.unlocked).length} / {badges.length}
            </span>
            <span className="net-stat-lbl">Ochilgan Badgelar</span>
          </div>
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs: Badges, Socials, Network */}
      <div className="profile-tabs-bar">
        <button
          type="button"
          className={`prof-tab-btn ${profileTab === 'badges' ? 'active' : ''}`}
          onClick={() => setProfileTab('badges')}
        >
          🏅 Streak Badgelari (6 ta)
        </button>
        <button
          type="button"
          className={`prof-tab-btn ${profileTab === 'socials' ? 'active' : ''}`}
          onClick={() => setProfileTab('socials')}
        >
          🌐 Tarmoqlar ({profileExtras.socialLinks?.length || 0})
        </button>
        <button
          type="button"
          className={`prof-tab-btn ${profileTab === 'network' ? 'active' : ''}`}
          onClick={() => setProfileTab('network')}
        >
          👥 Do'stlar & Follow
          {profileExtras.followRequests?.length > 0 && (
            <span className="request-badge">{profileExtras.followRequests.length}</span>
          )}
        </button>
      </div>

      {/* --- TAB 1: STREAK BADGES (10, 20, 50, 70, 90, 100 DAYS) --- */}
      {profileTab === 'badges' && (
        <div className="badges-section">
          <div className="section-info-row">
            <div>
              <h3 className="subtab-heading">Intizom Mukofotlari va Badgelar</h3>
              <p className="subtab-desc">
                Har kuni odatlaringizni bajarib boring va maxsus 10, 20, 50, 70, 90, 100 kunlik unvonlarni oching!
              </p>
            </div>
            <div className="streak-current-badge">
              🔥 Hozirgi Streak: <strong>{streak} kun</strong>
            </div>
          </div>

          <div className="badges-grid">
            {badges.map((badge) => {
              const remainingDays = badge.streakReq - streak;
              return (
                <div
                  key={badge.id}
                  className={`badge-card ${badge.unlocked ? 'is-unlocked' : 'is-locked'}`}
                  style={{
                    borderColor: badge.unlocked ? badge.color : 'rgba(255, 255, 255, 0.08)',
                    boxShadow: badge.unlocked ? `0 8px 32px ${badge.glow}` : 'none'
                  }}
                >
                  <div className="badge-card-top">
                    <span className="badge-tag" style={{ color: badge.color }}>
                      {badge.tag}
                    </span>
                    <span className={`badge-status-pill ${badge.unlocked ? 'unlocked' : 'locked'}`}>
                      {badge.unlocked ? 'OCHILDI ✅' : `🔒 ${badge.streakReq} kun`}
                    </span>
                  </div>

                  <div className="badge-icon-circle" style={{ borderColor: badge.color }}>
                    <span className="badge-big-icon">{badge.icon}</span>
                  </div>

                  <h4 className="badge-title">{badge.title}</h4>
                  <p className="badge-desc">{badge.description}</p>

                  {/* Progress bar towards this badge */}
                  <div className="badge-progress-wrap">
                    <div className="badge-progress-track">
                      <div
                        className="badge-progress-fill"
                        style={{
                          width: `${badge.progressPercent}%`,
                          backgroundColor: badge.color
                        }}
                      ></div>
                    </div>
                    <span className="badge-progress-text">
                      {badge.unlocked ? (
                        <span style={{ color: badge.color, fontWeight: 700 }}>Erishildi! 🌟</span>
                      ) : (
                        <span>{streak} / {badge.streakReq} kun (yana {remainingDays} kun)</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 2: SOCIAL MEDIA ACCOUNTS (TELEGRAM, INSTAGRAM, ETC.) --- */}
      {profileTab === 'socials' && (
        <div className="socials-section">
          <div className="subtab-action-bar">
            <div>
              <h3 className="subtab-heading">Ijtimoiy Tarmoq Akkauntlari</h3>
              <p className="subtab-desc">Do'stlaringiz sizni boshqa tarmoqlarda topishi uchun akkauntlaringizni qo'shing</p>
            </div>
            <button
              type="button"
              className="btn-add-primary"
              onClick={() => setShowAddSocialModal(true)}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>+ Tarmoq Qo'shish</span>
            </button>
          </div>

          <div className="social-links-grid">
            {profileExtras.socialLinks?.length === 0 ? (
              <div className="empty-socials-box">
                <span>🌐 Hozircha tarmoqlar ulanmagan. "+ Tarmoq Qo'shish" tugmasini bosing!</span>
              </div>
            ) : (
              profileExtras.socialLinks.map((soc) => {
                const platObj = SOCIAL_PLATFORMS.find(p => p.id === soc.platform);
                const fullUrl = platObj ? `${platObj.prefix}${soc.username}` : '#';

                return (
                  <div key={soc.id} className="social-link-card">
                    <div className="social-card-left">
                      <span className="social-platform-icon">{soc.icon || '🔗'}</span>
                      <div className="social-platform-info">
                        <span className="social-platform-name">{soc.label || soc.platform}</span>
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-username-link"
                        >
                          @{soc.username}
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-delete-social"
                      onClick={() => handleDeleteSocial(soc.id)}
                      title="O'chirish"
                    >
                      &times;
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: NETWORK & FOLLOW SYSTEM --- */}
      {profileTab === 'network' && (
        <div className="network-section">
          {/* Follow requests received */}
          {profileExtras.followRequests?.length > 0 && (
            <div className="requests-block">
              <h4 className="network-block-title">
                <span>Kutilayotgan Do'stlik So'rovlari</span>
                <span className="req-count-bubble">{profileExtras.followRequests.length}</span>
              </h4>

              <div className="requests-list">
                {profileExtras.followRequests.map((req) => (
                  <div key={req.id} className="request-card">
                    <div className="request-user-info">
                      <div className="user-cell-avatar" style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}>
                        {req.name?.[0] || 'U'}
                      </div>
                      <div>
                        <span className="req-user-name">{req.name}</span>
                        <span className="req-meta">🔥 {req.streak} kun streak • {req.time}</span>
                      </div>
                    </div>

                    <div className="request-actions">
                      <button
                        type="button"
                        className="btn-accept-req"
                        onClick={() => handleAcceptRequest(req)}
                      >
                        Qabul qilish ✅
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Following list */}
          <div className="following-block" style={{ marginTop: '24px' }}>
            <h4 className="network-block-title">Kuzatilayotgan Shaxslar ({profileExtras.following?.length || 0})</h4>
            <div className="users-list-grid">
              {profileExtras.following?.map((usr) => (
                <div key={usr.id} className="user-follow-card">
                  <div className="user-follow-avatar" style={{ background: usr.avatarGradient }}>
                    {usr.name?.[0] || 'U'}
                  </div>
                  <div className="user-follow-meta">
                    <span className="user-follow-name">{usr.name}</span>
                    <span className="user-follow-streak">🔥 {usr.streak} kun streak</span>
                  </div>
                  <button
                    type="button"
                    className="btn-unfollow"
                    onClick={() => handleUnfollow(usr.id)}
                  >
                    Kuzatishni to'xtatish
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested users to follow */}
          {suggestedUsers.length > 0 && (
            <div className="suggested-block" style={{ marginTop: '28px' }}>
              <h4 className="network-block-title">Tavsiya Etilayotgan Intizomchilar</h4>
              <div className="users-list-grid">
                {suggestedUsers.map((sug) => (
                  <div key={sug.id} className="user-follow-card">
                    <div className="user-follow-avatar" style={{ background: sug.avatarGradient }}>
                      {sug.name?.[0] || 'U'}
                    </div>
                    <div className="user-follow-meta">
                      <span className="user-follow-name">{sug.name}</span>
                      <span className="user-follow-streak">🔥 {sug.streak} kun streak</span>
                    </div>
                    <button
                      type="button"
                      className="btn-follow-user"
                      onClick={() => handleFollow(sug)}
                    >
                      Follow (+)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- ADD SOCIAL ACCOUNT MODAL --- */}
      {showAddSocialModal && (
        <div className="modal-backdrop" onClick={() => setShowAddSocialModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-icon-badge">🌐</span>
                <div>
                  <h3 className="modal-title">Ijtimoiy Tarmoq Qo'shish</h3>
                  <p className="modal-subtitle">Ilova va foydalanuvchi nomingizni tanlang</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddSocialModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddSocial} className="social-modal-form">
              <div className="form-group">
                <label className="form-label">Ilova / Platforma</label>
                <div className="platform-select-chips">
                  {SOCIAL_PLATFORMS.map((plat) => (
                    <button
                      key={plat.id}
                      type="button"
                      className={`plat-chip ${selectedPlatform === plat.id ? 'active' : ''}`}
                      onClick={() => setSelectedPlatform(plat.id)}
                    >
                      <span>{plat.icon}</span>
                      <span>{plat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Foydalanuvchi Nomi (Username)</label>
                <div className="username-input-wrap">
                  <span className="username-at">@</span>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="thebakhriddinov"
                    value={socialUsername}
                    onChange={(e) => setSocialUsername(e.target.value)}
                    required
                  />
                </div>
                <span className="form-hint">Misol: agar Telegram bo'lsa @sizning_nomingiz</span>
              </div>

              <div className="modal-footer-btns">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setShowAddSocialModal(false)}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="btn-modal-save"
                >
                  Qo'shish ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export const ProfilePage = memo(ProfilePageComponent);
