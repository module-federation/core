import type { Compiler, Compilation as CompilationType } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const Compilation = require(
  normalizeWebpackPath('webpack/lib/Compilation'),
) as typeof import('webpack/lib/Compilation');
import { SyncHook } from 'tapable';
import ContainerEntryDependency from '../ContainerEntryDependency';
import FederationRuntimeDependency from './FederationRuntimeDependency';

/** @type {WeakMap<import("webpack").Compilation, CompilationHooks>} */
const compilationHooksMap = new WeakMap<CompilationType, CompilationHooks>();

const PLUGIN_NAME = 'FederationModulesPlugin';

/** @typedef {{ header: string[], beforeStartup: string[], startup: string[], afterStartup: string[], allowInlineStartup: boolean }} Bootstrap */

type CompilationHooks = {
  addContainerEntryDependency: SyncHook<[ContainerEntryDependency], void>;
  addFederationRuntimeDependency: SyncHook<[FederationRuntimeDependency], void>;
  addRemoteDependency: SyncHook<[any], void>;
};

class FederationModulesPlugin {
  options: any;

  /**
   * @param {Compilation} compilation the compilation
   * @returns {CompilationHooks} the attached hooks
   */
  static getCompilationHooks(compilation: CompilationType): CompilationHooks {
    // Avoid cross-realm instanceof checks (e.g., Jest VM modules) by using
    // a duck-typed verification of a Webpack Compilation-like object.
    const isLikelyCompilation =
      compilation &&
      typeof compilation === 'object' &&
      // @ts-ignore
      typeof (compilation as any).hooks === 'object' &&
      // A couple of well-known hooks available on Webpack 5 compilations
      // @ts-ignore
      typeof (compilation as any).hooks.processAssets?.tap === 'function';

    if (!isLikelyCompilation) {
      throw new TypeError(
        "Invalid 'compilation' argument: expected a Webpack Compilation-like object",
      );
    }
    let hooks = compilationHooksMap.get(compilation);
    if (hooks === undefined) {
      hooks = {
        addContainerEntryDependency: new SyncHook(['dependency']),
        addFederationRuntimeDependency: new SyncHook(['dependency']),
        addRemoteDependency: new SyncHook(['dependency']),
      };
      compilationHooksMap.set(compilation, hooks);
    }
    return hooks;
  }

  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(
      PLUGIN_NAME,
      (compilation: CompilationType, { normalModuleFactory }) => {
        //@ts-ignore
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
      },
    );
  }
}

export default FederationModulesPlugin;
