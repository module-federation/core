export = JsonExportsDependency;
declare class JsonExportsDependency extends NullDependency {
  /**
   * @param {JsonData} data json data
   * @param {number} exportsDepth the depth of json exports to analyze
   */
  constructor(data: JsonData, exportsDepth: number);
  data: import('../json/JsonData');
  exportsDepth: number;
}
declare namespace JsonExportsDependency {
  export {
    ExportSpec,
    ExportsSpec,
    UpdateHashContext,
    ModuleGraph,
    JsonData,
    JsonValue,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    GetExportsFromDataFn,
  };
}
import NullDependency = require('./NullDependency');
type ExportSpec = import('../Dependency').ExportSpec;
type ExportsSpec = import('../Dependency').ExportsSpec;
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type ModuleGraph = import('../ModuleGraph');
type JsonData = import('../json/JsonData');
type JsonValue = import('../json/JsonData').JsonValue;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Hash = import('../util/Hash');
type GetExportsFromDataFn = (
  data: JsonValue,
  curDepth?: number | undefined,
) => ExportSpec[] | null;
