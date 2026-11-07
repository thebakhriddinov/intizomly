/**
 * Announcement Sanitizer & Text Extractor
 * Ensures announcement messages NEVER leak raw JSON code onto UI screens.
 */

export function getCleanAnnouncementText(msg) {
  if (!msg) return '';
  if (typeof msg === 'object') {
    return String(msg.text || msg.message || '').trim();
  }

  if (typeof msg === 'string') {
    let current = msg.trim();

    // 1. If wrapped in outer double-quotes from stringify: e.g. "{\"text\":...}"
    if ((current.startsWith('"') && current.endsWith('"')) || (current.startsWith("'") && current.endsWith("'"))) {
      try {
        const unquoted = JSON.parse(current);
        if (typeof unquoted === 'string') {
          current = unquoted.trim();
        } else if (typeof unquoted === 'object' && unquoted !== null) {
          if (unquoted.text !== undefined) return String(unquoted.text).trim();
          if (unquoted.message !== undefined) return String(unquoted.message).trim();
        }
      } catch {}
    }

    // 2. Loop unwrap in case of JSON stringification
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

    // 3. Handle unescaped or escaped JSON string patterns like:
    // {"text":"hello!","priority":"normal",...} or {\"text\":\"hello!\",...}
    if (current.includes('text') && (current.includes('{') || current.includes(':'))) {
      // Try regex matching: "text":"..." or \"text\":\"...\"
      const match = current.match(/\\?["']?text\\?["']?\s*:\s*\\?["']([^\\"']+)\\?["']/i);
      if (match && match[1]) {
        return match[1].trim();
      }

      // Fallback regex matching unquoted text value before next comma or brace
      const matchUnquoted = current.match(/\\?["']?text\\?["']?\s*:\s*([^,}\\]+)/i);
      if (matchUnquoted && matchUnquoted[1]) {
        const val = matchUnquoted[1].replace(/^[\\"']+/, '').replace(/[\\"']+$/, '').trim();
        if (val) return val;
      }
    }

    // 4. If string still looks like a JSON block (starts with { and has "priority" or "target")
    // but couldn't find text, extract first sensible phrase or strip
    if (current.startsWith('{') && (current.includes('priority') || current.includes('duration_days') || current.includes('target'))) {
      try {
        // Strip everything between quotes before priority/duration
        const fallbackMatch = current.match(/["']([^"']{1,200})["']/);
        if (fallbackMatch && fallbackMatch[1] && !['text', 'priority', 'normal', 'urgent', 'all', 'target'].includes(fallbackMatch[1])) {
          return fallbackMatch[1].trim();
        }
      } catch {}
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
