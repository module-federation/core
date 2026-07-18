import type { HostSSRContext } from './ssrContext';

// Kept in sync with server.mjs, which injects the script server-side.
export const HOST_SSR_CONTEXT_SCRIPT_ID = 'bridge-ssr-host-context';

export function readHostSSRContextFromDocument(): HostSSRContext | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const script = document.getElementById(HOST_SSR_CONTEXT_SCRIPT_ID);
  if (!script?.textContent) {
    return undefined;
  }

  try {
    return JSON.parse(script.textContent) as HostSSRContext;
  } catch {
    return undefined;
  }
}
