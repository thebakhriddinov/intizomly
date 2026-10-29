import React from 'react';

/**
 * Intizomly — Premium Vector Icon System
 * Replaces plain text emojis and flat stickers with crafted, theme-adaptive SVG emblems.
 */

export function IconFocus({ size = 20, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-focus ${className}`}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill={color} />
      <line x1="12" y1="1" x2="12" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="1" y1="12" x2="4" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="12" x2="23" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconAlarm({ size = 20, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-alarm ${className}`}>
      <circle cx="12" cy="13" r="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9v4l2.5 2.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 3L2 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 3l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 19l-2 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 19l2 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLightbulb({ size = 20, className = '', color = '#F59E0B' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-lightbulb ${className}`}>
      <path d="M9 18h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M10 21h4" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" fill="rgba(245, 158, 11, 0.15)" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      <path d="M10 9h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function IconSilent({ size = 18, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-silent ${className}`}>
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M18.63 13A17.89 17.89 0 0 1 18 8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M18 8a6 6 0 0 0-9.33-5" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="#F43F5E" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconTrophy({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-trophy ${className}`}>
      <defs>
        <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <path d="M8 21h8m-4-4v4m-5-8a5 5 0 0 0 10 0V4H7v5z" stroke="url(#trophyGold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(245, 158, 11, 0.2)" />
      <path d="M7 6H4a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4h1" stroke="url(#trophyGold)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 6h3a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4h-1" stroke="url(#trophyGold)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconMedal({ rank = 1, size = 22, className = '' }) {
  const configs = {
    1: { grad: ['#FDE68A', '#F59E0B', '#D97706'], text: '#78350F', border: '#F59E0B' },
    2: { grad: ['#FFFFFF', '#CBD5E1', '#94A3B8'], text: '#1E293B', border: '#CBD5E1' },
    3: { grad: ['#FED7AA', '#F97316', '#C2410C'], text: '#7C2D12', border: '#F97316' }
  };
  const conf = configs[rank] || configs[1];

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-medal ${className}`}>
      <defs>
        <linearGradient id={`medalGrad_${rank}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={conf.grad[0]} />
          <stop offset="50%" stopColor={conf.grad[1]} />
          <stop offset="100%" stopColor={conf.grad[2]} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="14" r="7" fill={`url(#medalGrad_${rank})`} stroke={conf.border} strokeWidth="1" />
      <path d="M8.5 2l3.5 5 3.5-5H18l-4 7h-4L6 2h2.5z" fill={`url(#medalGrad_${rank})`} opacity="0.85" />
      <text x="12" y="17" textAnchor="middle" fill={conf.text} fontSize="9" fontWeight="900" fontFamily="sans-serif">
        {rank}
      </text>
    </svg>
  );
}

