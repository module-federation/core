export class StaticExportsDependency extends NullDependency {
  /**
   * @param {string[] | true} exports export names
   * @param {boolean} canMangle true, if mangling exports names is allowed
   */
  constructor(exports: string[] | true, canMangle: boolean);
  exports: true | string[];
  canMangle: boolean;
}
declare namespace StaticExportsDependency {
  export {
    ChunkGraph,
    ExportSpec,
    ExportsSpec,
    UpdateHashContext,
    ModuleGraph,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
  };
}
import NullDependency = require('./NullDependency');
type ChunkGraph = import('../ChunkGraph');
type ExportSpec = import('./Dependency').ExportSpec;
type ExportsSpec = import('./Dependency').ExportsSpec;
type UpdateHashContext = import('./Dependency').UpdateHashContext;
type ModuleGraph = import('../ModuleGraph');
type Hash = import('../util/Hash');
