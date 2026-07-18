import type { HostHydrationContext } from './ssrContext';

// Kept in sync with server.mjs, which injects the script server-side.
export const HOST_SSR_CONTEXT_SCRIPT_ID = 'bridge-ssr-host-context';

export function readHostSSRContextFromDocument():
  | HostHydrationContext
  | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const script = document.getElementById(HOST_SSR_CONTEXT_SCRIPT_ID);
  if (!script?.textContent) {
    return undefined;
  }

  try {
    return JSON.parse(script.textContent) as HostHydrationContext;
  } catch {
    return undefined;
  }
}
