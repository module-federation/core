export function getExternals(config) {
  const shared = Object.keys(config.shared);
  const sharedMappings = config.sharedMappings.map((m) => m.key);
  const remotes = config.remotes;
  const remoteKeys = Object.keys(remotes).reduce((acc, key) => {
    if (!key) return acc;
    acc.push(key);
    acc.push(key + '/*');
    return acc;
  }, []);
  const externals = [...shared, ...sharedMappings, ...remoteKeys];
  return externals;
}
