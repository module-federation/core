import type { ModuleFederation } from '@module-federation/runtime';
import type {
  RemoteInfo,
  Shared,
  ShareScopeMap,
} from '@module-federation/runtime/types';
import helpers from '@module-federation/runtime/helpers';
import { composeKeyWithSeparator } from '@module-federation/sdk';

const sharedRecords = (scopes: ShareScopeMap | undefined): Shared[] =>
  Object.values(scopes || {}).flatMap((packages) =>
    Object.values(packages).flatMap((versions) => Object.values(versions)),
  );

export function getRemoteSharedOwnership(
  remoteInfo: RemoteInfo,
  provider: ModuleFederation | undefined,
) {
  const id =
    provider?.options.id ||
    composeKeyWithSeparator(remoteInfo.name, remoteInfo.buildVersion);
  const owned = new Set([
    ...sharedRecords(provider?.shareScopeMap),
    ...sharedRecords(helpers.share.getGlobalShareScope()[id]),
  ]);
  const peers = globalThis.__FEDERATION__.__INSTANCES__.filter(
    (instance) => instance !== provider && instance.name === remoteInfo.name,
  );
  const peerRecords = new Set(
    peers.flatMap((instance) => sharedRecords(instance.shareScopeMap)),
  );
  return {
    id,
    owns: (shared: Shared) =>
      shared.from === remoteInfo.name &&
      (!remoteInfo.buildVersion || owned.has(shared)),
    sharedWithPeer: (shared: Shared) => peerRecords.has(shared),
  };
}

const retiredScopesKey = Symbol.for('module-federation.retired-share-scopes');
const retiredScopes: WeakSet<ShareScopeMap> = ((globalThis as any)[
  retiredScopesKey
] ||= new WeakSet<ShareScopeMap>());

export function retireShareScope(scope: ShareScopeMap): void {
  retiredScopes.add(scope);
}

export function pruneRetiredShareScopes(): void {
  const globals = new Set([
    globalThis.__FEDERATION__,
    helpers.global.Global.__FEDERATION__,
  ]);
  const liveScopes = new Set(
    [...globals].flatMap((global) =>
      global.__INSTANCES__.map((instance) => instance.shareScopeMap),
    ),
  );
  for (const global of globals)
    for (const [id, scopes] of Object.entries(global.__SHARE__))
      if (
        retiredScopes.has(scopes) &&
        !liveScopes.has(scopes) &&
        !sharedRecords(scopes).some(
          (shared) => shared.useIn.length || (shared.loading && !shared.loaded),
        )
      )
        delete global.__SHARE__[id];
}
