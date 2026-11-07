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
    let current = msg.trim();
    // 1. Loop unwrap in case of JSON stringification
    while (current.startsWith('{') && current.endsWith('}')) {
      try {
        const parsed = JSON.parse(current);
        if (parsed && typeof parsed === 'object') {
          if (parsed.text !== undefined) {
            current = String(parsed.text).trim();
          } else if (parsed.message !== undefined) {
            current = String(parsed.message).trim();
          } else {
            break;
          }
        } else {
          break;
        }
      } catch {
        break;
      }
    }
    // 2. Regex fallback if unclosed or escaped JSON
    if (current.includes('"text":')) {
      const match = current.match(/"text"\s*:\s*"([^"]+)"/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return current;
  }
  return String(msg);
}

export function sanitizeAnnouncement(ann) {
  if (!ann) return null;
  const cleanText = getCleanAnnouncementText(ann.message);
  return {
    ...ann,
    message: cleanText
  };
}
