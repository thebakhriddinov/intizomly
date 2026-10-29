import React, { memo } from 'react';

function BrandLogoComponent({
  size = 'md', // 'sm' | 'md' | 'lg'
  showText = true,
  roleBadge = null,
  onClick,
  className = '',
  style = {}
}) {
  return (
    <div
      className={`intizomly-brand-logo size-${size} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={style}
    >
      <div className={`brand-logo-frame ${showText ? 'with-wordmark' : 'icon-only'}`}>
        <img
          src={showText ? '/intizomly-logo.png' : '/icons/icon-192.png'}
          alt="Intizomly"
          className={showText ? 'brand-logo-img' : 'brand-logo-icon'}
          draggable={false}
          loading="eager"
        />
      </div>

      {roleBadge && (
        <div className="brand-role-badge-wrap">
          {roleBadge}
        </div>
      )}
    </div>
  );
}

export const BrandLogo = memo(BrandLogoComponent);
