export = LoaderDependency;
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../ModuleGraphConnection")} ModuleGraphConnection */
/** @typedef {import("../ModuleGraphConnection").ConnectionState} ConnectionState */
/** @typedef {import("../util/runtime").RuntimeSpec} RuntimeSpec */
declare class LoaderDependency extends ModuleDependency {}
declare namespace LoaderDependency {
  export { ModuleGraph, ModuleGraphConnection, ConnectionState, RuntimeSpec };
}
import ModuleDependency = require('./ModuleDependency');
type ModuleGraph = import('../ModuleGraph');
type ModuleGraphConnection = import('../ModuleGraphConnection');
type ConnectionState = import('../ModuleGraphConnection').ConnectionState;
type RuntimeSpec = import('../util/runtime').RuntimeSpec;
