import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { getFederationGlobalScope } from '../../container/runtime/utils';
import { ShareFallback } from './IndependentSharedPlugin';

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

class IndependentSharedRuntimeModule extends RuntimeModule {
  buildAssets: ShareFallback = {};
  libraryType = 'global';

  constructor(buildAssets: ShareFallback, libraryType: string) {
    super('shared-fallback', RuntimeModule.STAGE_ATTACH);
    this.buildAssets = buildAssets;
    this.libraryType = libraryType;
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate(): string | null {
    if (!this.buildAssets || !Object.keys(this.buildAssets).length) {
      return null;
    }
    const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

    return Template.asString([
      `if (!${federationGlobal}) return;`,
      `${federationGlobal}.sharedFallback = ${JSON.stringify(this.buildAssets)};`,
      `${federationGlobal}.libraryType = ${JSON.stringify(this.libraryType)};`,
    ]);
  }
}

export default IndependentSharedRuntimeModule;
