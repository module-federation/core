export = ModuleDependency;
/** @typedef {import("../Dependency").TRANSITIVE} TRANSITIVE */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../javascript/JavascriptParser").ImportAttributes} ImportAttributes */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class ModuleDependency extends Dependency {
  /**
   * @param {string} request request path which needs resolving
   */
  constructor(request: string);
  request: string;
  userRequest: string;
  range: any;
  /** @type {ImportAttributes | undefined} */
  assertions: ImportAttributes | undefined;
  _context: any;
}
declare namespace ModuleDependency {
  export {
    DependencyTemplate as Template,
    TRANSITIVE,
    Module,
    ImportAttributes,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
import Dependency = require('../Dependency');
import DependencyTemplate = require('../DependencyTemplate');
type TRANSITIVE = unique symbol;
type Module = import('../Module');
type ImportAttributes =
  import('../javascript/JavascriptParser').ImportAttributes;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
