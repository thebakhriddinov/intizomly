import re

CSS_PATH = r"c:\Users\LOQ\Desktop\intizomly\css\style.css"

with open(CSS_PATH, "r", encoding="utf-8") as f:
    css = f.read()

# 1. Update filter chips
filter_old = """.filter-chip {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 12.5px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.filter-chip:hover {
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.filter-chip.active {
  background: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
  font-weight: 600;
}"""

filter_new = """.filter-chip {
  background: var(--bg-primary);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 12.5px;
  font-weight: 550;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.filter-chip:hover {
  color: var(--text-primary);
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.filter-chip.active {
  background: linear-gradient(135deg, #10B981 0%, #B6F36B 100%);
  color: #080D05;
  border-color: transparent;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(182, 243, 107, 0.45);
}"""

if filter_old in css:
    css = css.replace(filter_old, filter_new)

# 2. Update modal-card
modal_old = """.modal-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-hero);
  box-shadow: var(--shadow-modal);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalScale 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}"""

modal_new = """.modal-card {
  background: var(--bg-card);
  backdrop-filter: blur(32px) saturate(210%);
  -webkit-backdrop-filter: blur(32px) saturate(210%);
  border: 1px solid var(--border);
  border-radius: var(--radius-hero);
  box-shadow: var(--shadow-modal);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalScale 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.modal-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
  pointer-events: none;
}"""

if modal_old in css:
    css = css.replace(modal_old, modal_new)

# 3. Update demo-user-btn
demo_old = """.demo-user-btn {
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  box-shadow: var(--shadow-subtle);
  transition: all var(--transition-fast);
}

.demo-user-btn:hover {
  border-color: var(--border-hover);
}"""

demo_new = """.demo-user-btn {
  background: var(--bg-primary);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  box-shadow: var(--shadow-subtle);
  transition: all var(--transition-fast);
}

.demo-user-btn:hover {
  border-color: var(--primary-accent);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(182, 243, 107, 0.25);
}"""

if demo_old in css:
    css = css.replace(demo_old, demo_new)

# 4. Update admin-kpi-card
kpi_old = """.admin-kpi-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 2px;
}"""

kpi_new = """.admin-kpi-card {
  background: var(--bg-secondary);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: all var(--transition-fast);
}

.admin-kpi-card:hover {
  transform: translateY(-2px);
  border-color: rgba(182, 243, 107, 0.35);
}"""

if kpi_old in css:
    css = css.replace(kpi_old, kpi_new)

# 5. Update auth tabs & modal tabs active state
css = css.replace(
""".auth-tab-btn.active {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-weight: 600;
  box-shadow: var(--shadow-subtle);
}""",
""".auth-tab-btn.active {
  background: linear-gradient(135deg, #10B981 0%, #B6F36B 100%);
  color: #080D05;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(182, 243, 107, 0.4);
}"""
)

css = css.replace(
""".modal-tab-btn.active {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-weight: 600;
  box-shadow: var(--shadow-subtle);
}""",
""".modal-tab-btn.active {
  background: linear-gradient(135deg, #10B981 0%, #B6F36B 100%);
  color: #080D05;
  font-weight: 700;
  box-shadow: 0 4px 14px rgba(182, 243, 107, 0.4);
}"""
)

with open(CSS_PATH, "w", encoding="utf-8") as f:
    f.write(css)

print("Modals and chips liquid style applied successfully!")
