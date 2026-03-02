import type { MFContext } from '@module-federation/error-codes';
import type { Options, Remote } from '../type';

function remoteToEntry(
  r: Remote,
): import('@module-federation/error-codes').MFRemoteEntry {
  return {
    name: r.name,
    alias: r.alias,
    entry: 'entry' in r ? (r as { entry: string }).entry : undefined,
    version: 'version' in r ? (r as { version: string }).version : undefined,
    type: r.type,
    entryGlobalName: r.entryGlobalName,
    shareScope: r.shareScope,
  };
}

/**
 * Build a partial MFContext from runtime Options.
 * Used to enrich diagnostic entries with host context at error sites.
 */
export function optionsToMFContext(options: Options): Partial<MFContext> {
  const shared: MFContext['mfConfig'] extends undefined
    ? never
    : NonNullable<MFContext['mfConfig']>['shared'] = {};

  for (const [pkgName, versions] of Object.entries(options.shared)) {
    const first = versions[0];
    if (first) {
      shared[pkgName] = {
        version: first.version,
        singleton: first.shareConfig?.singleton,
        requiredVersion:
          first.shareConfig?.requiredVersion === false
            ? false
            : first.shareConfig?.requiredVersion,
        eager: first.eager,
        strictVersion: first.shareConfig?.strictVersion,
      };
    }
  }

  return {
    project: {
      name: options.name,
      mfRole: options.remotes?.length > 0 ? 'host' : 'unknown',
    },
    mfConfig: {
      name: options.name,
      remotes: options.remotes?.map(remoteToEntry) ?? [],
      shared,
    },
  };
}
