import type { ProviderFnParams } from '../../types';
import { createReact18Root, hydrateReact18Root } from './v18';
import { createServerBridgeComponent } from './bridge-server';
import { renderBridgeReactToString } from './server-renderer';

export function createBridgeComponent<T = any>(
  bridgeInfo: Omit<ProviderFnParams<T>, 'createRoot' | 'hydrateRoot'>,
) {
  return createServerBridgeComponent({
    ...bridgeInfo,
    createRoot: createReact18Root,
    hydrateRoot: hydrateReact18Root,
    serverRenderer: renderBridgeReactToString,
  });
}

export type { CreateRootOptions, Root } from './v18';
