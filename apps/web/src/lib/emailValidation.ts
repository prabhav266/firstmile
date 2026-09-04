// Comprehensive client-side email format, typo, and disposable domain detection

const COMMON_TYPOS: Record<string, string> = {
  // Gmail typos
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmai.co': 'gmail.com',
  'gmaill.co': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaio.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gmaill.in': 'gmail.com',
  'gmai.in': 'gmail.com',
  'gemail.com': 'gmail.com',
  'gmali.com': 'gmail.com',
  'gmaul.com': 'gmail.com',

  // Yahoo typos
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhaoo.com': 'yahoo.com',
  'yaho.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yaho.in': 'yahoo.in',

  // Microsoft typos
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlook.con': 'outlook.com',
  'outlok.co': 'outlook.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmial.con': 'hotmail.com',
};

const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', '10minutemail.com', 'mailinator.com', 'guerrillamail.com',
  'sharklasers.com', 'yopmail.com', 'dispostable.com', 'trashmail.com',
  'getairmail.com', 'throwawaymail.com', 'temp-mail.org', 'fakeinbox.com',
  'tempail.com', 'generator.email', 'mohmal.com', 'inboxkitten.com',
  'crazymailing.com', 'mytemp.email', 'trashmail.net', 'burnermail.io',
  'example.com', 'test.com', 'fake.com', 'invalid.com',
]);

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = (email || '').trim().toLowerCase();

  if (!trimmed) {
    return { valid: false, error: 'Please enter your email address' };
  }

  // Standard email RFC 5322 regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed) || trimmed.includes('..')) {
    return { valid: false, error: 'Please enter a valid email address (e.g. name@domain.com)' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'Invalid email address' };
  }

  const [localPart, domain] = parts;

  if (localPart.length < 2) {
    return { valid: false, error: 'Email username is too short' };
  }

  // Check for common domain typos
  if (COMMON_TYPOS[domain]) {
    const suggestion = COMMON_TYPOS[domain];
    return {
      valid: false,
      error: `Did you mean @${suggestion}? Please check the spelling of your email.`,
    };
  }

  // Check for disposable domains
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: 'Temporary or disposable email domains are not allowed. Please enter your real email.',
    };
  }

  return { valid: true };
}
