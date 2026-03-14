import type ContainerEntryModule from '@module-federation/enhanced/src/lib/container/ContainerEntryModule';

interface InvertedContainerRuntimeModuleOptions {
  name?: string;
  containers: Set<any>; // Adjust the type as necessary
}

const createInvertedContainerRuntimeModule = (
  webpackRef: typeof import('webpack'),
) => {
  const { RuntimeModule, Template, RuntimeGlobals } = webpackRef;

  return class InvertedContainerRuntimeModule extends RuntimeModule {
    readonly options: InvertedContainerRuntimeModuleOptions;

    constructor(options: InvertedContainerRuntimeModuleOptions) {
      super('inverted container startup', RuntimeModule.STAGE_TRIGGER);
      this.options = options;
    }

    override generate(): string {
      const { compilation, chunk, chunkGraph } = this;
      if (!compilation || !chunk || !chunkGraph) {
        return '';
      }
      if (chunk.runtime === 'webpack-api-runtime') {
        return '';
      }

      const runtimeChunk = compilation.options.optimization?.runtimeChunk;
      if (typeof runtimeChunk === 'object' && runtimeChunk !== null) {
        const logger = compilation.getLogger('InvertedContainerRuntimeModule');
        logger.info(
          'Runtime chunk is configured. Consider adding runtime: false to your ModuleFederationPlugin configuration to prevent runtime conflicts.',
        );
      }

      let containerEntryModule;
      for (const containerDep of this.options.containers) {
        const mod = compilation.moduleGraph.getModule(containerDep);
        if (!mod) continue;
        if (chunkGraph.isModuleInChunk(mod, chunk)) {
          containerEntryModule = mod as ContainerEntryModule;
        }
      }

      if (!containerEntryModule) return '';

      if (
        compilation.chunkGraph.isEntryModuleInChunk(containerEntryModule, chunk)
      ) {
        // Don't apply to the remote entry itself
        return '';
      }
      const initRuntimeModuleGetter = compilation.runtimeTemplate.moduleRaw({
        module: containerEntryModule,
        chunkGraph,
        weak: false,
        runtimeRequirements: new Set(),
      });

      //@ts-ignore
      const nameJSON = JSON.stringify(containerEntryModule._name);

      return Template.asString([
        `var prevStartup = ${RuntimeGlobals.startup};`,
        `var hasRun = false;`,
        `var cachedRemote;`,
        `${RuntimeGlobals.startup} = ${compilation.runtimeTemplate.basicFunction(
          '',
          Template.asString([
            `if (!hasRun) {`,
            Template.indent(
              Template.asString([
                `hasRun = true;`,
                `if (typeof prevStartup === 'function') {`,
                Template.indent(Template.asString([`prevStartup();`])),
                `}`,
                `cachedRemote = ${initRuntimeModuleGetter};`,
                `var gs = ${RuntimeGlobals.global} || globalThis;`,
                `gs[${nameJSON}] = cachedRemote;`,
              ]),
            ),
            `} else if (typeof prevStartup === 'function') {`,
            Template.indent(`prevStartup();`),
            `}`,
          ]),
        )};`,
      ]);
    }
  };
};

export default createInvertedContainerRuntimeModule;
