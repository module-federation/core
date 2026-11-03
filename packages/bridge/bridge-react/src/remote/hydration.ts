import type { BridgeSSRBrowserSession } from '../ssr';
import type { BridgeProviderInstance, RenderParams } from '../types';

export function hasRemoteSSRSession(instanceId: string | undefined): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(instanceId && window.__MF_BRIDGE_SSR__?.get(instanceId))
  );
}

/** Preserve the streamed subtree while the host hydrates its own container. */
export function readRemoteSSRHTML(instanceId: string | undefined) {
  if (typeof document === 'undefined' || !instanceId) return null;
  const container = document.getElementById(instanceId);
  if (container?.hasAttribute('data-mf-bridge-ssr')) {
    window.__MF_BRIDGE_SSR__?.expect(instanceId);
  }
  if (!hasRemoteSSRSession(instanceId)) return null;
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
  provider: BridgeProviderInstance,
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
  const { snapshot, identifierPrefix, updates } = await (session.ready ||
    session.done);
  if (!isActive()) return false;
  await provider.hydrate({
    ...initialParams,
    snapshot,
    updates,
    rootOptions: {
      ...initialParams.rootOptions,
      identifierPrefix,
      onRecoverableError(error) {
        // Releasing a session rejects pending loader updates. Its abandoned
        // hydration work must not recover a document that has already moved on.
        if (!isActive()) return;
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
