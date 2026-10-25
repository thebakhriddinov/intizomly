import React, { memo } from 'react';

function BrandLogoComponent({
  size = 'md', // 'sm' | 'md' | 'lg'
  showText = true,
  roleBadge = null,
  onClick,
  className = ''
}) {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  const iconWidth = isLarge ? 52 : isSmall ? 28 : 36;
  const iconHeight = iconWidth;

  return (
    <div
      className={`intizomly-brand-logo size-${size} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="brand-emblem-container" style={{ width: iconWidth, height: iconHeight }}>
        {/* Glow halo behind emblem */}
        <div className="emblem-backlight-glow"></div>

        {/* Master Vector Logo */}
        <svg
          viewBox="0 0 48 48"
          width={iconWidth}
          height={iconHeight}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="brand-emblem-svg"
        >
          <defs>
            {/* Iridescent Border Gradient */}
            <linearGradient id="emblemBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B6F36B" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#10B981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.9" />
            </linearGradient>

            {/* Dark Obsidian Glass Background */}
            <linearGradient id="emblemBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#16222F" />
              <stop offset="50%" stopColor="#0D1520" />
              <stop offset="100%" stopColor="#060A0F" />
            </linearGradient>

            {/* Primary Discipline Flame / Shield Gradient */}
            <linearGradient id="flameGradPrimary" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#D4FF78" />
              <stop offset="35%" stopColor="#B6F36B" />
              <stop offset="75%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Cyan Energy Spark Gradient */}
            <linearGradient id="sparkGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="50%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Specular White Shimmer Overlay */}
            <linearGradient id="specularGleam" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>

            {/* Soft Shadow Filter */}
            <filter id="intizomGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#B6F36B" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* 1. Outer Squircle Base with Metallic Glass Rim */}
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="14"
            fill="url(#emblemBgGrad)"
            stroke="url(#emblemBorderGrad)"
            strokeWidth="1.5"
          />

          {/* 2. Subtle Upper Specular Glass Arch */}
          <path
            d="M3 16C3 8.82 8.82 3 16 3H32C39.18 3 45 8.82 45 16V22C38 18 28 17 20 18C11 19 5 21 3 22V16Z"
            fill="url(#specularGleam)"
            opacity="0.3"
          />

          {/* 3. Dynamic Outer Flame Loop (Left Wing - Emerald / Cyan) */}
          <path
            d="M24 8C20.5 13 14 18 14 26C14 32.5 18.5 37 24 37C22.5 34 22 30.5 23 27C23.8 24.2 26 22 27.5 19.5C28.8 17.3 29.5 14.8 29.2 12C27 10 25.5 8.8 24 8Z"
            fill="url(#sparkGradCyan)"
            opacity="0.9"
          />

          {/* 4. Main Rising Discipline Flame (Ascending Willpower) */}
          <path
            d="M24 7C22 13 16 17.5 16 26.5C16 33.5 20.2 38 25.5 38C31 38 34.5 33.5 34.5 27C34.5 20.5 29 16 27.5 12C26.5 9.5 25.2 8 24 7Z"
            fill="url(#flameGradPrimary)"
            filter="url(#intizomGlow)"
          />

          {/* 5. Crystalline Inner Core Diamond (Unbreakable Discipline) */}
          <path
            d="M24 18L28.5 24.5L24 31L19.5 24.5L24 18Z"
            fill="#FFFFFF"
            opacity="0.22"
          />

          {/* 6. Precision Lightning Checkmark (Habit Complete Action) */}
          <path
            d="M19 25.5L22.5 29L30 19"
            stroke="#080D05"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 25.5L22.5 29L30 19"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 7. Tiny Star/Spark of Inspiration at Crown */}
          <circle cx="24" cy="7.5" r="1.5" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="brand-text-block">
          <div className="brand-title-row">
            <span className="brand-title-main">
              Intizom<span className="brand-title-accent">ly</span>
            </span>
            {roleBadge}
          </div>
          {isLarge && (
            <span className="brand-tagline-micro">DISCIPLINE ENGINE</span>
          )}
        </div>
      )}
    </div>
  );
}

export const BrandLogo = memo(BrandLogoComponent);
