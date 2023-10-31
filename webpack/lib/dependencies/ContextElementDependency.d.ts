export = ContextElementDependency;
/** @typedef {import("../Dependency").ReferencedExport} ReferencedExport */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class ContextElementDependency extends ModuleDependency {
  /**
   * @param {string} request request
   * @param {string|undefined} userRequest user request
   * @param {string} typePrefix type prefix
   * @param {string} category category
   * @param {string[][]=} referencedExports referenced exports
   * @param {string=} context context
   */
  constructor(
    request: string,
    userRequest: string | undefined,
    typePrefix: string,
    category: string,
    referencedExports?: string[][] | undefined,
    context?: string | undefined,
  );
  referencedExports: string[][];
  _typePrefix: string;
  _category: string;
  _context: string;
}
declare namespace ContextElementDependency {
  export {
    ReferencedExport,
    ModuleGraph,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    RuntimeSpec,
  };
}
import ModuleDependency = require('./ModuleDependency');
type ReferencedExport = import('../Dependency').ReferencedExport;
type ModuleGraph = import('../ModuleGraph');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
