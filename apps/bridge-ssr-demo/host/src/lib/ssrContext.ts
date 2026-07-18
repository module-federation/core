import {
  assertBridgeSSRReference,
  toBridgeSSRReference,
  type BridgeSSRReference,
  type BridgeSSRResult,
} from '@module-federation/bridge-shared';

export type RemoteSSRData = BridgeSSRResult | BridgeSSRReference;

export type HostSSRContext = {
  url: string;
  vueRemote?: RemoteSSRData;
};

export type HostHydrationContext = {
  url: string;
  vueRemote?: BridgeSSRReference;
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
    ...(context.vueRemote ? { vueRemote: toReference(context.vueRemote) } : {}),
  };
}
