import { ModuleFederation } from '../../src';

const instance = new ModuleFederation({ name: 'types', remotes: [] });

export const manifestLoading: Record<string, Promise<unknown>> = instance
  .snapshotHandler.manifestLoading;
export const registerRemote: (...args: any[]) => void =
  instance.remoteHandler.registerRemote;
export const initTokens: object = instance.sharedHandler.initTokens;
