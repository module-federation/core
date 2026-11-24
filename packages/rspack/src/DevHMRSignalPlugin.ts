import type { Compiler } from '@rspack/core';

/** A document-local hint. Framework adapters decide whether any Node work exists. */
export class DevHMRSignalPlugin {
  apply(compiler: Compiler): void {
    if (compiler.options.mode !== 'development') return;
    const { RuntimeGlobals, RuntimeModule } = compiler.webpack;
    compiler.hooks.thisCompilation.tap(
      'FederationDevHMRSignal',
      (compilation) => {
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadUpdateHandlers)
          .tap('FederationDevHMRSignal', (chunk) => {
            compilation.addRuntimeModule(
              chunk,
              new (class extends RuntimeModule {
                constructor() {
                  super(
                    'federation dev HMR signal',
                    RuntimeModule.STAGE_TRIGGER,
                  );
                }
                override generate() {
                  return `if (typeof window !== "undefined") {
  var federationHMRSignalInstalled = false;
  ${RuntimeGlobals.interceptModuleExecution}.push(function(options) {
    if (federationHMRSignalInstalled || !options.module.hot) return;
    federationHMRSignalInstalled = true;
    options.module.hot.addStatusHandler(function(status) {
      if (status === "check") window.dispatchEvent(new Event("mf:hmr-check"));
    });
  });
}`;
                }
              })(),
            );
          });
      },
    );
  }
}
