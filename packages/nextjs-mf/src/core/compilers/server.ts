import { promises as fs } from 'fs';
import path from 'path';
import type {
  Configuration,
  ExternalItemFunctionData,
  WebpackPluginInstance,
} from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';

function getUniverseEntryChunkTrackerPluginCtor(): typeof import('@module-federation/node/universe-entry-chunk-tracker-plugin').default {
  const pluginModule =
    require('@module-federation/node/universe-entry-chunk-tracker-plugin') as typeof import('@module-federation/node/universe-entry-chunk-tracker-plugin');
  return pluginModule.default;
}

function getInvertedContainerPluginCtor(): typeof import('../container/InvertedContainerPlugin').default {
  return require('../container/InvertedContainerPlugin')
    .default as typeof import('../container/InvertedContainerPlugin').default;
}

type ExternalsFunction = (
  data: ExternalItemFunctionData,
  callback: (
    error?: Error | null,
    result?: string | boolean | string[] | Record<string, unknown>,
  ) => void,
) => Promise<unknown> | unknown;

function isProtectedExternalRequest(request: string): boolean {
  return (
    request.startsWith('next') ||
    request.startsWith('react/') ||
    request.startsWith('react-dom/') ||
    request === 'react' ||
    request === 'react-dom' ||
    request === 'styled-jsx/style'
  );
}

async function copyDir(source: string, destination: string): Promise<void> {
  await fs.mkdir(destination, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyDir(sourcePath, destinationPath);
      continue;
    }

    await fs.copyFile(sourcePath, destinationPath);
  }
}

class ServerRemoteEntryCopyPlugin implements WebpackPluginInstance {
  apply(compiler: import('webpack').Compiler): void {
    compiler.hooks.afterEmit.tapPromise(
      'ServerRemoteEntryCopyPlugin',
      async () => {
        const outputPath = compiler.outputPath;
        const serverSplitToken = `${path.sep}server`;

        if (!outputPath.includes(serverSplitToken)) {
          return;
        }

        const serverIndex = outputPath.lastIndexOf(serverSplitToken);
        if (serverIndex < 0) {
          return;
        }

        const outputRoot = outputPath.slice(0, serverIndex);
        const destination = path.join(outputRoot, 'static', 'ssr');

        try {
          await copyDir(outputPath, destination);
        } catch {
          // ignore copy failures for unsupported output layouts
        }
      },
    );
  }
}

export function configureServerCompiler(
  config: Configuration,
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
): void {
  const output = config.output || (config.output = {});

  output.uniqueName = options.name;
  output.environment = {
    ...output.environment,
    asyncFunction: true,
  };

  config.node = {
    ...config.node,
    global: false,
  };

  config.target = 'async-node';

  if (typeof output.chunkFilename === 'string') {
    const chunkFilename = output.chunkFilename;
    if (!chunkFilename.includes('[contenthash]')) {
      output.chunkFilename = chunkFilename.replace('.js', '-[contenthash].js');
    }
  }

  options.library = {
    type: 'commonjs-module',
    name: options.name,
  };

  if (typeof options.filename === 'string') {
    options.filename = path.basename(options.filename);
  }

  const plugins = config.plugins || [];
  const UniverseEntryChunkTrackerPlugin =
    getUniverseEntryChunkTrackerPluginCtor();
  const InvertedContainerPlugin = getInvertedContainerPluginCtor();
  plugins.push(
    new UniverseEntryChunkTrackerPlugin(),
    new ServerRemoteEntryCopyPlugin(),
    new InvertedContainerPlugin(),
  );
  config.plugins = plugins;
  handleServerExternals(config, options);
}

export function handleServerExternals(
  config: Configuration,
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
): void {
  if (!Array.isArray(config.externals)) {
    return;
  }

  const functionExternalIndex = config.externals.findIndex(
    (external) => typeof external === 'function',
  );

  if (functionExternalIndex < 0) {
    return;
  }

  const originalExternals = config.externals[
    functionExternalIndex
  ] as ExternalsFunction;

  config.externals[functionExternalIndex] = async (
    ctx: ExternalItemFunctionData,
    callback: (error?: Error, result?: string) => void,
  ) => {
    const externalResult = await new Promise<string | undefined>(
      (resolve, reject) => {
        let callbackCalled = false;
        const wrappedCallback = (
          error?: Error | null,
          result?: string | boolean | string[] | Record<string, unknown>,
        ) => {
          callbackCalled = true;
          if (error) {
            reject(error);
            return;
          }

          if (typeof result === 'string') {
            resolve(result);
            return;
          }

          resolve(undefined);
        };

        const maybePromise = originalExternals(ctx, wrappedCallback);
        if (
          maybePromise &&
          typeof (maybePromise as Promise<unknown>).then === 'function'
        ) {
          (maybePromise as Promise<unknown>)
            .then((result) => {
              if (callbackCalled) {
                return;
              }
              resolve(typeof result === 'string' ? result : undefined);
            })
            .catch((error) => reject(error as Error));
          return;
        }

        if (!callbackCalled) {
          resolve(typeof maybePromise === 'string' ? maybePromise : undefined);
        }
      },
    );

    if (!externalResult) {
      return;
    }

    const resolvedRequest = externalResult.split(' ')[1] || '';
    const request = ctx.request || '';

    if (request.includes('@module-federation/')) {
      return;
    }

    const shared = options.shared || {};
    const sharedKey = Object.keys(shared).find((key) =>
      key.endsWith('/')
        ? resolvedRequest.startsWith(key)
        : resolvedRequest === key,
    );

    if (sharedKey) {
      const sharedConfig = (
        shared as Record<
          string,
          moduleFederationPlugin.SharedConfig | undefined
        >
      )[sharedKey];

      if (
        sharedConfig &&
        typeof sharedConfig === 'object' &&
        sharedConfig.import === false
      ) {
        return externalResult;
      }

      return;
    }

    if (isProtectedExternalRequest(resolvedRequest)) {
      return externalResult;
    }

    return;
  };
}
