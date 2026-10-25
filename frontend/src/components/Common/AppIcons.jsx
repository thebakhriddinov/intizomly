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

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`app-social-icon web ${className}`}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