export function IconFlame({ size = 20, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-flame ${className}`}>
      <defs>
        <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
      </defs>
      <path
        d="M8.5 14.5A3.5 3.5 0 0 0 12 18a3.5 3.5 0 0 0 3.5-3.5c0-1.5-.75-2.5-1.5-3.5-.5.75-1.25 1-2 1-.5-1 0-2.5 1-3.5C11 9 9 10.5 9 12.5c-.5-.5-.8-.9-.5-2.5C7.2 11.2 8.5 13.5 8.5 14.5z"
        fill="url(#flameGrad)"
      />
      <path
        d="M12 2c1.5 3 4.5 4.5 5.5 8.5 1.2 4.8-1.5 8.5-5.5 9.5-4 1-8.5-1.8-8.5-6.5C3.5 8.5 7.5 7 9 4c1 2 2.5 2.5 3-2z"
        stroke="url(#flameGrad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconShield({ size = 22, className = '', color = '#10B981' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-shield ${className}`}>
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        fill="rgba(16, 185, 129, 0.15)"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBook({ size = 22, className = '', color = '#3B82F6' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-book ${className}`}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="rgba(59, 130, 246, 0.15)" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconWater({ size = 22, className = '', color = '#06B6D4' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-water ${className}`}>
      <path
        d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
        fill="rgba(6, 182, 212, 0.2)"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 11a3 3 0 0 1 3 3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconNoSugar({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-nosugar ${className}`}>
      <rect x="5" y="7" width="14" height="12" rx="3" stroke="#F43F5E" strokeWidth="2" fill="rgba(244, 63, 94, 0.15)" />
      <line x1="3" y1="3" x2="21" y2="21" stroke="#F43F5E" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M9 11h6M9 15h6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function IconSword({ size = 22, className = '', color = '#8B5CF6' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-sword ${className}`}>
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="13" y1="19" x2="19" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="16" x2="20" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="21" x2="21" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconCrown({ size = 22, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-crown ${className}`}>
      <path
        d="M2 19h20M5 19l-3-12 6.5 4L12 4l3.5 7L22 7l-3 12H5z"
        stroke="#F59E0B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(245, 158, 11, 0.2)"
      />
      <circle cx="2" cy="7" r="1" fill="#F59E0B" />
      <circle cx="12" cy="4" r="1" fill="#F59E0B" />
      <circle cx="22" cy="7" r="1" fill="#F59E0B" />
    </svg>
  );
}

export function IconLightning({ size = 20, className = '', color = '#B6F36B' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-lightning ${className}`}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="rgba(182, 243, 107, 0.25)" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDiamond({ size = 20, className = '', color = '#06B6D4' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-icon app-icon-diamond ${className}`}>
      <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="rgba(6, 182, 212, 0.2)" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 9h20M12 21L8 9l4-6 4 6-4 12z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Category / Theme Specific Icons
export function IconCategory({ category = 'Tartib', size = 18, className = '' }) {
  const norm = String(category).toLowerCase();

  if (norm.includes("sog'") || norm.includes('salomat') || norm.includes('health') || norm.includes('suv')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-cat-icon health ${className}`}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#10B981" strokeWidth="2" fill="rgba(16, 185, 129, 0.2)" />
      </svg>
    );
  }

  if (norm.includes("o'q") || norm.includes('kitob') || norm.includes('ilm') || norm.includes('read')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-cat-icon study ${className}`}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="#3B82F6" strokeWidth="2" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="#3B82F6" strokeWidth="2" />
      </svg>
    );
  }

  if (norm.includes('sport') || norm.includes('mashq') || norm.includes('fitness')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-cat-icon sport ${className}`}>
        <path d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (norm.includes('maqsad') || norm.includes('reja') || norm.includes('target')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-cat-icon target ${className}`}>
        <circle cx="12" cy="12" r="10" stroke="#8B5CF6" strokeWidth="2" />
        <circle cx="12" cy="12" r="6" stroke="#8B5CF6" strokeWidth="2" fill="rgba(139, 92, 246, 0.2)" />
        <circle cx="12" cy="12" r="2" fill="#8B5CF6" />
      </svg>
    );
  }

  if (norm.includes('ish') || norm.includes('biznes') || norm.includes('work')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-cat-icon work ${className}`}>
        <rect x="2" y="7" width="20" height="14" rx="2" stroke="#06B6D4" strokeWidth="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="#06B6D4" strokeWidth="2" />
      </svg>
    );
  }

  // Default: Tartib / Intizom
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`app-cat-icon order ${className}`}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="#B6F36B" strokeWidth="2" fill="rgba(182, 243, 107, 0.2)" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Social platform vector icons
export function IconSocialPlatform({ platform = 'telegram', size = 18, className = '' }) {
  const p = String(platform).toLowerCase();

  if (p === 'telegram' || p === 'tg') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`app-social-icon tg ${className}`}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z" />
      </svg>
    );
  }

  if (p === 'instagram' || p === 'ig') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-social-icon ig ${className}`}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }

  if (p === 'github' || p === 'gh') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`app-social-icon gh ${className}`}>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    );
  }

  if (p === 'youtube' || p === 'yt') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`app-social-icon yt ${className}`}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  if (p === 'x' || p === 'twitter') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`app-social-icon x-twitter ${className}`}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }

  if (p === 'linkedin') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`app-social-icon linkedin ${className}`}>
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-social-icon web ${className}`}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

