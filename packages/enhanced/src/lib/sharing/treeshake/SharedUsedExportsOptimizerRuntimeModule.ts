import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

import { getFederationGlobalScope } from '../../container/runtime/utils';

/**
 * Map of shared module name to Map of runtime id to Set of exported names
 * @example {
 *   'antd': Set(['Button', 'exportedName2']),
 * }
 */
export type ReferencedExports = Map<string, Set<string>>;

const { Template, RuntimeGlobals, RuntimeModule } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class SharedUsedExportsOptimizerRuntimeModule extends RuntimeModule {
  private sharedUsedExports: ReferencedExports;

  constructor(sharedUsedExports: ReferencedExports) {
    super('shared-used-exports', RuntimeModule.STAGE_ATTACH);
    this.sharedUsedExports = sharedUsedExports;
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate(): string | null {
    if (!this.sharedUsedExports) {
      return null;
    }
    const federationGlobal = getFederationGlobalScope(RuntimeGlobals);
    return Template.asString([
      `if(!${federationGlobal}) {return;}`,
      `${federationGlobal}.usedExports = ${JSON.stringify(
        Array.from(this.sharedUsedExports.entries()).reduce(
          (acc, [pkg, moduleMap]) => {
            acc[pkg] = Array.from(moduleMap);
            return acc;
          },
          {} as Record<string, string[]>,
        ),
      )};`,
    ]);
  }
}

export default SharedUsedExportsOptimizerRuntimeModule;
