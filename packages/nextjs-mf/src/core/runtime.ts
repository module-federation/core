import type { ResolvedNextFederationOptions } from '../types';

export function buildRuntimePlugins(
  resolved: ResolvedNextFederationOptions,
  isServer: boolean,
): (string | [string, Record<string, unknown>])[] {
  const plugins: (string | [string, Record<string, unknown>])[] = [];

  if (isServer) {
    plugins.push(require.resolve('@module-federation/node/runtimePlugin'));
  }

  plugins.push([
    require.resolve('./runtimePlugin'),
    {
      onRemoteFailure: resolved.runtime.onRemoteFailure,
      resolveCoreShares: resolved.mode !== 'app',
    },
  ]);

  if (resolved.runtime.runtimePlugins.length > 0) {
    plugins.push(...resolved.runtime.runtimePlugins);
  }

  return plugins;
}
