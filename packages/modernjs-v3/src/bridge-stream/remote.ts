import { loadRemote } from '@module-federation/runtime';
import type { BridgeProvider } from '@module-federation/bridge-react/ssr';

export interface BridgeRemoteModule {
  default: () => BridgeProvider;
  [key: symbol]: string;
}

/** Browser loading uses the producer's actual application and renderer. */
export async function loadBridgeRemote(
  moduleName: string,
): Promise<BridgeRemoteModule> {
  const remote = await loadRemote<BridgeRemoteModule>(moduleName);
  if (!remote || typeof remote.default !== 'function')
    throw Error(`Bridge application ${moduleName} has no default provider`);
  return remote;
}
