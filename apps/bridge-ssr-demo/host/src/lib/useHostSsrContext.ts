import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { readHostSSRContextFromDocument } from './hostSsrContext';
import { resolveHostSsrContextForLocation } from './remoteRoutes';
import type { HostSSRContext } from './ssrContext';

function getLocationUrl(pathname: string, search: string) {
  return `${pathname}${search}`;
}

/**
 * Nuxt-style SSR takeover:
 * - Direct visit / hard refresh: use SSR payload embedded in the document (or passed from server render).
 * - Client-side navigations: no document reload; remotes mount via federated CSR + bridge hydrate.
 */
export function useHostSsrContext(initialContext?: HostSSRContext) {
  const location = useLocation();
  const locationUrl = getLocationUrl(location.pathname, location.search);
  const documentContext = useMemo(() => readHostSSRContextFromDocument(), []);

  const seedContext =
    initialContext?.url?.split('?')[0]?.split('#')[0] === location.pathname
      ? initialContext
      : documentContext?.url?.split('?')[0]?.split('#')[0] === location.pathname
        ? documentContext
        : undefined;

  const ssrContext = useMemo(
    () =>
      resolveHostSsrContextForLocation(
        locationUrl,
        location.pathname,
        seedContext,
      ),
    [location.pathname, locationUrl, seedContext],
  );

  return { ssrContext };
}
