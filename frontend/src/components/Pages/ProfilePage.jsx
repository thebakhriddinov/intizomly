import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useHabits } from '../../context/HabitsContext';
import { storage } from '../../utils/storage';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  IconTrophy,
  IconFlame,
  IconShield,
  IconSword,
  IconCrown,
  IconLightning,
  IconDiamond,
  IconSocialPlatform,
  IconCheck,
  IconEdit,
  IconLock,
  IconUsers,
  IconLaptop
} from '../Common/AppIcons';

function BadgeEmblem({ id, color, size = 28 }) {
  if (id === 'badge_10') return <IconShield size={size} color={color} />;
  if (id === 'badge_20') return <IconFlame size={size} />;
  if (id === 'badge_50') return <IconSword size={size} color={color} />;
  if (id === 'badge_70') return <IconCrown size={size} />;
  if (id === 'badge_90') return <IconLightning size={size} color={color} />;
  if (id === 'badge_100') return <IconDiamond size={size} color={color} />;
  return <IconTrophy size={size} />;
}

const SOCIAL_PLATFORMS = [
  { id: 'telegram', name: 'Telegram', prefix: 'https://t.me/' },
  { id: 'instagram', name: 'Instagram', prefix: 'https://instagram.com/' },
  { id: 'youtube', name: 'YouTube', prefix: 'https://youtube.com/@' },
  { id: 'github', name: 'GitHub', prefix: 'https://github.com/' },
  { id: 'x', name: 'X / Twitter', prefix: 'https://x.com/' },
  { id: 'linkedin', name: 'LinkedIn', prefix: 'https://linkedin.com/in/' }
];

