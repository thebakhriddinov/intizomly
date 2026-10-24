import os

with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

reset_btn_css = """
/* --------------------------------------------------------------------------
   STYLED QAYTA BOSHLASH (RESET TO TODAY) BUTTON
   -------------------------------------------------------------------------- */
.styled-reset-today-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, rgba(182, 243, 107, 0.20) 0%, rgba(16, 185, 129, 0.14) 100%);
  border: 1px solid rgba(182, 243, 107, 0.45);
  color: var(--primary-accent);
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  box-shadow: 0 2px 10px rgba(182, 243, 107, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.35);
  transition: all 0.25s cubic-bezier(0.2, 0, 0, 1);
  cursor: pointer;
  white-space: nowrap;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.styled-reset-today-btn:hover {
  background: linear-gradient(135deg, #10B981 0%, #B6F36B 100%);
  color: #080D05;
  box-shadow: 0 4px 16px rgba(182, 243, 107, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.5);
  transform: translateY(-1px) scale(1.04);
}

.styled-reset-today-btn svg {
  transition: transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.25);
}

.styled-reset-today-btn:hover svg {
  transform: rotate(-180deg);
}

/* --------------------------------------------------------------------------
   SAMSUNG GALAXY A51 / MOBILE GPU PERFORMANCE OPTIMIZATIONS
   -------------------------------------------------------------------------- */
/* Hardware layer compositing without disabling visual effects */
.liquid-blob {
  transform: translate3d(0, 0, 0);
  -webkit-transform: translate3d(0, 0, 0);
  will-change: transform;
  contain: strict;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.liquid-bg-layer {
  contain: strict;
  isolation: isolate;
  transform: translateZ(0);
}

.habit-card {
  contain: layout style paint;
  touch-action: manipulation;
  transform: translate3d(0, 0, 0);
  will-change: transform, box-shadow;
}

.stat-card {
  contain: layout style paint;
  transform: translate3d(0, 0, 0);
}

.week-strip-card, .github-heatmap-card {
  contain: layout style paint;
  transform: translate3d(0, 0, 0);
}

.app-sidebar, .app-header, .mobile-bottom-nav {
  isolation: isolate;
  transform: translateZ(0);
}

/* Prevent 300ms touch delay on mobile buttons */
button, [role="button"], .habit-checkbox-btn, .filter-chip, .week-day-cell, .gh-square {
  touch-action: manipulation;
}
"""

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css + '\n' + reset_btn_css)

print('src/index.css generated successfully!')
