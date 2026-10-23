import re

CSS_PATH = r"c:\Users\LOQ\Desktop\intizomly\css\style.css"

with open(CSS_PATH, "r", encoding="utf-8") as f:
    css = f.read()

# 1. Update app-sidebar
css = css.replace(
"""  background-color: var(--bg-primary);
  border-right: 1px solid var(--border);
  padding: var(--space-5) var(--space-4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 100;
  overflow-y: auto;
}""",
"""  background-color: var(--bg-primary);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border-right: 1px solid var(--border);
  padding: var(--space-5) var(--space-4);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 100;
  overflow-y: auto;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
}"""
)

# 2. Update app-header
css = css.replace(
"""  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-8);
  gap: var(--space-4);
}""",
"""  backdrop-filter: blur(28px) saturate(210%);
  -webkit-backdrop-filter: blur(28px) saturate(210%);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-8);
  gap: var(--space-4);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}"""
)

# 3. Update stat-card
stat_card_old = """.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-3);
  box-shadow: var(--shadow-card);
}"""

stat_card_new = """.stat-card {
  background: var(--bg-card);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-3);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
  transition: transform var(--transition-liquid), box-shadow var(--transition-liquid), border-color var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-4px) scale(1.008);
  border-color: rgba(182, 243, 107, 0.45);
  box-shadow: 0 20px 48px -10px rgba(16, 185, 129, 0.32), 0 0 24px rgba(182, 243, 107, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.25);
}

.stat-card::before,
.week-strip-card::before,
.github-heatmap-card::before,
.habit-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.35) 50%, transparent 100%);
  pointer-events: none;
}"""

if stat_card_old in css:
    css = css.replace(stat_card_old, stat_card_new)

# 4. Update week-strip-card
week_old = """.week-strip-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: var(--space-5) var(--space-6);
  box-shadow: var(--shadow-card);
}"""

week_new = """.week-strip-card {
  background: var(--bg-card);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: var(--space-5) var(--space-6);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
  transition: transform var(--transition-liquid), box-shadow var(--transition-liquid), border-color var(--transition-fast);
}

.week-strip-card:hover {
  border-color: rgba(182, 243, 107, 0.35);
  box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.45), 0 0 20px rgba(182, 243, 107, 0.15);
}"""

if week_old in css:
    css = css.replace(week_old, week_new)

# 5. Update github-heatmap-card
gh_old = """.github-heatmap-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  box-shadow: var(--shadow-card);
}"""

gh_new = """.github-heatmap-card {
  background: var(--bg-card);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  box-shadow: var(--shadow-card);
  position: relative;
  overflow: hidden;
  transition: transform var(--transition-liquid), box-shadow var(--transition-liquid), border-color var(--transition-fast);
}

.github-heatmap-card:hover {
  border-color: rgba(182, 243, 107, 0.35);
  box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.45), 0 0 20px rgba(182, 243, 107, 0.15);
}"""

if gh_old in css:
    css = css.replace(gh_old, gh_new)

# 6. Update habit-card
habit_card_old = """.habit-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-3);
  box-shadow: var(--shadow-card);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.habit-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-floating);
}"""

habit_card_new = """.habit-card {
  background: var(--bg-card);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-3);
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-liquid), box-shadow var(--transition-liquid), border-color var(--transition-fast), opacity var(--transition-normal);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.habit-card:hover {
  transform: translateY(-4px) scale(1.008);
  border-color: rgba(182, 243, 107, 0.45);
  box-shadow: 0 20px 48px -10px rgba(16, 185, 129, 0.32), 0 0 24px rgba(182, 243, 107, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.25);
}"""

if habit_card_old in css:
    css = css.replace(habit_card_old, habit_card_new)

# 7. Update progress bar fill & wave
bar_old = """.stat-progress-bar-container {
  width: 100%;
  height: 4px;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: var(--space-2);
}

.stat-progress-bar-fill {
  height: 100%;
  background: var(--primary-accent);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}"""

bar_new = """.stat-progress-bar-container {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: var(--space-2);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
}

.stat-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981 0%, #06B6D4 25%, #B6F36B 50%, #38BDF8 75%, #10B981 100%);
  background-size: 250% 100%;
  animation: liquidWaveFlow 3.5s linear infinite;
  box-shadow: 0 0 16px rgba(182, 243, 107, 0.7);
  border-radius: var(--radius-full);
  position: relative;
  overflow: hidden;
  transition: width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-progress-bar-fill::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%);
  animation: liquidSheen 2.2s infinite;
}

@keyframes liquidWaveFlow {
  0% { background-position: 0% 50%; }
  100% { background-position: 250% 50%; }
}

@keyframes liquidSheen {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}"""

if bar_old in css:
    css = css.replace(bar_old, bar_new)

# 8. Update progress ring fill
ring_old = """.progress-ring-fill {
  transition: stroke-dashoffset 0.4s ease;
  stroke: var(--primary-accent);
}"""

ring_new = """.progress-ring-fill {
  transition: stroke-dashoffset 0.4s ease;
  stroke: var(--primary-accent);
  filter: drop-shadow(0 0 8px #B6F36B) drop-shadow(0 0 16px rgba(16, 185, 129, 0.5));
  animation: liquidRingBreathe 3s ease-in-out infinite alternate;
}

@keyframes liquidRingBreathe {
  0% { filter: drop-shadow(0 0 6px #B6F36B) drop-shadow(0 0 12px rgba(16, 185, 129, 0.4)); }
  100% { filter: drop-shadow(0 0 12px #B6F36B) drop-shadow(0 0 24px rgba(16, 185, 129, 0.8)); }
}"""

