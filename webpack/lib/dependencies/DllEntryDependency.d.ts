export = DllEntryDependency;
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("./EntryDependency")} EntryDependency */
declare class DllEntryDependency extends Dependency {
  /**
   * @param {EntryDependency[]} dependencies dependencies
   * @param {string} name name
   */
  constructor(dependencies: EntryDependency[], name: string);
  dependencies: import('./EntryDependency')[];
  name: string;
}
declare namespace DllEntryDependency {
  export {
    ObjectDeserializerContext,
    ObjectSerializerContext,
    EntryDependency,
  };
}
import Dependency = require('../Dependency');
type EntryDependency = import('./EntryDependency');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
