export = WebAssemblyImportDependency;
/** @typedef {import("@webassemblyjs/ast").ModuleImportDescription} ModuleImportDescription */
/** @typedef {import("../Dependency").ReferencedExport} ReferencedExport */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../WebpackError")} WebpackError */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class WebAssemblyImportDependency extends ModuleDependency {
  /**
   * @param {string} request the request
   * @param {string} name the imported name
   * @param {ModuleImportDescription} description the WASM ast node
   * @param {false | string} onlyDirectImport if only direct imports are allowed
   */
  constructor(
    request: string,
    name: string,
    description: any,
    onlyDirectImport: false | string,
  );
  /** @type {string} */
  name: string;
  /** @type {ModuleImportDescription} */
  description: any;
  /** @type {false | string} */
  onlyDirectImport: false | string;
}
declare namespace WebAssemblyImportDependency {
  export {
    ModuleImportDescription,
    ReferencedExport,
    ModuleGraph,
    WebpackError,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    RuntimeSpec,
  };
}
import ModuleDependency = require('./ModuleDependency');
type ModuleImportDescription = any;
type ReferencedExport = import('../Dependency').ReferencedExport;
type ModuleGraph = import('../ModuleGraph');
type WebpackError = import('../WebpackError');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
