export function rewriteWithNextDomain(
  currentUrl: string,
  domains?: string[],
): string | null {
  if (!domains || domains.length === 0) return null;
  try {
    const u = new URL(currentUrl);
    const currentHostname = u.hostname;
    const currentPort = u.port;
    const currentHost = `${currentHostname}${currentPort ? `:${currentPort}` : ''}`;
    const normalized = domains
      .map((d) => {
        try {
          const du = new URL(d.startsWith('http') ? d : `https://${d}`);
          return {
            hostname: du.hostname,
            port: du.port,
            protocol: du.protocol,
          };
        } catch {
          // Fallback: parse as hostname only, reuse current URL protocol/port
          return { hostname: d, port: '', protocol: u.protocol } as {
            hostname: string;
            port: string;
            protocol: string;
          };
        }
      })
      .filter((d) => !!d.hostname);

    if (normalized.length === 0) return null;

    let idx = -1;
    for (let i = normalized.length - 1; i >= 0; i--) {
      const candHost = `${normalized[i].hostname}${normalized[i].port ? `:${normalized[i].port}` : ''}`;
      if (candHost === currentHost) {
        idx = i;
        break;
      }
    }

    const total = normalized.length;
    for (let step = 1; step <= total; step++) {
      const nextIdx = ((idx >= 0 ? idx : -1) + step) % total;
      const candidate = normalized[nextIdx];
      const candidateHost = `${candidate.hostname}${candidate.port ? `:${candidate.port}` : ''}`;
      if (candidateHost !== currentHost) {
        u.hostname = candidate.hostname;
        // If the candidate specifies a port, use it; otherwise clear port to default (do not force current port)
        if (
          candidate.port !== undefined &&
          candidate.port !== null &&
          candidate.port !== ''
        ) {
          u.port = candidate.port;
        } else {
          u.port = '';
        }
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
  if (retryIndex > 0 && addQuery) {
    try {
      const u = new URL(nextUrl);
      const originalQuery = u.search.startsWith('?')
        ? u.search.slice(1)
        : u.search;
      if (typeof addQuery === 'function') {
        const newQuery = addQuery({ times: retryIndex, originalQuery });
        // If function returns an empty string, clear query; otherwise set as provided
        u.search = newQuery ? `?${newQuery.replace(/^\?/, '')}` : '';
        nextUrl = u.toString();
      } else if (addQuery === true) {
        nextUrl = appendRetryCountQuery(nextUrl, retryIndex, queryKey);
      }
    } catch {
      // Fallback to boolean behavior if URL parsing fails
      if (addQuery === true) {
        nextUrl = appendRetryCountQuery(nextUrl, retryIndex, queryKey);
      }
    }
  }
  return nextUrl;
}
