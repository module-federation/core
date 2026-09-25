import type { ModuleFederation } from '../core';
import type { ShareScopeMap } from '../type';

const SHARED_DISABLED_MESSAGE =
  'Shared dependency loading is disabled by experiments.optimization.disableShared.';

export class DisabledSharedHandler {
  hooks: ModuleFederation['slots']['shared']['hooks'];
  shareScopeMap: ShareScopeMap;

  constructor(host: ModuleFederation) {
    this.hooks = host.slots.shared.hooks;
    this.shareScopeMap = host.slots.shared.shareScopeMap;
  }

  registerShared() {
    return {
      newShareInfos: {},
      allShareInfos: {},
    };
  }

  loadShare(): never {
    throw new Error(SHARED_DISABLED_MESSAGE);
  }

  loadShareSync(): never {
    throw new Error(SHARED_DISABLED_MESSAGE);
  }

  initializeSharing(): [] {
    return [];
  }

  initShareScopeMap(
    scopeName: string,
    shareScope: ShareScopeMap[string],
  ): void {
    this.shareScopeMap[scopeName] = shareScope;
  }
}
