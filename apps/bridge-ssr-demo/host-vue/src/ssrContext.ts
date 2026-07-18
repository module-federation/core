import {
  assertBridgeSSRReference,
  toBridgeSSRReference,
  type BridgeSSRReference,
  type BridgeSSRResult,
} from '@module-federation/bridge-shared';

export type RemoteSSRData = BridgeSSRResult | BridgeSSRReference;

export type HostSSRContext = {
  url: string;
  reactRemote?: RemoteSSRData;
  reactPair?: [RemoteSSRData, RemoteSSRData];
};

export type HostHydrationContext = {
  url: string;
  reactRemote?: BridgeSSRReference;
  reactPair?: [BridgeSSRReference, BridgeSSRReference];
};

function toReference(data: RemoteSSRData): BridgeSSRReference {
  if ('html' in data) return toBridgeSSRReference(data);
  assertBridgeSSRReference(data);
  return data;
}

export function toHostHydrationContext(
  context: HostSSRContext,
): HostHydrationContext {
  return {
    url: context.url,
    ...(context.reactRemote
      ? { reactRemote: toReference(context.reactRemote) }
      : {}),
    ...(context.reactPair
      ? {
          reactPair: context.reactPair.map(toReference) as [
            BridgeSSRReference,
            BridgeSSRReference,
          ],
        }
      : {}),
  };
}

export const HOST_SSR_CONTEXT_SCRIPT_ID = 'bridge-ssr-host-context';

export function readHostSSRContext() {
  const script = document.getElementById(HOST_SSR_CONTEXT_SCRIPT_ID);
  if (!script?.textContent) return undefined;
  try {
    return JSON.parse(script.textContent) as HostHydrationContext;
  } catch {
    return undefined;
  }
}
