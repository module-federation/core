import type { BridgeSSRResult } from '@module-federation/bridge-shared';

export type HostSSRContext = {
  url: string;
  vueRemote?: BridgeSSRResult;
};