// Custom crafted vector UI icons to eliminate plain stickers
export function IconCalendar({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-calendar ${className}`}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function IconGrid({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-grid ${className}`}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export function IconEdit({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-edit ${className}`}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function IconLock({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-lock ${className}`}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function IconUnlock({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-unlock ${className}`}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

export function IconCheck({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-check ${className}`}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconUsers({ size = 18, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-users ${className}`}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function IconCode({ size = 18, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-code ${className}`}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

export function IconLaptop({ size = 18, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-laptop ${className}`}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

export function IconAnalytics({ size = 18, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-analytics ${className}`}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

export function IconVideo({ size = 18, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-video ${className}`}>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

export function IconMegaphone({ size = 18, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-megaphone ${className}`}>
      <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
  );
}

export function IconDocumentCsv({ size = 18, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-doc ${className}`}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export function IconAuditShield({ size = 18, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-audit ${className}`}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

export function IconPlus({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-plus ${className}`}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function IconTrash({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-trash ${className}`}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function IconRefresh({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-refresh ${className}`}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

export function IconSearch({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-search ${className}`}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IconTarget({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-target ${className}`}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function IconRunner({ size = 18, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-runner ${className}`}>
      <circle cx="14" cy="4" r="2" />
      <path d="M4 17l4-2 3-5-2-2h4l2 3 4 1" />
      <path d="M7 21l3-4" />
      <path d="M15 13l2 5 4 1" />
    </svg>
  );
}

export function IconUserPlus({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-user-plus ${className}`}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

export function IconEye({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-eye ${className}`}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEyeOff({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-eye-off ${className}`}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export function IconBan({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-ban ${className}`}>
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  );
}

export function IconPending({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-pending ${className}`}>
      <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
    </svg>
  );
}

export function IconLayers({ size = 16, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-icon app-icon-layers ${className}`}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

/**
 * HabitGlyphIcon - Replaces flat emoji stickers with crafted vector emblems
 */
export function HabitGlyphIcon({ emoji = '', category = '', title = '', size = 18, className = '' }) {
  const combined = `${emoji} ${category} ${title}`.toLowerCase();

  let IconComponent = IconTarget;
  let accentColor = '#10B981';
  let bgColor = 'rgba(16, 185, 129, 0.12)';

  if (combined.includes('💧') || combined.includes('suv') || combined.includes('water')) {
    IconComponent = IconWater;
    accentColor = '#06B6D4';
    bgColor = 'rgba(6, 182, 212, 0.15)';
  } else if (combined.includes('📚') || combined.includes('📖') || combined.includes('kitob') || combined.includes('read') || combined.includes("o'qish")) {
    IconComponent = IconBook;
    accentColor = '#3B82F6';
    bgColor = 'rgba(59, 130, 246, 0.15)';
  } else if (combined.includes('🏃') || combined.includes('sport') || combined.includes('mashq') || combined.includes('yugurish')) {
    IconComponent = IconRunner;
    accentColor = '#F59E0B';
    bgColor = 'rgba(245, 158, 11, 0.15)';
  } else if (combined.includes('🔥') || combined.includes('shijoat') || combined.includes('olov')) {
    IconComponent = IconFlame;
    accentColor = '#EF4444';
    bgColor = 'rgba(239, 68, 68, 0.15)';
  } else if (combined.includes('⚡') || combined.includes('quvvat') || combined.includes('energiya')) {
    IconComponent = IconLightning;
    accentColor = '#B6F36B';
    bgColor = 'rgba(182, 243, 107, 0.15)';
  } else if (combined.includes('👑') || combined.includes('yetakchi') || combined.includes('maqsad')) {
    IconComponent = IconCrown;
    accentColor = '#F59E0B';
    bgColor = 'rgba(245, 158, 11, 0.15)';
  } else if (combined.includes('💎') || combined.includes('boylik') || combined.includes('invest')) {
    IconComponent = IconDiamond;
    accentColor = '#06B6D4';
    bgColor = 'rgba(6, 182, 212, 0.15)';
  } else if (combined.includes('🛡️') || combined.includes('intizom') || combined.includes('sabot')) {
    IconComponent = IconShield;
    accentColor = '#10B981';
    bgColor = 'rgba(16, 185, 129, 0.15)';
  } else if (combined.includes('⏰') || combined.includes('vaqt') || combined.includes('uyg')) {
    IconComponent = IconAlarm;
    accentColor = '#8B5CF6';
    bgColor = 'rgba(139, 92, 246, 0.15)';
  } else if (combined.includes('🚫') || combined.includes('shakar') || combined.includes('tashlash')) {
    IconComponent = IconNoSugar;
    accentColor = '#F43F5E';
    bgColor = 'rgba(244, 63, 94, 0.15)';
  }

  return (
    <div
      className={`habit-vector-badge ${className}`}
      style={{
        width: `${size + 14}px`,
        height: `${size + 14}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '10px',
        backgroundColor: bgColor,
        border: `1px solid ${accentColor}33`,
        flexShrink: 0
      }}
    >
      <IconComponent size={size} color={accentColor} />
    </div>
  );
}



