import { NormalizedFederationConfig } from '../config/federation-config';

export function getExternals(config: NormalizedFederationConfig): string[] {
  const shared = Object.keys(config.shared ?? {});
  const remotes = config.remotes ?? {};
  const remoteKeys = Object.keys(remotes).reduce<string[]>((acc, key) => {
    if (!key) return acc;
    acc.push(key);
    acc.push(key + '/*');
    return acc;
  }, []);
  const externals = [...shared, ...remoteKeys];
  return externals;
}