if ring_old in css:
    css = css.replace(ring_old, ring_new)

# 9. Update habit checkbox with jelly physics
chk_old = """.habit-checkbox-btn {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: transparent;
  border: 2px solid var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all var(--transition-spring);
}"""

chk_new = """.habit-checkbox-btn {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all var(--transition-spring);
  position: relative;
}

.habit-checkbox-btn:hover {
  border-color: var(--primary-accent);
  transform: scale(1.08);
  box-shadow: 0 0 12px rgba(182, 243, 107, 0.35);
}"""

if chk_old in css:
    css = css.replace(chk_old, chk_new)

chk_done_old = """.habit-card.is-completed .habit-checkbox-btn {
  background: var(--primary-accent);
  border-color: var(--primary-accent);
}"""

chk_done_new = """.habit-card.is-completed .habit-checkbox-btn {
  background: linear-gradient(135deg, #10B981 0%, #B6F36B 100%);
  border-color: transparent;
  box-shadow: 0 0 18px rgba(182, 243, 107, 0.75), inset 0 2px 4px rgba(255, 255, 255, 0.5);
  animation: liquidJellyBounce 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes liquidJellyBounce {
  0% { transform: scale(1); }
  25% { transform: scale(1.3, 0.75); }
  50% { transform: scale(0.82, 1.25); }
  75% { transform: scale(1.12, 0.92); }
  100% { transform: scale(1); }
}"""

if chk_done_old in css:
    css = css.replace(chk_done_old, chk_done_new)

# 10. Update streak flame dance
flame_old = """.streak-fire-anim {
  font-size: 1.25rem;
  line-height: 1;
}"""

flame_new = """.streak-fire-anim {
  font-size: 1.25rem;
  line-height: 1;
  display: inline-block;
  animation: liquidFlameDance 1.8s ease-in-out infinite alternate;
  filter: drop-shadow(0 0 10px rgba(255, 110, 0, 0.85)) drop-shadow(0 0 20px rgba(255, 180, 0, 0.45));
}

@keyframes liquidFlameDance {
  0% { transform: translateY(0) scale(1) rotate(-3deg); }
  50% { transform: translateY(-4px) scale(1.15) rotate(4deg); }
  100% { transform: translateY(0) scale(1) rotate(-2deg); }
}"""

if flame_old in css:
    css = css.replace(flame_old, flame_new)

# 11. Update ios-notif-banner
notif_old = """.ios-notif-banner {
  pointer-events: auto;
  background: var(--bg-glass);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 12px 16px;
  box-shadow: var(--shadow-floating);
  display: flex;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  animation: slideDownIOS 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  transition: transform 0.22s ease, opacity 0.22s ease;
}"""

notif_new = """.ios-notif-banner {
  pointer-events: auto;
  background: var(--bg-glass);
  backdrop-filter: blur(32px) saturate(210%);
  -webkit-backdrop-filter: blur(32px) saturate(210%);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 24px;
  padding: 14px 18px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6), 0 0 24px rgba(182, 243, 107, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.35);
  display: flex;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  animation: liquidIslandDrop 0.45s cubic-bezier(0.16, 1.15, 0.3, 1);
  transition: transform 0.22s ease, opacity 0.22s ease;
}

@keyframes liquidIslandDrop {
  0% {
    transform: translateY(-80px) scale(0.65);
    opacity: 0;
    filter: blur(10px);
  }
  60% {
    transform: translateY(10px) scale(1.05, 0.94);
    opacity: 1;
    filter: blur(0);
  }
  80% {
    transform: translateY(-3px) scale(0.98, 1.02);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}"""

if notif_old in css:
    css = css.replace(notif_old, notif_new)

# 12. Update primary-btn
btn_old = """.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 16px;
  background: var(--primary-accent);
  color: var(--primary-text-contrast);
  font-size: 13.5px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.primary-btn:hover {
  background: var(--primary-accent-hover);
}"""

btn_new = """.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  padding: 0 18px;
  background: linear-gradient(135deg, #10B981 0%, #34D399 50%, #06B6D4 100%);
  background-size: 200% 200%;
  color: #041E15;
  font-size: 13.5px;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-sm);
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1);
  white-space: nowrap;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.45);
}

.primary-btn:hover {
  background-position: right center;
  box-shadow: 0 10px 28px rgba(16, 185, 129, 0.55), inset 0 1px 2px rgba(255, 255, 255, 0.6);
  transform: translateY(-2px) scale(1.02);
}"""

if btn_old in css:
    css = css.replace(btn_old, btn_new)

# 13. Update GitHub squares
gh_sq_old = """.gh-square {
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.gh-square:hover {
  transform: scale(1.3);
  z-index: 5;
}"""

gh_sq_new = """.gh-square {
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
  border-radius: 4px;
}

.gh-square:hover {
  transform: scale(1.5);
  z-index: 8;
  box-shadow: 0 0 12px var(--primary-accent);
}"""

if gh_sq_old in css:
    css = css.replace(gh_sq_old, gh_sq_new)

with open(CSS_PATH, "w", encoding="utf-8") as f:
    f.write(css)

print("Liquid components updated successfully!")
