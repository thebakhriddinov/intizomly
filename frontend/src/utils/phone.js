// ============================================================================
// O'zbekiston telefon raqamlarini tekshirish va formatlash yordamchisi
// ============================================================================

/**
 * Telefon raqamidan faqat raqamlarni ajratib oladi va O'zbekiston kodi (998) bilan normallashtiradi
 * @param {string} rawPhone
 * @returns {{ isValid: boolean, normalized: string, formatted: string, message?: string }}
 */
export function validateUzbekPhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string' || !rawPhone.trim()) {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      message: "Telefon raqamini kiriting"
    };
  }

  const digits = rawPhone.replace(/\D/g, '');

  let normalized = '';

  if (digits.length === 9) {
    // Masalan: 901234567 yoki 701265759
    normalized = '998' + digits;
  } else if (digits.length === 12 && digits.startsWith('998')) {
    // Masalan: 998901234567
    normalized = digits;
  } else {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      message: "O'zbekiston telefon raqamini to'g'ri kiriting (masalan: 90 123 45 67 yoki +998 70 126 57 59)"
    };
  }

  // Operator kodini tekshirish (998 dan keyingi 2 ta raqam)
  const operatorCode = normalized.slice(3, 5);
  const validCodes = [
    '90', '91', '93', '94', '95', '97', '98', '99', // Beeline, Ucell, Mobiuz, UMS
    '33', '88', // Humans
    '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', // Shahar va maxsus
    '50', '55', '20'
  ];

  if (!validCodes.includes(operatorCode)) {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      message: `Noto'g'ri operator kodi (${operatorCode}). O'zbekiston raqamini kiriting.`
    };
  }

  return {
    isValid: true,
    normalized,
    formatted: formatUzbekPhone(normalized)
  };
}

/**
 * 998XXXXXXXXX formatidagi raqamni "+998 (XX) XXX-XX-XX" ko'rinishida formatlaydi
 * @param {string} raw
 * @returns {string}
 */
export function formatUzbekPhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  let full = digits;
  if (digits.length === 9) {
    full = '998' + digits;
  }
  if (full.length === 12 && full.startsWith('998')) {
    const code = full.slice(3, 5);
    const p1 = full.slice(5, 8);
    const p2 = full.slice(8, 10);
    const p3 = full.slice(10, 12);
    return `+998 (${code}) ${p1}-${p2}-${p3}`;
  }
  return raw;
}

/**
 * Telefon raqamini Supabase Auth tizimidagi ichki email identifikatoriga o'giradi
 * @param {string} phoneOrDigits
 * @returns {string}
 */
export function phoneToAuthEmail(phoneOrDigits) {
  if (!phoneOrDigits) return '';
  const digits = String(phoneOrDigits).replace(/\D/g, '');
  const full = digits.length === 9 ? '998' + digits : digits;
  return `${full}@phone.intizomly.uz`;
}
