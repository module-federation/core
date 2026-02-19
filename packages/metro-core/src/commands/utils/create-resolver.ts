import type Server from 'metro/src/Server';

/**
 * Creates a resolver utility that mirrors Metro's bundling resolution behavior.
 * This utility exposes Metro's internal resolver to the command context,
 * allowing commands to resolve module paths exactly as Metro would during bundling.
 * The resolver maintains consistency with Metro's resolution strategy,
 * including platform-specific resolution and dependency graph traversal.
 */

/**
 * Creates a resolver that matches Metro's bundling resolution behavior
 * @param server - The Metro server instance to use for resolution
 * @param platform - The target platform for resolution (e.g., 'ios', 'android', null for default)
 * @returns The resolver object with a resolve method that takes source and target paths
 */
export async function createResolver(server: Server, platform: string | null) {
  const bundler = server.getBundler().getBundler();
  const depGraph = await bundler.getDependencyGraph();

  const resolve = ({ from, to }: { from: string; to: string }) => {
    const config = { name: to, data: { asyncType: null, key: to, locs: [] } };
    const options = { assumeFlatNodeModules: false };
    const res = depGraph.resolveDependency(from, config, platform, {}, options);
    return res.filePath;
  };

  return { resolve };
}
