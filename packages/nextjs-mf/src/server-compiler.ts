import type { moduleFederationPlugin } from '@module-federation/sdk';
import {
  FederationModulesPlugin,
  dependencies,
} from '@module-federation/enhanced';
import type {
  Compilation,
  Compiler,
  WebpackPluginInstance,
} from '@rspack/core';
import {
  PersistManifestAssetsPlugin,
  PublishServerAssetsPlugin,
} from './server-asset-publisher';

type EntryStaticNormalized = Record<string, unknown>;

type ModifyEntryOptions = {
  compiler: Compiler;
  staticEntry?: EntryStaticNormalized;
  prependEntry?: (entry: EntryStaticNormalized) => void;
};

type InvertedContainerRuntimeModuleOptions = {
  containers: Set<unknown>;
};

const createInvertedContainerRuntimeModule = (
  webpackRef: typeof import('@rspack/core'),
) => {
  const { RuntimeGlobals, RuntimeModule, Template } = webpackRef;

  return class InvertedContainerRuntimeModule extends RuntimeModule {
    readonly options: InvertedContainerRuntimeModuleOptions;

    constructor(options: InvertedContainerRuntimeModuleOptions) {
      super(
        'nextjs-mf inverted container startup',
        RuntimeModule.STAGE_TRIGGER,
      );
      this.options = options;
    }

    override generate(): string {
      const { chunk, chunkGraph, compilation } = this;
      if (!chunk || !chunkGraph || !compilation) {
        return '';
      }

      let containerEntryModule: { _name?: string } | undefined;
      for (const containerDependency of this.options.containers) {
        const module = compilation.moduleGraph.getModule(
          containerDependency as never,
        );
        if (
          module &&
          (
            chunkGraph as unknown as {
              isModuleInChunk: (m: unknown, c: unknown) => boolean;
            }
          ).isModuleInChunk(module, chunk)
        ) {
          containerEntryModule =
            module as unknown as typeof containerEntryModule;
        }
      }

      if (!containerEntryModule) {
        return '';
      }

      if (
        (
          compilation.chunkGraph as unknown as {
            isEntryModuleInChunk: (m: unknown, c: unknown) => boolean;
          }
        ).isEntryModuleInChunk(containerEntryModule as never, chunk)
      ) {
        return '';
      }

      const initRuntimeModuleGetter = (
        compilation as unknown as {
          runtimeTemplate: { moduleRaw: (opts: unknown) => string };
        }
      ).runtimeTemplate.moduleRaw({
        module: containerEntryModule as never,
        chunkGraph,
        weak: false,
        runtimeRequirements: new Set(),
      });
      const globalName = JSON.stringify(
        containerEntryModule._name || compilation.outputOptions.uniqueName,
      );

      return Template.asString([
        `var prevStartup = ${RuntimeGlobals.startup};`,
        'var hasRun = false;',
        `${RuntimeGlobals.startup} = ${(
          compilation as unknown as {
            runtimeTemplate: {
              basicFunction: (a: string, b: string) => string;
            };
          }
        ).runtimeTemplate.basicFunction(
          '',
          Template.asString([
            'if (!hasRun) {',
            Template.indent(
              Template.asString([
                'hasRun = true;',
                'if (typeof prevStartup === "function") {',
                Template.indent('prevStartup();'),
                '}',
                `var cachedRemote = ${initRuntimeModuleGetter};`,
                `var gs = ${RuntimeGlobals.global} || globalThis;`,
                `gs[${globalName}] = cachedRemote;`,
              ]),
            ),
            '} else if (typeof prevStartup === "function") {',
            Template.indent('prevStartup();'),
            '}',
          ]),
        )};`,
      ]);
    }
  };
};

class InvertedContainerPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler): void {
    const InvertedContainerRuntimeModule = createInvertedContainerRuntimeModule(
      compiler.webpack as never,
    );

    compiler.hooks.thisCompilation.tap(
      'NextjsMfInvertedContainerPlugin',
      (compilation: Compilation) => {
        const hooks = FederationModulesPlugin.getCompilationHooks(
          compilation as never,
        );
        const containers = new Set<unknown>();

        hooks.addContainerEntryDependency.tap(
          'NextjsMfInvertedContainerPlugin',
          (dependency) => {
            if (dependency instanceof dependencies.ContainerEntryDependency) {
              containers.add(dependency);
            }
          },
        );

        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'NextjsMfInvertedContainerPlugin',
          (chunk) => {
            compilation.addRuntimeModule(
              chunk,
              new InvertedContainerRuntimeModule({ containers }),
            );
          },
        );
      },
    );
  }
}

class UniverseEntryChunkTrackerPlugin implements WebpackPluginInstance {
  apply(compiler: Compiler): void {
    const code = `
if (typeof module !== 'undefined') {
  globalThis.entryChunkCache = globalThis.entryChunkCache || new Set();
  module.filename && globalThis.entryChunkCache.add(module.filename);
  if (module.children) {
    module.children.forEach(function(child) {
      child.filename && globalThis.entryChunkCache.add(child.filename);
    });
  }
}
`;
    const dataUrl = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;

    compiler.hooks.afterPlugins.tap(
      'NextjsMfUniverseEntryChunkTrackerPlugin',
      () => {
        new compiler.webpack.EntryPlugin(compiler.context, dataUrl, {}).apply(
          compiler,
        );
      },
    );
  }
}

export const modifyEntry = ({
  compiler,
  prependEntry,
  staticEntry,
}: ModifyEntryOptions): void => {
  const mergeEntries = (
    entry: EntryStaticNormalized,
    nextEntry: EntryStaticNormalized,
  ): EntryStaticNormalized => Object.assign(entry, nextEntry);

  if (typeof compiler.options.entry === 'function') {
    const previousEntry = compiler.options.entry;
    compiler.options.entry = (async () => {
      let resolvedEntry = await previousEntry();
      if (staticEntry) {
        resolvedEntry = mergeEntries(
          resolvedEntry,
          staticEntry,
        ) as typeof resolvedEntry;
      }
      prependEntry?.(resolvedEntry);
      return resolvedEntry;
    }) as typeof compiler.options.entry;
    return;
  }

  if (staticEntry) {
    compiler.options.entry = mergeEntries(
      compiler.options.entry as EntryStaticNormalized,
      staticEntry,
    ) as typeof compiler.options.entry;
  }

  if (compiler.options.entry) {
    prependEntry?.(compiler.options.entry as EntryStaticNormalized);
  }
};

export const applyServerCompilerEnhancements = (
  compiler: Compiler,
  options: moduleFederationPlugin.ModuleFederationPluginOptions,
): void => {
  const chunkFilename = compiler.options.output?.chunkFilename;
  const uniqueName = compiler.options.output?.uniqueName || options.name;

  if (
    typeof chunkFilename === 'string' &&
    uniqueName &&
    !chunkFilename.includes(uniqueName)
  ) {
    compiler.options.output.chunkFilename = chunkFilename.replace(
      '.js',
      '-[contenthash].js',
    );
  }

  new UniverseEntryChunkTrackerPlugin().apply(compiler);
  new InvertedContainerPlugin().apply(compiler);
  new PersistManifestAssetsPlugin(options.manifest).apply(compiler);
  new PublishServerAssetsPlugin().apply(compiler);
};
