import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';
import {
  createClearCacheRuntimePlugin,
  installClearCache,
  installNodeCacheRuntime,
} from '@module-federation/webpack-bundler-runtime/clear-cache';
import { nodeRuntimeLifecycle } from './lifecycle/runtimeLifecycle';
import {
  attachRuntimeChunkState,
  deleteChunk,
  installChunk,
  setupChunkHandler,
  setupScriptLoader,
  setupWebpackRequirePatching,
} from './runtime/chunkHandler';
import {
  fetchAndRun,
  importNodeModule,
  loadChunk,
  loadFromFs,
  nodeRuntimeImportCache,
} from './runtime/loader';
import {
  resolveFile,
  resolveUrl,
  returnFromCache,
  returnFromGlobalInstances,
} from './runtime/resolve';
import type { WebpackRequire } from './runtime/types';

declare const __webpack_require__: WebpackRequire;

export {
  deleteChunk,
  fetchAndRun,
  importNodeModule,
  installChunk,
  loadChunk,
  loadFromFs,
  nodeRuntimeImportCache,
  resolveFile,
  resolveUrl,
  returnFromCache,
  returnFromGlobalInstances,
  setupChunkHandler,
  setupScriptLoader,
  setupWebpackRequirePatching,
};

export default function (): ModuleFederationRuntimePlugin {
  // A server can load its own container in a second webpack runtime. The MF
  // instance (and its named plugins) is reused, so beforeInit may belong to the
  // first runtime. Install this runtime's chunk handlers when its plugin is
  // constructed as well, resolving the instance only when a chunk is requested.
  if (
    typeof __webpack_require__ !== 'undefined' &&
    __webpack_require__.federation
  ) {
    const federation = __webpack_require__.federation as any;
    installNodeCacheRuntime(
      federation.bundlerRuntimeOptions?.remotes?.webpackRequire ||
        __webpack_require__,
    );
    setupScriptLoader();
    attachRuntimeChunkState();
  }
  return {
    name: 'node-federation-plugin',
    apply(instance) {
      return {
        ...createClearCacheRuntimePlugin({ handleRemoveRemote: false }),
        ...(nodeRuntimeLifecycle().apply!(instance) || {}),
        beforeInit: this.beforeInit,
      };
    },
    beforeInit(args) {
      if (
        typeof __webpack_require__ === 'undefined' ||
        !__webpack_require__.federation
      )
        return args;
      const federation = __webpack_require__.federation as any;
      const runtime =
        federation.bundlerRuntimeOptions?.remotes?.webpackRequire ||
        __webpack_require__;
      if (federation.bundlerRuntime) {
        installNodeCacheRuntime(runtime);
        installClearCache({ webpackRequire: runtime, instance: args.origin });
      }
      setupScriptLoader();
      attachRuntimeChunkState(args);
      return args;
    },
  };
}
