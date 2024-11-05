import type {
  WebpackOptionsNormalized,
  Compiler,
  ExternalItemFunctionData,
} from 'webpack';
import type { moduleFederationPlugin } from '@module-federation/sdk';
import path from 'path';
import InvertedContainerPlugin from '../container/InvertedContainerPlugin';
import UniverseEntryChunkTrackerPlugin from '@module-federation/node/universe-entry-chunk-tracker-plugin';

type EntryStaticNormalized = Awaited<
  ReturnType<Extract<WebpackOptionsNormalized['entry'], () => any>>
>;

interface ModifyEntryOptions {
  compiler: Compiler;
  prependEntry?: (entry: EntryStaticNormalized) => void;
  staticEntry?: EntryStaticNormalized;
}

// Modifies the Webpack entry configuration
export function modifyEntry(options: ModifyEntryOptions): void {
  const { compiler, staticEntry, prependEntry } = options;
  const operator = (
    oriEntry: EntryStaticNormalized,
    newEntry: EntryStaticNormalized,
  ): EntryStaticNormalized => Object.assign(oriEntry, newEntry);

  // If the entry is a function, wrap it to modify the result
  if (typeof compiler.options.entry === 'function') {
    const prevEntryFn = compiler.options.entry;
    compiler.options.entry = async () => {
      let res = await prevEntryFn();
      if (staticEntry) {
        res = operator(res, staticEntry);
      }
      if (prependEntry) {
        prependEntry(res);
      }
      return res;
    };
  } else {
    // If the entry is an object, directly modify it
    if (staticEntry) {
      compiler.options.entry = operator(compiler.options.entry, staticEntry);
    }
    if (prependEntry) {
      prependEntry(compiler.options.entry);
    }
  }
}

/**
 * Applies server-specific plugins to the webpack compiler.
 *
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @param {moduleFederationPlugin.ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 */
export function applyServerPlugins(
  compiler: Compiler,
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
): void {
  const chunkFileName = compiler.options?.output?.chunkFilename;
  const uniqueName = compiler?.options?.output?.uniqueName || options.name;
  const suffix = `-[chunkhash].js`;

  // Modify chunk filename to include a unique suffix if not already present
  if (
    typeof chunkFileName === 'string' &&
    uniqueName &&
    !chunkFileName.includes(uniqueName)
  ) {
    compiler.options.output.chunkFilename = chunkFileName.replace(
      '.js',
      suffix,
    );
  }
  new UniverseEntryChunkTrackerPlugin().apply(compiler);
  new InvertedContainerPlugin().apply(compiler);
}

/**
 * Configures server-specific library and filename options.
 *
 * @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 */
export function configureServerLibraryAndFilename(
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
): void {
  // Set the library option to "commonjs-module" format with the name from the options
  options.library = {
    type: 'commonjs-module',
    name: options.name,
  };

  // Set the filename option to the basename of the current filename
  options.filename = path.basename(options.filename as string);
}

/**
 * Patches Next.js' default externals function to ensure shared modules are bundled and not treated as external.
 *
 * @param {Compiler} compiler - The Webpack compiler instance.
 * @param {ModuleFederationPluginOptions} options - The ModuleFederationPluginOptions instance.
 */
export function handleServerExternals(
  compiler: Compiler,
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
): void {
  if (Array.isArray(compiler.options.externals)) {
    const functionIndex = compiler.options.externals.findIndex(
      (external) => typeof external === 'function',
    );

    if (functionIndex !== -1) {
      const originalExternals = compiler.options.externals[functionIndex] as (
        data: ExternalItemFunctionData,
        callback: any,
      ) => undefined | string;

      compiler.options.externals[functionIndex] = async function (
        ctx: ExternalItemFunctionData,
        callback: any,
      ) {
        const fromNext = await originalExternals(ctx, callback);
        if (!fromNext) {
          return;
        }
        const req = fromNext.split(' ')[1];
        if (
          ctx.request &&
          (ctx.request.includes('@module-federation/utilities') ||
            Object.keys(options.shared || {}).some((key) => {
              const sharedOptions = options.shared as Record<
                string,
                { import: boolean }
              >;
              return (
                sharedOptions[key]?.import !== false &&
                (key.endsWith('/') ? req.includes(key) : req === key)
              );
            }) ||
            ctx.request.includes('@module-federation/'))
        ) {
          return;
        }

        if (
          req.startsWith('next') ||
          req.startsWith('react/') ||
          req.startsWith('react-dom/') ||
          req === 'react' ||
          req === 'styled-jsx/style' ||
          req === 'react-dom'
        ) {
          return fromNext;
        }
        return;
      };
    }
  }
}

/**
 * Configures server-specific compiler options.
 *
 * @param {Compiler} compiler - The Webpack compiler instance.
 */
export function configureServerCompilerOptions(compiler: Compiler): void {
  // Disable the global option in node builds and set the target to "async-node"
  compiler.options.node = {
    ...compiler.options.node,
    global: false,
  };
  // Set the compiler target to 'async-node' for server-side rendering compatibility
  // Set the target to 'async-node' for server-side builds
  compiler.options.target = 'async-node';

  // Runtime chunk creation is currently disabled
  // Uncomment if separate runtime chunk is needed for specific use cases
  // compiler.options.optimization.runtimeChunk = {
  //   name: 'webpack-runtime',
  // };
}
