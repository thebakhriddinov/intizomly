import os
import re

CSS_PATH = r"c:\Users\LOQ\Desktop\intizomly\css\style.css"

with open(CSS_PATH, "r", encoding="utf-8") as f:
    css = f.read()

# 1. Update Root Tokens & Appearance
old_tokens_pattern = r"/\* =+.*?INTIZOMLY — APPLE iOS.*?/\* --------------------------------------------------------------------------\s+2\. RESET"

new_tokens_section = """/* ==========================================================================
   INTIZOMLY — LIQUID GLASS & FLUID MOTION DESIGN SYSTEM
   Visual Identity: Fluid Glassmorphism, Morphing Mesh Blobs, Dynamic Waves, Tactile Physics
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. COLOR PALETTE & LIQUID GLASS APPEARANCE TOKENS
   -------------------------------------------------------------------------- */
:root {
  /* Default Appearance: Liquid Obsidian Glass (Dark Mode default for max liquid luminosity) */
  --bg-app: #080B11;
  --bg-primary: rgba(16, 22, 32, 0.78);
  --bg-secondary: rgba(26, 36, 52, 0.62);
  --bg-surface: rgba(22, 30, 44, 0.70);
  --bg-surface-elevated: rgba(36, 48, 68, 0.82);
  --bg-card: rgba(18, 25, 36, 0.68);
  --bg-glass: rgba(15, 21, 30, 0.78);
  --bg-overlay: rgba(4, 7, 12, 0.82);

  /* Typography Colors */
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --text-disabled: #475569;

  /* Liquid Glass Specular Borders */
  --border: rgba(255, 255, 255, 0.12);
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(182, 243, 107, 0.45);
  --border-focus: #B6F36B;

  /* Liquid Neon Accents & Semantics */
  --primary-accent: #B6F36B;
  --primary-accent-hover: #9EE050;
  --primary-accent-subtle: rgba(182, 243, 107, 0.18);
  --primary-accent-border: rgba(182, 243, 107, 0.42);
  --primary-text-contrast: #080D05;

  --liquid-cyan: #06B6D4;
  --liquid-emerald: #10B981;
  --liquid-violet: #A855F7;
  --liquid-amber: #F59E0B;

  --success: #34D399;
  --success-subtle: rgba(52, 211, 153, 0.18);
  --warning: #FBBF24;
  --warning-subtle: rgba(251, 191, 36, 0.18);
  --error: #F87171;
  --error-subtle: rgba(248, 113, 113, 0.18);

  /* Modern Fluid Typography Stack */
  --font-stack: "Manrope", -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif;

  /* Spacing Scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Liquid Smooth Radii */
  --radius-xs: 8px;
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-card: 22px;
  --radius-hero: 30px;
  --radius-full: 9999px;

  /* Liquid Ambient Glass Shadows */
  --shadow-subtle: 0 2px 8px rgba(0, 0, 0, 0.35);
  --shadow-card: 0 12px 36px -4px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.16);
  --shadow-floating: 0 24px 54px -8px rgba(0, 0, 0, 0.72), 0 0 32px rgba(182, 243, 107, 0.2);
  --shadow-modal: 0 32px 72px -12px rgba(0, 0, 0, 0.82), 0 0 40px rgba(16, 185, 129, 0.22);

  /* Fluid Motion Transitions */
  --transition-fast: 0.18s cubic-bezier(0.2, 0, 0, 1);
  --transition-normal: 0.28s cubic-bezier(0.2, 0, 0, 1);
  --transition-spring: 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.25);
  --transition-liquid: 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Layout dimensions */
  --sidebar-width: 255px;
  --header-height: 64px;
  --mobile-nav-height: 60px;
}

/* --------------------------------------------------------------------------
   DARK MODE SYSTEM (Explicit or System Dark)
   -------------------------------------------------------------------------- */
[data-appearance="dark"],
:root:not([data-appearance="light"]) {
  --bg-app: #080B11;
  --bg-primary: rgba(16, 22, 32, 0.78);
  --bg-secondary: rgba(26, 36, 52, 0.62);
  --bg-surface: rgba(22, 30, 44, 0.70);
  --bg-surface-elevated: rgba(36, 48, 68, 0.82);
  --bg-card: rgba(18, 25, 36, 0.68);
  --bg-glass: rgba(15, 21, 30, 0.78);
  --bg-overlay: rgba(4, 7, 12, 0.82);

  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --text-disabled: #475569;

  --border: rgba(255, 255, 255, 0.12);
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(182, 243, 107, 0.45);
  --border-focus: #B6F36B;

  --primary-accent: #B6F36B;
  --primary-accent-hover: #9EE050;
  --primary-accent-subtle: rgba(182, 243, 107, 0.18);
  --primary-accent-border: rgba(182, 243, 107, 0.42);
  --primary-text-contrast: #080D05;
}

/* --------------------------------------------------------------------------
   EXPLICIT LIGHT MODE (Liquid Milky Glass + Fresh Emerald Glow)
   -------------------------------------------------------------------------- */
[data-appearance="light"] {
  --bg-app: #EFF3F9;
  --bg-primary: rgba(255, 255, 255, 0.85);
  --bg-secondary: rgba(240, 245, 252, 0.82);
  --bg-surface: rgba(248, 250, 254, 0.85);
  --bg-surface-elevated: rgba(228, 236, 248, 0.90);
  --bg-card: rgba(255, 255, 255, 0.76);
  --bg-glass: rgba(255, 255, 255, 0.84);
  --bg-overlay: rgba(15, 23, 42, 0.48);

  --text-primary: #0F172A;
  --text-secondary: #475569;
  --text-muted: #64748B;
  --text-disabled: #CBD5E1;

  --border: rgba(15, 23, 42, 0.09);
  --border-subtle: rgba(15, 23, 42, 0.05);
  --border-hover: rgba(16, 185, 129, 0.42);
  --border-focus: #10B981;

  --primary-accent: #10B981;
  --primary-accent-hover: #059669;
  --primary-accent-subtle: rgba(16, 185, 129, 0.14);
  --primary-accent-border: rgba(16, 185, 129, 0.35);
  --primary-text-contrast: #FFFFFF;

  --shadow-card: 0 10px 30px -4px rgba(15, 23, 42, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.95);
  --shadow-floating: 0 20px 45px -6px rgba(15, 23, 42, 0.15), 0 0 24px rgba(16, 185, 129, 0.15);
  --shadow-modal: 0 32px 70px -8px rgba(15, 23, 42, 0.25);
}

/* --------------------------------------------------------------------------
   THEME TINTS (PRO Themes with Liquid Luminous Palettes)
   -------------------------------------------------------------------------- */
[data-theme="violet"] {
  --primary-accent: #C084FC;
  --primary-accent-hover: #A855F7;
  --primary-accent-subtle: rgba(192, 132, 252, 0.20);
  --primary-accent-border: rgba(192, 132, 252, 0.45);
  --primary-text-contrast: #150529;
}

[data-theme="oled"] {
  --bg-app: #020305;
  --bg-primary: rgba(10, 13, 20, 0.88);
  --bg-card: rgba(12, 16, 24, 0.82);
  --primary-accent: #B6F36B;
}

[data-theme="cyber"] {
  --primary-accent: #38BDF8;
  --primary-accent-hover: #0ea5e9;
  --primary-accent-subtle: rgba(56, 189, 248, 0.20);
  --primary-accent-border: rgba(56, 189, 248, 0.45);
  --primary-text-contrast: #041E34;
}

[data-theme="gold"] {
  --primary-accent: #FBBF24;
  --primary-accent-hover: #f59e0b;
  --primary-accent-subtle: rgba(251, 191, 36, 0.20);
  --primary-accent-border: rgba(251, 191, 36, 0.45);
  --primary-text-contrast: #241402;
}

/* --------------------------------------------------------------------------
   2. RESET"""

