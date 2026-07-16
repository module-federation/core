import { cssChunksToMap } from '@lynx-js/css-serializer';
import type { Chunk, Compiler, WebpackPluginInstance } from '@rspack/core';

interface ExternalBundleOptions {
  bundleFileName: string;
  chunking: 'split' | 'single';
  discardedTemplateAssets: Set<string>;
  encode: (value: unknown) => Promise<{ buffer: Buffer }>;
  engineVersion?: string;
  entryAssets: string[];
  entryName: string;
  includedChunkPrefixes: string[];
  lazyBundleAssets: Set<string>;
  mainThreadChunks: string[];
  preservedAssets: string[];
}

interface LynxExternalBundlePlugin extends WebpackPluginInstance {
  options: ExternalBundleOptions;
}

export const createLynxExternalBundlePlugin = (
  options: ExternalBundleOptions,
): LynxExternalBundlePlugin => ({
  options,
  apply(compiler: Compiler) {
    type AssetSnapshot = {
      content: string;
      name: string;
    };

    let sourceAssets: AssetSnapshot[] = [];
    compiler.hooks.thisCompilation.tap(
      'LynxModuleFederationExternalBundleSources',
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'LynxModuleFederationExternalBundleSources',
            stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT,
          },
          () => {
            const includedAssets = new Set(options.entryAssets);
            const entrypoint = compilation.entrypoints.get(options.entryName);
            for (const asset of entrypoint?.getFiles() ?? []) {
              includedAssets.add(asset);
            }
            const includedChunks = new Set<Chunk>();
            const addChunkGraph = (chunk: Chunk): void => {
              includedChunks.add(chunk);
              for (const asyncChunk of chunk.getAllAsyncChunks()) {
                includedChunks.add(asyncChunk);
              }
            };
            for (const chunk of entrypoint?.chunks ?? []) {
              addChunkGraph(chunk);
            }
            for (const chunk of compilation.chunks) {
              if (
                typeof chunk.name !== 'string' ||
                !options.includedChunkPrefixes.some((prefix) =>
                  chunk.name!.startsWith(prefix),
                )
              ) {
                continue;
              }
              addChunkGraph(chunk);
            }
            for (const chunk of includedChunks) {
              for (const asset of [
                ...chunk.files,
                ...(chunk.auxiliaryFiles ?? []),
              ]) {
                includedAssets.add(asset);
              }
            }
            sourceAssets = compilation
              .getAssets()
              .filter(
                ({ name }) =>
                  includedAssets.has(name) &&
                  (name.endsWith('.js') || name.endsWith('.css')),
              )
              .map(({ name, source }) => ({
                content: source.source().toString(),
                name,
              }));
          },
        );
      },
    );

    compiler.hooks.emit.tapPromise(
      {
        name: 'LynxModuleFederationExternalBundle',
        stage: 10_000,
      },
      async (compilation) => {
        const entryAssets = new Set(options.entryAssets);
        for (const asset of compilation.entrypoints
          .get(options.entryName)
          ?.getFiles() ?? []) {
          entryAssets.add(asset);
        }
        const encodedAssets =
          options.chunking === 'single'
            ? sourceAssets
            : sourceAssets.filter(({ name }) => entryAssets.has(name));
        const customSections = encodedAssets.reduce<Record<string, unknown>>(
          (sections, asset) => {
            if (asset.name.endsWith('.js')) {
              sections[asset.name.replace(/\.js$/, '')] = {
                ...(options.mainThreadChunks.includes(asset.name)
                  ? { encoding: 'JsBytecode' }
                  : {}),
                content: asset.content,
              };
            } else if (asset.name.endsWith('.css')) {
              sections[`${asset.name.replace(/\.css$/, '')}:CSS`] = {
                encoding: 'CSS',
                content: {
                  ruleList:
                    cssChunksToMap([asset.content], [], true).cssMap[0] ?? [],
                },
              };
            }
            return sections;
          },
          {},
        );
        const encodeOptions = {
          compilerOptions: {
            enableFiberArch: true,
            useLepusNG: true,
            targetSdkVersion: options.engineVersion ?? '3.7',
            enableCSSInvalidation: true,
            enableCSSSelector: true,
          },
          sourceContent: { appType: 'DynamicComponent' },
          customSections,
        };
        const { buffer } = await options.encode(encodeOptions);
        const preservedAssets = new Set(options.preservedAssets);
        if (options.chunking === 'split') {
          for (const name of options.lazyBundleAssets) {
            preservedAssets.add(name);
          }
        }
        for (const { name } of sourceAssets) {
          if (!preservedAssets.has(name)) {
            compilation.deleteAsset(name);
          }
        }
        for (const name of options.discardedTemplateAssets) {
          if (!preservedAssets.has(name)) {
            compilation.deleteAsset(name);
          }
        }
        compilation.emitAsset(
          options.bundleFileName,
          new compiler.webpack.sources.RawSource(buffer, false),
        );
        if (
          process.env.DEBUG?.toLowerCase()
            .split(',')
            .some((value) => ['*', 'rsbuild', 'rspeedy'].includes(value))
        ) {
          compilation.emitAsset(
            'tasm.json',
            new compiler.webpack.sources.RawSource(
              JSON.stringify(encodeOptions, null, 2),
            ),
          );
        }
      },
    );
  },
});
