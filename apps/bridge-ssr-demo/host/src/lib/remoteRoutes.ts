import type { HostSSRContext } from './ssrContext';

export const VUE_REMOTE_BASENAME = '/vue-remote';
export const VUE_REMOTE_MODULE = 'bridge_ssr_vue';

export function isVueRemotePath(pathname: string) {
  return pathname.startsWith(VUE_REMOTE_BASENAME);
}

/**
 * Keep SSR payload only when it matches the active URL and remote route.
 * Client navigations without a document reload use CSR (no remote SSR fields).
 */
export function resolveHostSsrContextForLocation(
  locationUrl: string,
  pathname: string,
  seed?: HostSSRContext,
): HostSSRContext {
  const context: HostSSRContext = { url: locationUrl };
  const seedPath = seed?.url?.split('?')[0]?.split('#')[0];

  if (!seed || seedPath !== pathname) {
    return context;
  }

  if (isVueRemotePath(pathname) && seed.vueRemote) {
    context.vueRemote = seed.vueRemote;
  }

  return context;
}