function ProfilePageComponent({ onOpenSettings }) {
  const { currentUser, isAdmin, isPremium } = useAuth();
  const { t, lang } = useLanguage();
  const { triggerBanner } = useHabits();

  const fileInputRef = useRef(null);

  const [profileExtras, setProfileExtras] = useState(storage.getProfileExtras());
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(profileExtras.bio || '');

  // Network modal: opened by clicking followers or following numbers
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [networkModalTab, setNetworkModalTab] = useState('followers'); // 'followers' | 'following' | 'suggestions' | 'requests'

  // New social account modal / inputs
  const [showAddSocialModal, setShowAddSocialModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('telegram');
  const [socialUsername, setSocialUsername] = useState('');

  // Follow suggestions list (Loaded from real database users)
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const streak = storage.getGlobalStreak();
  const badges = storage.getBadgesStatus(streak);

  const loadData = useCallback(async () => {
    const extras = storage.getProfileExtras();
    setProfileExtras(extras);
    setBioText(extras.bio || '');

    // Fetch REAL registered users from Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbProfiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, role, avatar_gradient');

        if (Array.isArray(dbProfiles) && dbProfiles.length > 0) {
          const followingIds = new Set((extras.following || []).map(f => f.id));
          const currentId = currentUser?.id;

          const realSuggestions = dbProfiles
            .filter(p => p.id !== currentId && !followingIds.has(p.id))
            .map(p => ({
              id: p.id,
              name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Foydalanuvchi',
              role: p.role || 'user',
              streak: 0,
              avatarGradient: p.avatar_gradient || 'linear-gradient(135deg, #10b981, #06b6d4)'
            }));

          setSuggestedUsers(realSuggestions);
        } else {
          setSuggestedUsers([]);
        }
      } catch (err) {
        console.warn('Real users load for suggestions failed:', err);
      }
    } else {
      setSuggestedUsers([]);
    }
  }, [currentUser]);

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
      username: cleanUsername
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
        {/* Top-left Settings Gear Button */}
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

          {/* Role badge: only shown if Admin or Pro (oddiy userda hech narsa chiqmaydi) */}
          <div className="profile-role-tag">
            {isAdmin ? (
              <span className="user-role-badge role-admin">
                <IconShield size={13} color="#10B981" /> Administrator
              </span>
            ) : isPremium ? (
              <span className="user-role-badge role-premium">
                <IconLightning size={13} color="#F59E0B" /> PRO A'zo
              </span>
            ) : null}
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
              <IconFlame size={15} />
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
                    <IconCheck size={14} color="#080D05" />
                    <span>Saqlash</span>
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
                <IconEdit size={14} />
              </button>
            </div>
          )}
        </div>

        {/* 3. Social Platforms Row (Directly below bio with clean icon buttons) */}
        <div className="profile-socials-row">
          {profileExtras.socialLinks?.map((soc) => {
            const platObj = SOCIAL_PLATFORMS.find(p => p.id === soc.platform);
            const fullUrl = soc.username.startsWith('http')
              ? soc.username
              : platObj
                ? `${platObj.prefix}${soc.username}`
                : `https://${soc.username}`;

            return (
              <div key={soc.id} className="profile-social-item-wrap">
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-social-icon-btn"
                  title={`${soc.label || soc.platform}: @${soc.username}`}
                >
                  <IconSocialPlatform platform={soc.platform} size={18} />
                </a>
                <button
                  type="button"
                  className="btn-del-social-micro"
                  onClick={() => handleDeleteSocial(soc.id)}
                  title="O'chirish"
                >
                  &times;
                </button>
              </div>
            );
          })}

          <button
            type="button"
            className="btn-add-social-chip"
            onClick={() => setShowAddSocialModal(true)}
            title="Ijtimoiy tarmoq ulash"
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Tarmoq</span>
          </button>
        </div>

        {/* 4. Follow Stats Summary (Clickable to open Network modal) */}
        <div className="profile-network-stats">
          <div
            className="net-stat-item is-clickable"
            onClick={() => {
              setNetworkModalTab('followers');
              setShowNetworkModal(true);
            }}
            title="Kuzatuvchilarni ko'rish"
          >
            <span className="net-stat-num">{profileExtras.followers?.length || 0}</span>
            <span className="net-stat-lbl">Kuzatuvchilar</span>
          </div>
          <div className="net-stat-divider"></div>
          <div
            className="net-stat-item is-clickable"
            onClick={() => {
              setNetworkModalTab('following');
              setShowNetworkModal(true);
            }}
            title="Kuzatilayotganlarni ko'rish"
          >
            <span className="net-stat-num">{profileExtras.following?.length || 0}</span>
            <span className="net-stat-lbl">Kuzatilyapti</span>
          </div>
          <div className="net-stat-divider"></div>
          <div className="net-stat-item">
            <span className="net-stat-num">
              {badges.filter(b => b.unlocked).length} / {badges.length}
            </span>
            <span className="net-stat-lbl">Ochilgan Badgelar</span>
          </div>
        </div>
      </div>

      {/* 5. Intizom Mukofotlari va Badgelar (Pastda to'g'ridan-to'g'ri faqat badgelar turadi) */}
      <div className="badges-section">
        <div className="section-info-row">
          <div>
            <h3 className="subtab-heading">Intizom Mukofotlari va Badgelar</h3>
            <p className="subtab-desc">
              Har kuni odatlaringizni bajarib boring va maxsus 10, 20, 50, 70, 90, 100 kunlik unvonlarni oching!
            </p>
          </div>
          <div className="streak-current-badge">
            <IconFlame size={16} />
            <span>Hozirgi Streak: <strong>{streak} kun</strong></span>
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
                    {badge.unlocked ? (
                      <>
                        <IconCheck size={12} color="#10B981" />
                        <span>OCHILDI</span>
                      </>
                    ) : (
                      <>
                        <IconLock size={12} color="#94A3B8" />
                        <span>{badge.streakReq} kun</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="badge-icon-circle" style={{ borderColor: badge.color }}>
                  <BadgeEmblem id={badge.id} color={badge.color} size={30} />
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
                      <span style={{ color: badge.color, fontWeight: 700 }}>Erishildi!</span>
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

      {/* --- NETWORK / FOLLOWERS MODAL (Opens only when clicking followers or following) --- */}
      {showNetworkModal && (
        <div className="modal-overlay" onClick={() => setShowNetworkModal(false)} style={{ zIndex: 1050 }}>
          <div className="modal-card network-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge-glow">
                  <IconUsers size={20} color="#10B981" />
                </div>
                <div>
                  <h3 className="modal-title">Do'stlar va Kuzatuvchilar</h3>
                  <p className="modal-subtitle">Intizomli do'stlaringiz tarmog'i</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowNetworkModal(false)}
              >
                &times;
              </button>
            </div>

            {/* Modal Internal Tabs */}
            <div className="network-modal-tabs">
              <button
                type="button"
                className={`net-dialog-tab ${networkModalTab === 'followers' ? 'active' : ''}`}
                onClick={() => setNetworkModalTab('followers')}
              >
                Kuzatuvchilar ({profileExtras.followers?.length || 0})
              </button>
              <button
                type="button"
                className={`net-dialog-tab ${networkModalTab === 'following' ? 'active' : ''}`}
                onClick={() => setNetworkModalTab('following')}
              >
                Kuzatilyapti ({profileExtras.following?.length || 0})
              </button>
              <button
                type="button"
                className={`net-dialog-tab ${networkModalTab === 'suggestions' ? 'active' : ''}`}
                onClick={() => setNetworkModalTab('suggestions')}
              >
                Tavsiyalar
              </button>
              {profileExtras.followRequests?.length > 0 && (
                <button
                  type="button"
                  className={`net-dialog-tab ${networkModalTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setNetworkModalTab('requests')}
                >
                  So'rovlar ({profileExtras.followRequests.length})
                </button>
              )}
            </div>

            <div className="network-modal-body">
              {/* Followers List */}
              {networkModalTab === 'followers' && (
                <div className="users-list-scroll">
                  {profileExtras.followers?.length === 0 ? (
                    <div className="empty-dialog-state">
                      <IconUsers size={32} color="#64748B" />
                      <span>Hozircha sizda kuzatuvchilar yo'q</span>
                    </div>
                  ) : (
                    profileExtras.followers.map((usr) => (
                      <div key={usr.id} className="user-dialog-row">
                        <div className="user-follow-avatar" style={{ background: usr.avatarGradient || 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                          {usr.name?.[0] || 'U'}
                        </div>
                        <div className="user-follow-meta">
                          <span className="user-follow-name">{usr.name}</span>
                          <span className="user-follow-streak">
                            <IconFlame size={13} /> {usr.streak} kun streak
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Following List */}
              {networkModalTab === 'following' && (
                <div className="users-list-scroll">
                  {profileExtras.following?.length === 0 ? (
                    <div className="empty-dialog-state">
                      <IconUsers size={32} color="#64748B" />
                      <span>Siz hali hech kimni kuzatmayapsiz</span>
                    </div>
                  ) : (
                    profileExtras.following.map((usr) => (
                      <div key={usr.id} className="user-dialog-row">
                        <div className="user-follow-avatar" style={{ background: usr.avatarGradient || 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                          {usr.name?.[0] || 'U'}
                        </div>
                        <div className="user-follow-meta">
                          <span className="user-follow-name">{usr.name}</span>
                          <span className="user-follow-streak">
                            <IconFlame size={13} /> {usr.streak} kun streak
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-unfollow-dialog"
                          onClick={() => handleUnfollow(usr.id)}
                        >
                          To'xtatish
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Suggestions List */}
              {networkModalTab === 'suggestions' && (
                <div className="users-list-scroll">
                  {suggestedUsers.length === 0 ? (
                    <div className="empty-dialog-state">
                      <span>Yangi tavsiyalar yo'q</span>
                    </div>
                  ) : (
                    suggestedUsers.map((sug) => (
                      <div key={sug.id} className="user-dialog-row">
                        <div className="user-follow-avatar" style={{ background: sug.avatarGradient }}>
                          {sug.name?.[0] || 'U'}
                        </div>
                        <div className="user-follow-meta">
                          <span className="user-follow-name">{sug.name}</span>
                          <span className="user-follow-streak">
                            <IconFlame size={13} /> {sug.streak} kun streak
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn-follow-dialog"
                          onClick={() => handleFollow(sug)}
                        >
                          Follow (+)
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Requests List */}
              {networkModalTab === 'requests' && (
                <div className="users-list-scroll">
                  {profileExtras.followRequests?.map((req) => (
                    <div key={req.id} className="user-dialog-row">
                      <div className="user-follow-avatar" style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}>
                        {req.name?.[0] || 'U'}
                      </div>
                      <div className="user-follow-meta">
                        <span className="user-follow-name">{req.name}</span>
                        <span className="user-follow-streak">
                          <IconFlame size={13} /> {req.streak} kun streak
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-accept-dialog"
                        onClick={() => handleAcceptRequest(req)}
                      >
                        Qabul qilish
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer-btns">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowNetworkModal(false)}
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD SOCIAL ACCOUNT MODAL --- */}
      {showAddSocialModal && (
        <div className="modal-overlay" onClick={() => setShowAddSocialModal(false)} style={{ zIndex: 1050 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <div className="modal-icon-badge-glow">
                  <IconSocialPlatform platform={selectedPlatform} size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Ijtimoiy Tarmoq Ulash</h3>
                  <p className="modal-subtitle">Platforma va foydalanuvchi nomingizni kiriting</p>
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
                <label className="form-label">Platformani tanlang</label>
                <div className="platform-select-chips">
                  {SOCIAL_PLATFORMS.map((plat) => (
                    <button
                      key={plat.id}
                      type="button"
                      className={`plat-chip ${selectedPlatform === plat.id ? 'active' : ''}`}
                      onClick={() => setSelectedPlatform(plat.id)}
                    >
                      <IconSocialPlatform platform={plat.id} size={16} />
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
                    placeholder="foydalanuvchi_nomi"
                    value={socialUsername}
                    onChange={(e) => setSocialUsername(e.target.value)}
                    required
                  />
                </div>
                <span className="form-hint">Profil havolangiz avtomatik yaratiladi</span>
              </div>

              <div className="modal-footer-btns">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowAddSocialModal(false)}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="btn-save-primary"
                >
                  <IconCheck size={16} color="#080D05" />
                  <span>Qo'shish</span>
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
