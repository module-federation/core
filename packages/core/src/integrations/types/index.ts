import {
  AsyncContainer,
  RemoteOptions,
  RemoteScope,
  SharedScope,
} from '../../types';

export interface IRemoteScriptFactory {
  loadScript: (
    scope: RemoteScope,
    containerKey: string,
    remoteOptions: RemoteOptions
  ) => AsyncContainer;
}

export interface ISharingScopeFactory {
  initializeSharingScope: (scopeName: string) => Promise<SharedScope>;
}
