import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime/types';

interface NextMfRuntimePluginOptions {
  onRemoteFailure?: 'error' | 'null-fallback';
  resolveCoreShares?: boolean;
}

type RuntimeShare = {
  shareKey?: string;
  request?: string;
  layer?: string | null;
  shareConfig?: {
    layer?: string | null;
  };
};

function createNullFallbackModule() {
  const NullComponent = () => null;

  return {
    __esModule: true,
    default: NullComponent,
  };
}

function isCoreShare(pkgName: string): boolean {
  return (
    pkgName === 'react' ||
    pkgName === 'react-dom' ||
    pkgName.startsWith('react/') ||
    pkgName.startsWith('react-dom/') ||
    pkgName.startsWith('next/')
  );
}

function getShareLayer(entry: RuntimeShare): string | null {
  return entry.shareConfig?.layer ?? entry.layer ?? null;
}

function toShareEntries(value: unknown): RuntimeShare[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(
      (entry): entry is RuntimeShare => !!entry && typeof entry === 'object',
    );
  }

  if (typeof value === 'object') {
    return [value as RuntimeShare];
  }

  return [];
}

function getHostSharedEntries(args: any): RuntimeShare[] {
  const instances = args?.GlobalFederation?.__INSTANCES__;
  if (!Array.isArray(instances) || instances.length === 0) {
    return [];
  }

  const pkgName = args?.pkgName;
  const host =
    instances.find((instance: any) => {
      const shared = instance?.options?.shared;
      if (!shared || typeof shared !== 'object') {
        return false;
      }

      if (toShareEntries(shared[pkgName]).length > 0) {
        return true;
      }

      return Object.values(shared).some((candidate) => {
        return toShareEntries(candidate).some((entry) => {
          return entry.shareKey === pkgName || entry.request === pkgName;
        });
      });
    }) || instances[0];

  const hostShared = host?.options?.shared;
  if (!hostShared || typeof hostShared !== 'object') {
    return [];
  }

  const directMatches = toShareEntries(hostShared[pkgName]);
  if (directMatches.length > 0) {
    return directMatches;
  }

  const matchedEntries: RuntimeShare[] = [];

  Object.values(hostShared).forEach((candidate) => {
    for (const entry of toShareEntries(candidate)) {
      if (entry.shareKey === pkgName || entry.request === pkgName) {
        matchedEntries.push(entry);
      }
    }
  });

  return matchedEntries;
}

function pickLayeredShareEntry(
  args: any,
  entries: RuntimeShare[],
): RuntimeShare {
  const requestedLayer =
    args?.shareInfo?.shareConfig?.layer ?? args?.shareInfo?.layer ?? null;

  if (!requestedLayer) {
    return entries.find((entry) => getShareLayer(entry) === null) || entries[0];
  }

  return (
    entries.find((entry) => getShareLayer(entry) === requestedLayer) ||
    entries.find((entry) => getShareLayer(entry) === null) ||
    entries[0]
  );
}

export default function nextMfRuntimePlugin(
  options?: NextMfRuntimePluginOptions,
): ModuleFederationRuntimePlugin {
  const shouldResolveCoreShares = options?.resolveCoreShares !== false;

  return {
    name: 'nextjs-mf-v9-runtime-plugin',
    createScript(args: any) {
      if (typeof window === 'undefined') {
        return undefined;
      }

      const script = document.createElement('script');
      script.src = args.url;
      script.async = true;

      if (args.attrs) {
        delete args.attrs['crossorigin'];
      }

      return { script, timeout: 8000 };
    },
    loadRemoteSnapshot(args: any) {
      const from = args['from'];
      const remoteSnapshot = args['remoteSnapshot'] as Record<string, unknown>;
      const manifestUrl = args['manifestUrl'];
      const options = args['options'] as { inBrowser?: boolean } | undefined;

      if (
        from !== 'manifest' ||
        !remoteSnapshot ||
        typeof manifestUrl !== 'string' ||
        !('publicPath' in remoteSnapshot)
      ) {
        return args;
      }

      const publicPath = String(remoteSnapshot['publicPath']);
      if (options?.inBrowser && publicPath.includes('/_next/')) {
        remoteSnapshot['publicPath'] = publicPath.slice(
          0,
          publicPath.lastIndexOf('/_next/') + 7,
        );
      } else {
        remoteSnapshot['publicPath'] = manifestUrl.slice(
          0,
          manifestUrl.lastIndexOf('/') + 1,
        );
      }

      return args;
    },
    resolveShare(args: any) {
      if (!shouldResolveCoreShares) {
        return args;
      }

      if (!isCoreShare(args?.pkgName || '')) {
        return args;
      }

      const hostShareEntries = getHostSharedEntries(args);
      if (hostShareEntries.length === 0) {
        return args;
      }

      const requestedLayer =
        args?.shareInfo?.shareConfig?.layer ?? args?.shareInfo?.layer ?? null;
      const hasLayeredEntries = hostShareEntries.some((entry) => {
        return getShareLayer(entry) !== null;
      });

      // App Router shares can be layer-specific. If we cannot infer a concrete
      // layer for the current request, defer to runtime-core's default resolver.
      if (hasLayeredEntries && !requestedLayer) {
        return args;
      }

      const selectedShare = pickLayeredShareEntry(args, hostShareEntries);
      args.resolver = function () {
        const scope = args?.scope;
        const pkgName = args?.pkgName;
        const version = args?.version;

        if (
          scope &&
          pkgName &&
          version &&
          args?.shareScopeMap?.[scope]?.[pkgName]
        ) {
          args.shareScopeMap[scope][pkgName][version] = selectedShare;
        }

        return {
          shared: selectedShare,
          useTreesShaking: false,
        };
      };

      return args;
    },
    errorLoadRemote(args: any) {
      if (options?.onRemoteFailure !== 'null-fallback') {
        return args;
      }

      if (args?.lifecycle === 'onLoad') {
        return () => createNullFallbackModule();
      }

      return args;
    },
  };
}
