import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

import { getFederationGlobalScope } from '../../container/runtime/utils';

export type ReferencedExports = Map<string, Map<string, Set<string>>>;

const { Template, RuntimeGlobals, RuntimeModule } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class DependencyReferencExportRuntimeModule extends RuntimeModule {
  private _dependencyReferencExport: ReferencedExports;

  constructor(dependencyReferencExport: ReferencedExports) {
    super('dependency-referenc-export', RuntimeModule.STAGE_ATTACH);
    this._dependencyReferencExport = dependencyReferencExport;
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate(): string | null {
    if (!this._dependencyReferencExport) {
      return null;
    }
    const federationGlobal = getFederationGlobalScope(RuntimeGlobals);

    // const runtime = this.chunk?.runtime;
    // const chunkGraph = this.chunkGraph;

    // if(!runtime){
    //   throw new Error('Can not find runtime id!');
    // }
    // const runtimeId = typeof runtime === 'string'?  chunkGraph?.getRuntimeId(runtime) : ''
    // if(!runtimeId){
    //   throw new Error('Can not find runtime id!');
    // }
    return Template.asString([
      `if(!${federationGlobal}) {return;}`,
      `${federationGlobal}.usedExports = ${JSON.stringify(
        Array.from(this._dependencyReferencExport.entries()).reduce(
          (acc, [pkg, moduleMap]) => {
            acc[pkg] = Array.from(moduleMap.entries()).reduce(
              (modAcc, [cRuntimeId, exports]) => {
                modAcc[cRuntimeId] = Array.from(exports);

                return modAcc;
              },
              {} as Record<string, string[]>,
            );
            return acc;
          },
          {} as Record<string, Record<string, string[]>>,
        ),
      )};`,
    ]);
  }
}

export default DependencyReferencExportRuntimeModule;
