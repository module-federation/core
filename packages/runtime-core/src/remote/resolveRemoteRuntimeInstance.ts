import { composeKeyWithSeparator } from '@module-federation/sdk';
import type { ModuleFederation } from '../core';
import type { RemoteInfo } from '../type';

// A remote is known under several distinct names while it is loaded:
// - registeredName: the alias the host registered it under (remoteInfo.name)
// - buildName: the name/global it was built with (remoteInfo.entryGlobalName)
// - buildVersion: the build version reported by its snapshot
// - instanceId: the runtime instance id (instance.options.id)
// The share producer name (instance.options.name) and the consuming host
// name (host.options.name) are separate again and never used for lookup here.
export interface RemoteRuntimeIdentity {
  registeredName: string;
  buildName?: string;
  buildVersion?: string;
  instanceId?: string;
}

export type RemoteRuntimeMatchLevel =
  | 'registeredName+buildVersion'
  | 'buildName+buildVersion'
  | 'registeredName'
  | 'buildName';

export interface ResolvedRemoteRuntimeInstance {
  instance?: ModuleFederation;
  index: number;
  identity: RemoteRuntimeIdentity;
  // more than one candidate matched at the chosen level
  ambiguous: boolean;
  level?: RemoteRuntimeMatchLevel;
  candidateCount: number;
}

type Matcher = (instance: ModuleFederation) => boolean;

function matchVersioned(name: string, version: string): Matcher {
  const id = composeKeyWithSeparator(name, version);
  return (ins) =>
    ins.options.id === id ||
    (ins.options.name === name && ins.options.version === version);
}

function matchName(name: string): Matcher {
  return (ins) => ins.name === name || ins.options.name === name;
}

// Matching is monotonic: the first level that yields candidates wins, and a
// versioned lookup never degrades into an unversioned name match.
export function resolveRemoteRuntimeInstance(
  remoteInfo: RemoteInfo,
  instances: ModuleFederation[],
): ResolvedRemoteRuntimeInstance {
  const registeredName = remoteInfo.name;
  const { buildVersion } = remoteInfo;
  const buildName =
    typeof remoteInfo.entryGlobalName === 'string' &&
    remoteInfo.entryGlobalName !== ''
      ? remoteInfo.entryGlobalName
      : undefined;
  const identity: RemoteRuntimeIdentity = {
    registeredName,
    buildName,
    buildVersion,
  };
  const hasDistinctBuildName =
    buildName !== undefined && buildName !== registeredName;

  const levels: Array<[RemoteRuntimeMatchLevel, Matcher]> = [];
  if (buildVersion) {
    levels.push([
      'registeredName+buildVersion',
      matchVersioned(registeredName, buildVersion),
    ]);
    if (hasDistinctBuildName) {
      levels.push([
        'buildName+buildVersion',
        matchVersioned(buildName, buildVersion),
      ]);
    }
  } else {
    levels.push(['registeredName', matchName(registeredName)]);
    if (hasDistinctBuildName) {
      levels.push(['buildName', matchName(buildName)]);
    }
  }

  for (const [level, matcher] of levels) {
    const indexes: number[] = [];
    instances.forEach((ins, index) => {
      if (matcher(ins)) {
        indexes.push(index);
      }
    });
    if (indexes.length === 0) {
      continue;
    }
    if (indexes.length > 1) {
      return {
        index: -1,
        identity,
        ambiguous: true,
        level,
        candidateCount: indexes.length,
      };
    }
    const index = indexes[0];
    const instance = instances[index];
    return {
      instance,
      index,
      identity: { ...identity, instanceId: instance.options.id },
      ambiguous: false,
      level,
      candidateCount: 1,
    };
  }

  return { index: -1, identity, ambiguous: false, candidateCount: 0 };
}
