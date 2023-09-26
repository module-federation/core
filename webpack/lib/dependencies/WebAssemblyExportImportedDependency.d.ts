export = WebAssemblyExportImportedDependency;
/** @typedef {import("../Dependency").ReferencedExport} ReferencedExport */
/** @typedef {import("../Dependency").TRANSITIVE} TRANSITIVE */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class WebAssemblyExportImportedDependency extends ModuleDependency {
  /**
   * @param {string} exportName export name
   * @param {string} request request
   * @param {string} name name
   * @param {TODO} valueType value type
   */
  constructor(
    exportName: string,
    request: string,
    name: string,
    valueType: TODO,
  );
  /** @type {string} */
  exportName: string;
  /** @type {string} */
  name: string;
  /** @type {string} */
  valueType: string;
}
declare namespace WebAssemblyExportImportedDependency {
  export {
    ReferencedExport,
    TRANSITIVE,
    ModuleGraph,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    RuntimeSpec,
  };
}
import ModuleDependency = require('./ModuleDependency');
type ReferencedExport = import('../Dependency').ReferencedExport;
type TRANSITIVE = import('../Dependency').TRANSITIVE;
type ModuleGraph = import('../ModuleGraph');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
