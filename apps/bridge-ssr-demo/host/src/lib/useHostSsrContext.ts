import { useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { readHostSSRContextFromDocument } from './hostSsrContext';
import { resolveHostSsrContextForLocation } from './remoteRoutes';
import type { HostSSRContext } from './ssrContext';

function getLocationUrl(pathname: string, search: string) {
  return `${pathname}${search}`;
}

function seedPathname(context?: HostSSRContext) {
  return context?.url?.split('?')[0]?.split('#')[0];
}

/**
 * Nuxt-style SSR takeover:
 * - Direct visit / hard refresh: use SSR payload embedded in the document (or passed from server render).
 * - Client-side navigations: no document reload; remotes mount via federated CSR + bridge hydrate.
 *
 * After the user navigates away from the seeded path, never re-attach the
 * document SSR reference — even if they return to the same URL.
 */
export function useHostSsrContext(initialContext?: HostSSRContext) {
  const location = useLocation();
  const locationUrl = getLocationUrl(location.pathname, location.search);
  const documentContext = useMemo(() => readHostSSRContextFromDocument(), []);
  const seedPathRef = useRef(
    seedPathname(initialContext) ?? seedPathname(documentContext),
  );
  const seedConsumedRef = useRef(false);

  if (seedPathRef.current && location.pathname !== seedPathRef.current) {
    seedConsumedRef.current = true;
  }

  const seedContext = seedConsumedRef.current
    ? undefined
    : seedPathname(initialContext) === location.pathname
      ? initialContext
      : seedPathname(documentContext) === location.pathname
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