css = re.sub(old_tokens_pattern, new_tokens_section, css, flags=re.DOTALL)

# Add Liquid Background Layer and Liquid Morphing Animations after reset
reset_marker = "/* Scrollbar (Subtle Mac/iOS Style) */"

liquid_engine_css = """/* --------------------------------------------------------------------------
   2.5. LIQUID BACKGROUND ENGINE & ORGANIC MORPHING BLOBS
   -------------------------------------------------------------------------- */
.liquid-bg-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.liquid-blob {
  position: absolute;
  filter: blur(85px);
  opacity: 0.65;
  mix-blend-mode: screen;
  will-change: transform, border-radius;
  pointer-events: none;
}

[data-appearance="light"] .liquid-blob {
  opacity: 0.35;
  mix-blend-mode: multiply;
  filter: blur(95px);
}

.liquid-blob-1 {
  width: 640px;
  height: 640px;
  top: -120px;
  left: -120px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.65) 0%, rgba(6, 182, 212, 0.35) 60%, transparent 80%);
  animation: liquidMorph1 18s ease-in-out infinite alternate;
}

.liquid-blob-2 {
  width: 580px;
  height: 580px;
  top: 15%;
  right: -150px;
  background: radial-gradient(circle, rgba(182, 243, 107, 0.58) 0%, rgba(52, 211, 153, 0.32) 65%, transparent 80%);
  animation: liquidMorph2 22s ease-in-out infinite alternate;
}

.liquid-blob-3 {
  width: 680px;
  height: 680px;
  bottom: -160px;
  left: 15%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.48) 0%, rgba(99, 102, 241, 0.28) 60%, transparent 80%);
  animation: liquidMorph3 26s ease-in-out infinite alternate;
}

.liquid-blob-4 {
  width: 540px;
  height: 540px;
  bottom: 20%;
  right: 12%;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.42) 0%, rgba(239, 68, 68, 0.2) 65%, transparent 80%);
  animation: liquidMorph4 20s ease-in-out infinite alternate;
}

.liquid-mesh-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 15%, rgba(255, 255, 255, 0.04) 0%, transparent 70%);
  pointer-events: none;
}

@keyframes liquidMorph1 {
  0% {
    border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }
  50% {
    border-radius: 70% 30% 46% 54% / 30% 29% 71% 70%;
    transform: translate3d(90px, 60px, 0) rotate(140deg) scale(1.15);
  }
  100% {
    border-radius: 50% 50% 30% 70% / 50% 50% 70% 30%;
    transform: translate3d(-60px, 80px, 0) rotate(280deg) scale(0.92);
  }
}

@keyframes liquidMorph2 {
  0% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  }
  50% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
    transform: translate3d(-80px, -60px, 0) rotate(-160deg) scale(1.18);
  }
  100% {
    border-radius: 65% 35% 55% 45% / 40% 65% 35% 60%;
    transform: translate3d(40px, -40px, 0) rotate(-320deg) scale(0.95);
  }
}

@keyframes liquidMorph3 {
  0% {
    border-radius: 38% 62% 63% 37% / 41% 44% 56% 59%;
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    border-radius: 60% 40% 40% 60% / 30% 60% 40% 70%;
    transform: translate3d(70px, -70px, 0) scale(1.12);
  }
  100% {
    border-radius: 45% 55% 75% 25% / 60% 35% 65% 40%;
    transform: translate3d(-50px, -40px, 0) scale(0.95);
  }
}

@keyframes liquidMorph4 {
  0% {
    border-radius: 50% 50% 30% 70% / 50% 50% 70% 30%;
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    border-radius: 70% 30% 50% 50% / 30% 70% 50% 50%;
    transform: translate3d(50px, 60px, 0) scale(1.16);
  }
  100% {
    border-radius: 35% 65% 45% 55% / 55% 40% 60% 45%;
    transform: translate3d(-40px, 40px, 0) scale(0.94);
  }
}

/* Interactive Liquid Click Ripple */
.liquid-ripple-drop {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(182, 243, 107, 0.48) 0%, rgba(16, 185, 129, 0.22) 40%, rgba(6, 182, 212, 0.08) 65%, transparent 75%);
  transform: translate(-50%, -50%) scale(0);
  animation: liquidRippleSpread 0.65s cubic-bezier(0.12, 0.8, 0.3, 1) forwards;
  pointer-events: none;
  z-index: 25;
}

@keyframes liquidRippleSpread {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -50%) scale(2.8);
    opacity: 0;
  }
}

"""

if reset_marker in css:
    css = css.replace(reset_marker, liquid_engine_css + reset_marker)

# Ensure app-layout has relative positioning and glass backdrop
css = css.replace(".app-layout {", """.app-layout {
  position: relative;
  z-index: 1;""")

css = css.replace(".app-main-wrapper {", """.app-main-wrapper {
  position: relative;
  z-index: 1;
  background-color: transparent;""")

with open(CSS_PATH, "w", encoding="utf-8") as f:
    f.write(css)

print("Liquid tokens and background engine applied successfully!")
