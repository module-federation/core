import type { Compiler } from '@rspack/core';

const LIFECYCLE_MODULE = '@module-federation/bridge-react/remote-lifecycle';
const PLUGIN_NAME = 'ModuleFederationBridgeSSRPlugin';

export interface BridgeSSRPluginOptions {
  /** The same deployment identity is compiled into both producer targets. */
  revision?: string;
}

/** Select server implementations while retaining the user's provider export. */
export class BridgeSSRPlugin {
  constructor(private readonly options: BridgeSSRPluginOptions = {}) {}

  apply(compiler: Compiler) {
    new compiler.webpack.DefinePlugin({
      'process.env.MODERN_BRIDGE_REVISION': JSON.stringify(
        this.options.revision || '',
      ),
    }).apply(compiler);
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
        if (data?.request === '@modern-js/runtime/mf') {
          data.request = '@modern-js/runtime/mf/server';
        }
        if (
          data?.request === '@module-federation/modern-js-v3/react-v18' ||
          data?.request === '@module-federation/modern-js-v3/react-v19'
        ) {
          data.request = '@module-federation/modern-js-v3/react-server';
        }
        if (
          data?.request === '@module-federation/bridge-react/v18' ||
          data?.request === '@module-federation/bridge-react/v19'
        ) {
          data.request = '@module-federation/modern-js-v3/react-server';
        }
        if (data?.request === '@module-federation/modern-js-v3/bridge/remote') {
          data.request += '.server';
        }
        if (data?.request === LIFECYCLE_MODULE) {
          // Keep normal package resolution (including import/require conditions
          // and the issuer's package copy) instead of forcing one absolute file.
          data.request = `${LIFECYCLE_MODULE}.server`;
        }
      });
    });
  }
}
