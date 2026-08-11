import type { RouteLocationNormalizedLoaded } from 'vue-router';

/**
 * Trailing catch-all segment used by Vue Router and meta-framework hosts
 * (e.g. Vue `/:pathMatch(.*)*`, Nuxt `/:path(.*)*`, `/*`).
 */
const CATCH_ALL_SUFFIX = /\/(?::[^/()*]+(?:\([^)]*\))?|\*)\*?$/;

/**
 * Strip a trailing catch-all param from a route record path.
 * Returns `'/'` when the path is only a catch-all at the root.
 */
export function stripCatchAllPath(path: string): string {
  const stripped = path.replace(CATCH_ALL_SUFFIX, '');
  return stripped === '' ? '/' : stripped;
}

function isCatchAllPath(path: string): boolean {
  return CATCH_ALL_SUFFIX.test(path);
}

/**
 * Derive the Bridge remote basename from the host route.
 *
 * Prefers the last matched record that looks like a catch-all (nested layouts),
 * otherwise the last matched path. Compatible with Vue Router and Nuxt catch-alls.
 */
export function deriveBasenameFromRoute(
  route: Pick<RouteLocationNormalizedLoaded, 'matched'> | null | undefined,
): string {
  const matched = route?.matched;
  if (!matched?.length) {
    return '/';
  }

  for (let i = matched.length - 1; i >= 0; i--) {
    const path = matched[i]?.path;
    if (path && isCatchAllPath(path)) {
      return stripCatchAllPath(path);
    }
  }

  const lastPath = matched[matched.length - 1]?.path;
  return lastPath ? stripCatchAllPath(lastPath) : '/';
}

/**
 * Resolve basename for a Bridge remote mount.
 * Explicit `basename` always wins (mirrors React Bridge host override).
 */
export function resolveRemoteBasename(options: {
  basename?: string;
  route?: Pick<RouteLocationNormalizedLoaded, 'matched'> | null;
}): string {
  if (typeof options.basename === 'string' && options.basename.length > 0) {
    return options.basename;
  }
  return deriveBasenameFromRoute(options.route);
}
