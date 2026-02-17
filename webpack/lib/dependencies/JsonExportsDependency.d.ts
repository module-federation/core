export = JsonExportsDependency;
declare class JsonExportsDependency extends NullDependency {
  /**
   * @param {JsonData} data json data
   */
  constructor(data: JsonData);
  data: import('../json/JsonData');
}
declare namespace JsonExportsDependency {
  export {
    ChunkGraph,
    ExportSpec,
    ExportsSpec,
    UpdateHashContext,
    ModuleGraph,
    JsonData,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
  };
}
import NullDependency = require('./NullDependency');
type JsonData = import('../json/JsonData');
type ChunkGraph = import('../ChunkGraph');
type ExportSpec = import('../Dependency').ExportSpec;
type ExportsSpec = import('../Dependency').ExportsSpec;
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type ModuleGraph = import('../ModuleGraph');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
