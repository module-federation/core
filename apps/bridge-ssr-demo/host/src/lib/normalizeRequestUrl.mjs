/**
 * Restrict request URLs to same-origin pathnames with search for SSR routing.
 *
 * Single source of truth shared by the Express server (`server.mjs`) and the
 * bundled host code (`prepareSSRContext.ts`).
 *
 * @param {string} url
 * @param {string} [fallback]
 * @returns {string}
 */
export function normalizeBridgeRequestUrl(url, fallback = '/') {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  const trimmed = url.trim();
  if (
    /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed) ||
    trimmed.startsWith('//')
  ) {
    return fallback;
  }

  const withoutHash = trimmed.split('#')[0] ?? '';
  const pathname = withoutHash.startsWith('/')
    ? withoutHash
    : `/${withoutHash}`;

  return pathname || fallback;
}
