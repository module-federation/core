import type { Compiler } from '@rspack/core';

const LIFECYCLE_MODULE = '@module-federation/bridge-react/remote-lifecycle';
const PLUGIN_NAME = 'ModuleFederationBridgeSSRPlugin';

/** Select the server lifecycle while retaining Bridge's shared component tree. */
export class BridgeSSRPlugin {
  apply(compiler: Compiler) {
    const target = compiler.options.target;
    const targets = Array.isArray(target) ? target : [target];
    if (
      !targets.some(
        (value) =>
          typeof value === 'string' && /^(?:async-)?node(?:\d.*)?$/.test(value),
      )
    ) {
      return;
    }
    compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (factory) => {
      factory.hooks.beforeResolve.tap(PLUGIN_NAME, (data) => {
        if (data?.request === LIFECYCLE_MODULE) {
          // Keep normal package resolution (including import/require conditions
          // and the issuer's package copy) instead of forcing one absolute file.
          data.request = `${LIFECYCLE_MODULE}.server`;
        }
      });
    });
  }
}
