/**
 * Announcement Sanitizer & Text Extractor
 * Ensures announcement messages NEVER leak raw JSON code onto UI screens.
 */

export function getCleanAnnouncementText(msg) {
  if (!msg) return '';
  if (typeof msg === 'object') {
    return msg.text || msg.message || '';
  }
  if (typeof msg === 'string') {
    const trimmed = msg.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          if (parsed.text !== undefined) return parsed.text;
          if (parsed.message !== undefined) return parsed.message;
        }
      } catch {}
    }
  }
  return msg;
}

export function sanitizeAnnouncement(ann) {
  if (!ann) return null;
  let text = ann.message;
  let priority = ann.priority || 'normal';
  let target = ann.target || 'all';
  let duration_days = ann.duration_days || null;
  let expires_at = ann.expires_at || null;
  let pushed_at = ann.pushed_at || null;

  if (typeof text === 'object' && text !== null) {
    if (text.text !== undefined) text = text.text;
    if (text.priority) priority = text.priority;
    if (text.target) target = text.target;
    if (text.duration_days !== undefined) duration_days = text.duration_days;
    if (text.expires_at !== undefined) expires_at = text.expires_at;
    if (text.pushed_at !== undefined) pushed_at = text.pushed_at;
  } else if (typeof text === 'string') {
    const trimmed = text.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          if (parsed.text !== undefined) text = parsed.text;
          if (parsed.priority) priority = parsed.priority;
          if (parsed.target) target = parsed.target;
          if (parsed.duration_days !== undefined) duration_days = parsed.duration_days;
          if (parsed.expires_at !== undefined) expires_at = parsed.expires_at;
          if (parsed.pushed_at !== undefined) pushed_at = parsed.pushed_at;
        }
      } catch {}
    }
  }

  return {
    ...ann,
    message: typeof text === 'string' ? text : String(text || ''),
    priority,
    target,
    duration_days,
    expires_at,
    pushed_at
  };
}

