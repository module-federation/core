export = StaticExportsDependency;
/** @typedef {import("../Dependency").ExportsSpec} ExportsSpec */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {string[] | true} Exports */
declare class StaticExportsDependency extends NullDependency {
  /**
   * @param {Exports} exports export names
   * @param {boolean} canMangle true, if mangling exports names is allowed
   */
  constructor(exports: Exports, canMangle: boolean);
  exports: Exports;
  canMangle: boolean;
}
declare namespace StaticExportsDependency {
  export {
    ExportsSpec,
    ModuleGraph,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Exports,
  };
}
import NullDependency = require('./NullDependency');
type ExportsSpec = import('../Dependency').ExportsSpec;
type ModuleGraph = import('../ModuleGraph');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type Exports = string[] | true;
