export function rewriteWithNextDomain(
  currentUrl: string,
  domains?: string[],
): string | null {
  if (!domains || domains.length === 0) return null;
  try {
    const u = new URL(currentUrl);
    const currentHost = u.host;
    const normalized = domains
      .map((d) => {
        try {
          const du = new URL(d.startsWith('http') ? d : `https://${d}`);
          return { host: du.host, protocol: du.protocol };
        } catch {
          return { host: d, protocol: u.protocol };
        }
      })
      .filter((d) => !!d.host);

    if (normalized.length === 0) return null;

    let idx = -1;
    for (let i = normalized.length - 1; i >= 0; i--) {
      if (normalized[i].host === currentHost) {
        idx = i;
        break;
      }
    }

    const total = normalized.length;
    for (let step = 1; step <= total; step++) {
      const nextIdx = ((idx >= 0 ? idx : -1) + step) % total;
      const candidate = normalized[nextIdx];
      if (candidate.host !== currentHost) {
        u.host = candidate.host;
        u.protocol = candidate.protocol || u.protocol;
        return u.toString();
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function appendRetryCountQuery(
  url: string,
  retryIndex: number,
  key: string = 'retryCount',
): string {
  try {
    const u = new URL(url);
    u.searchParams.set(key, String(retryIndex));
    return u.toString();
  } catch {
    return url;
  }
}

export function getRetryUrl(
  baseUrl: string,
  opts: {
    domains?: string[];
    addQuery?:
      | boolean
      | ((context: { times: number; originalQuery: string }) => string);
    retryIndex?: number;
    queryKey?: string;
  } = {},
): string {
  const { domains, addQuery, retryIndex = 0, queryKey = 'retryCount' } = opts;
  let nextUrl = rewriteWithNextDomain(baseUrl, domains) ?? baseUrl;
  if (addQuery && retryIndex > 0) {
    nextUrl = appendRetryCountQuery(nextUrl, retryIndex, queryKey);
  }
  return nextUrl;
}
