import type { BridgeSSRBrowserSession } from '../ssr';
import type { BridgeProvider, RenderParams } from '../types';

export function hasRemoteSSRSession(instanceId: string | undefined): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(instanceId && window.__MF_BRIDGE_SSR__?.get(instanceId))
  );
}

/** Preserve the streamed subtree while the host hydrates its own container. */
export function readRemoteSSRHTML(instanceId: string | undefined) {
  if (typeof document === 'undefined' || !instanceId) return null;
  if (!hasRemoteSSRSession(instanceId)) return null;
  const container = document.getElementById(instanceId);
  return container ? { __html: container.innerHTML } : null;
}

export function claimRemoteHydration(
  instanceId: string | undefined,
  dom: HTMLElement,
) {
  const runtime = instanceId ? window.__MF_BRIDGE_SSR__ : undefined;
  const session = instanceId ? runtime?.claim(instanceId, dom) : undefined;
  return runtime && session ? { runtime, session } : undefined;
}

/** Hydration is browser work; the server entry never imports this module. */
export async function hydrateRemoteRoot(
  provider: BridgeProvider,
  session: BridgeSSRBrowserSession,
  initialParams: RenderParams,
  isActive: () => boolean,
  onRecoverableError: (error: unknown) => void,
): Promise<boolean> {
  if (!provider.hydrate) {
    throw new Error(
      `Bridge provider ${initialParams.moduleName} does not support hydration.`,
    );
  }
  const { snapshot, identifierPrefix } = await session.done;
  if (!isActive()) return false;
  await provider.hydrate({
    ...initialParams,
    snapshot,
    rootOptions: {
      ...initialParams.rootOptions,
      identifierPrefix,
      onRecoverableError(error) {
        try {
          initialParams.rootOptions?.onRecoverableError?.(error);
        } finally {
          onRecoverableError(error);
        }
      },
    },
  });
  return true;
}
