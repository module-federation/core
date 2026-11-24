import { getFederationGlobalScope } from '../../container/runtime/utils';
import { getRuntimeGlobals, getRuntimeModule, getWebpack } from '../../webpack';

/**
 * Map of shared module name to Map of runtime id to Set of exported names
 * @example {
 *   'antd': Set(['Button', 'exportedName2']),
 * }
 */
export type ReferencedExports = Map<string, Set<string>>;

const webpack = getWebpack();
const { Template } = webpack;
const RuntimeGlobals = getRuntimeGlobals(webpack);
const RuntimeModule = getRuntimeModule(webpack);

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
