import type { BridgeSSRResult } from '@module-federation/bridge-shared';

export type HostSSRContext = {
  url: string;
  reactRemote?: BridgeSSRResult;
  reactPair?: [BridgeSSRResult, BridgeSSRResult];
};

export const HOST_SSR_CONTEXT_SCRIPT_ID = 'bridge-ssr-host-context';

export function readHostSSRContext() {
  const script = document.getElementById(HOST_SSR_CONTEXT_SCRIPT_ID);
  if (!script?.textContent) return undefined;
  try {
    return JSON.parse(script.textContent) as HostSSRContext;
  } catch {
    return undefined;
  }
}
