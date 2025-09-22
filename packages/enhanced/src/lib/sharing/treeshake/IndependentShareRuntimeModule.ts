import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

import { getFederationGlobalScope } from '../../container/runtime/utils';

/**
 * Map of shared module name to Map of runtime id to Set of exported names
 * @example {
 *   'antd': {
 *     'main': Set(['Button', 'exportedName2']),
 *   },
 * }
 */
export type ReferencedExports = Map<string, Map<string, Set<string>>>;

const { Template, RuntimeGlobals, RuntimeModule } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class IndependentShareRuntimeModule extends RuntimeModule {
  private fallbackSharedAssets: Record<string, [string, string]>;

  constructor(fallbackSharedAssets: Record<string, [string, string]>) {
    super('shared-fallback', RuntimeModule.STAGE_ATTACH);
    this.fallbackSharedAssets = fallbackSharedAssets;
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate(): string | null {
    if (
      !this.fallbackSharedAssets ||
      !Object.keys(this.fallbackSharedAssets).length
    ) {
      return null;
    }
    const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

    return Template.asString([
      `if(!${federationGlobal}) {return;}`,
      `${federationGlobal}.fallbackSharedAssets = ${JSON.stringify(this.fallbackSharedAssets)};`,
    ]);
  }
}

export default IndependentShareRuntimeModule;
