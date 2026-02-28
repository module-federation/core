import fs from 'node:fs';
import path from 'node:path';
import type { ServerPlugin } from '@modern-js/server-runtime';
import { mfAsyncStartupLoaderStrategy } from './asyncStartupLoader';
import {
  createCorsMiddleware,
  createStaticMiddleware,
} from './staticMiddleware';

const findPackageRootFromResolvedEntry = (
  resolvedEntryPath: string,
  packageName: string,
): string | undefined => {
  let currentDir = path.dirname(resolvedEntryPath);
  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.resolve(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const { name } = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf-8'),
        ) as { name?: string };
        if (name === packageName) {
          return currentDir;
        }
      } catch {
        // Ignore malformed package.json and continue searching upwards.
      }
    }
    currentDir = path.dirname(currentDir);
  }
  return undefined;
};

const resolveServerCoreNodeEntry = (): string | undefined => {
  const candidateBasePaths: string[] = [];

  try {
    const appToolsEntry = require.resolve('@modern-js/app-tools', {
      paths: [process.cwd(), __dirname],
    });
    const appToolsRoot = findPackageRootFromResolvedEntry(
      appToolsEntry,
      '@modern-js/app-tools',
    );
    if (appToolsRoot) {
      candidateBasePaths.push(appToolsRoot);
    }
  } catch {
    // app-tools may not be installed in all environments.
  }

  candidateBasePaths.push(process.cwd(), __dirname);

  for (const basePath of candidateBasePaths) {
    try {
      return require.resolve('@modern-js/server-core/node', {
        paths: [basePath],
      });
    } catch {
      // Try next base path.
    }
  }

  return undefined;
};

const staticServePlugin = (): ServerPlugin => ({
  name: '@modern-js/module-federation/server',
  setup: (api) => {
    try {
      const serverCoreNodeEntry = resolveServerCoreNodeEntry();
      if (!serverCoreNodeEntry) {
        return;
      }
      const { registerBundleLoaderStrategy } = require(serverCoreNodeEntry);
      if (typeof registerBundleLoaderStrategy === 'function') {
        registerBundleLoaderStrategy(mfAsyncStartupLoaderStrategy);
      }
    } catch {
      // registerBundleLoaderStrategy may not exist in all @modern-js/server-core versions
    }

    api.onPrepare(() => {
      // In development, we don't need to serve the manifest file, bundler dev server will handle it
      if (process.env.NODE_ENV === 'development') {
        return;
      }

      const { middlewares } = api.getServerContext();
      const config = api.getServerConfig();

      const assetPrefix = config.output?.assetPrefix || '';
      // When SSR is enabled, we need to serve the files in `bundle/` directory externally
      // Modern.js will only serve the files in `static/` directory
      if (config.server?.ssr) {
        const context = api.getServerContext();
        const pwd = context.distDirectory!;
        const serverStaticMiddleware = createStaticMiddleware({
          assetPrefix,
          pwd,
        });
        middlewares.push({
          name: 'module-federation-serve-manifest',
          handler: serverStaticMiddleware,
        });
      }

      // When the MODERN_MF_AUTO_CORS environment variable is set, the server will add CORS headers to the response
      // This environment variable should only be set when running `serve` command in local test.
      if (process.env.MODERN_MF_AUTO_CORS) {
        const corsMiddleware = createCorsMiddleware();
        middlewares.push({
          name: 'module-federation-cors',
          handler: corsMiddleware,
        });
      }
    });
  },
});

export default staticServePlugin;
export { staticServePlugin };
