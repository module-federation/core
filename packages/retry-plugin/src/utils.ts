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
    // Remove existing retry count query to avoid duplication
    u.searchParams.delete(key);
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

  // Clean baseUrl of any existing retry query parameters to prevent accumulation
  let cleanBaseUrl = baseUrl;
  try {
    const urlObj = new URL(baseUrl);
    urlObj.searchParams.delete(queryKey);
    cleanBaseUrl = urlObj.toString();
  } catch {
    // If URL parsing fails, proceed with the original URL
  }

  let nextUrl = rewriteWithNextDomain(cleanBaseUrl, domains) ?? cleanBaseUrl;

  if (retryIndex > 0 && addQuery) {
    try {
      const u = new URL(nextUrl);
      // Parse original URL but get query without the retry parameter
      const originalUrl = new URL(baseUrl);
      originalUrl.searchParams.delete(queryKey);
      const originalQuery = originalUrl.search.startsWith('?')
        ? originalUrl.search.slice(1)
        : originalUrl.search;

      if (typeof addQuery === 'function') {
        const newQuery = addQuery({ times: retryIndex, originalQuery });
        // If function returns an empty string, clear query; otherwise replace existing query
        u.search = newQuery ? `?${newQuery.replace(/^\?/, '')}` : '';
        nextUrl = u.toString();
      } else if (addQuery === true) {
        // Remove existing retry count query to avoid duplication
        u.searchParams.delete(queryKey);
        u.searchParams.set(queryKey, String(retryIndex));
        nextUrl = u.toString();
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

/**
 * Extract domain/host info from a URL and combine it with path/query from another URL
 * This is useful for domain rotation while preserving original path and query parameters
 * @param domainUrl - URL containing the target domain/host
 * @param pathQueryUrl - URL containing the target path and query parameters
 * @returns Combined URL with domain from domainUrl and path/query from pathQueryUrl
 */
export function combineUrlDomainWithPathQuery(
  domainUrl: string,
  pathQueryUrl: string,
): string {
  try {
    const domainUrlObj = new URL(domainUrl);
    const pathQueryUrlObj = new URL(pathQueryUrl);

    // Use the domain/host from domainUrl but path/query from pathQueryUrl
    domainUrlObj.pathname = pathQueryUrlObj.pathname;
    domainUrlObj.search = pathQueryUrlObj.search;

    return domainUrlObj.toString();
  } catch {
    // Fallback to pathQueryUrl if parsing fails
    return pathQueryUrl;
  }
}
