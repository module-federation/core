import type { Compiler, RspackPluginInstance } from '@rspack/core';
import type { moduleFederationPlugin } from '@module-federation/sdk';

const PLUGIN_NAME = 'RspackExposeEagerPlugin';
const FACTORY_ENTRY_PREFIX = '__module_federation_expose_eager_factory__';
const EMPTY_FACTORY_ENTRY = 'data:text/javascript,export%20%7B%7D%3B';

export interface RspackExposesConfig
  extends moduleFederationPlugin.ExposesConfig {
  /**
   * Include the exposed module in the container entry chunk.
   *
   * The module is still evaluated when the container factory is called.
   */
  eager?: boolean;
}

export interface RspackExposesObject {
  [key: string]:
    | RspackExposesConfig
    | moduleFederationPlugin.ExposesItem
    | moduleFederationPlugin.ExposesItems;
}

export type RspackExposes =
  | (moduleFederationPlugin.ExposesItem | RspackExposesObject)[]
  | RspackExposesObject;

export interface RspackModuleFederationPluginOptions extends Omit<
  moduleFederationPlugin.ModuleFederationPluginOptions,
  'exposes'
> {
  exposes?: RspackExposes;
}

export interface ExposeEagerPluginOptions {
  /** Name of the container entry that receives eager exposed modules. */
  name: string;
  exposes?: RspackExposes;
}

function collectEagerImports(exposes?: RspackExposes): string[] {
  const imports = new Set<string>();

  const collectFromObject = (exposesObject: RspackExposesObject) => {
    for (const expose of Object.values(exposesObject)) {
      if (
        !expose ||
        typeof expose !== 'object' ||
        Array.isArray(expose) ||
        expose.eager !== true
      ) {
        continue;
      }

      const requests = Array.isArray(expose.import)
        ? expose.import
        : [expose.import];
      for (const request of requests) {
        imports.add(request);
      }
    }
  };

  if (Array.isArray(exposes)) {
    for (const expose of exposes) {
      if (expose && typeof expose === 'object') {
        collectFromObject(expose);
      }
    }
  } else if (exposes) {
    collectFromObject(exposes);
  }

  return [...imports];
}

/**
 * Includes exposes marked as eager in the Rspack container entry chunk.
 */
export class ExposeEagerPlugin implements RspackPluginInstance {
  readonly name = PLUGIN_NAME;
  private readonly containerName: string;
  private readonly eagerImports: string[];

  constructor(options: ExposeEagerPluginOptions) {
    this.containerName = options.name;
    this.eagerImports = collectEagerImports(options.exposes);
  }

  apply(compiler: Compiler): void {
    if (this.eagerImports.length === 0) {
      return;
    }

    const entryPlugin = compiler.webpack.EntryPlugin;
    const factoryEntryName = `${FACTORY_ENTRY_PREFIX}${this.containerName}`;

    // addInclude uses EntryDependency, whose factory is normally installed by
    // application entries. Register a temporary entry so pure containers with
    // `entry: {}` are supported too. It is removed before chunk graph creation.
    new entryPlugin(compiler.context, EMPTY_FACTORY_ENTRY, {
      name: factoryEntryName,
    }).apply(compiler);

    const dependencies = this.eagerImports.map((request) =>
      entryPlugin.createDependency(request),
    );

    compiler.hooks.finishMake.tapPromise(PLUGIN_NAME, async (compilation) => {
      try {
        if (!compilation.entries.has(this.containerName)) {
          throw new Error(
            `[${PLUGIN_NAME}] Cannot find container entry "${this.containerName}". ` +
              'Apply this plugin together with a ModuleFederationPlugin that exposes modules.',
          );
        }

        await Promise.all(
          dependencies.map(
            (dependency) =>
              new Promise<void>((resolve, reject) => {
                compilation.addInclude(
                  compiler.context,
                  dependency,
                  { name: this.containerName },
                  (error) => (error ? reject(error) : resolve()),
                );
              }),
          ),
        );
      } finally {
        compilation.entries.delete(factoryEntryName);
      }
    });
  }
}
