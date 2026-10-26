export type Locale = 'zh' | 'en';

const storageKey = 'mf-workspace-locale';

export function getLocale(): Locale {
  if (typeof window === 'undefined') return 'zh';
  const query = new URLSearchParams(window.location.search).get('lang');
  if (query === 'en' || query === 'zh') return query;
  try {
    return window.localStorage.getItem(storageKey) === 'en' ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
}

export function t(zh: string, en: string): string {
  return getLocale() === 'en' ? en : zh;
}

export function initializeLocale() {
  const locale = getLocale();
  document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN';
  document.title = t(
    'MF Workspace · 分层应用实验室',
    'MF Workspace · Application Lab',
  );
  try {
    window.localStorage.setItem(storageKey, locale);
  } catch {
    // The URL remains the source of truth when storage is unavailable.
  }
}

/** Keep the locale in links and history even when browser storage is disabled. */
export function localeUrl(path: string): string {
  const url = new URL(path, window.location.origin);
  url.searchParams.set('lang', getLocale());
  return `${url.pathname}${url.search}${url.hash}`;
}

export function changeLocale(locale: Locale) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', locale);
  try {
    window.localStorage.setItem(storageKey, locale);
  } catch {
    // Reload with the explicit locale regardless of storage availability.
  }
  window.location.assign(url.href);
}
