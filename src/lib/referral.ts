const REFERRAL_STORAGE_KEY = 'nexia_referral_code';

function normalizeCode(value: string | null | undefined) {
  if (!value) return null;

  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '')
    .slice(0, 32);

  return normalized || null;
}

export function getStoredReferralCode() {
  if (typeof window === 'undefined') return null;
  return normalizeCode(window.localStorage.getItem(REFERRAL_STORAGE_KEY));
}

export function storeReferralCode(code: string | null | undefined) {
  if (typeof window === 'undefined') return null;

  const normalized = normalizeCode(code);

  if (!normalized) {
    window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
    return null;
  }

  window.localStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
  return normalized;
}

export function clearStoredReferralCode() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
}

export function captureReferralCodeFromSearch(search: string) {
  const code = new URLSearchParams(search).get('ref');
  return storeReferralCode(code);
}

export function generateReferralCode(seed?: string) {
  const base = (seed || 'NEXIA')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6) || 'NEXIA';

  const random = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  return `${base}-${random}`;
}

export function buildAffiliateShareLink(referralCode: string) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/cadastro?ref=${encodeURIComponent(referralCode)}`;
}

export function buildLoginLinkWithReferral(referralCode: string | null) {
  return referralCode ? `/login?ref=${encodeURIComponent(referralCode)}` : '/login';
}

export function buildSignupLinkWithReferral(referralCode: string | null) {
  return referralCode ? `/cadastro?ref=${encodeURIComponent(referralCode)}` : '/cadastro';
}
