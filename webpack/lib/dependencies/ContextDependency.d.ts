export = ContextDependency;
declare class ContextDependency extends Dependency {
  /**
   * @param {ContextDependencyOptions} options options for the context module
   * @param {string=} context request context
   */
  constructor(options: ContextDependencyOptions, context?: string | undefined);
  options: ContextDependencyOptions;
  userRequest: string;
  /** @type {false | undefined | string} */
  critical: false | undefined | string;
  hadGlobalOrStickyRegExp: boolean;
  request: any;
  range: any;
  valueRange: any;
  /** @type {boolean | string | undefined} */
  inShorthand: boolean | string | undefined;
  replaces: any;
  _requestContext: string;
  prepend: any;
}
declare namespace ContextDependency {
  export {
    DependencyTemplate as Template,
    ContextOptions,
    TRANSITIVE,
    ModuleGraph,
    WebpackError,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    ContextDependencyOptions,
  };
}
import Dependency = require('../Dependency');
type ContextDependencyOptions = ContextOptions & {
  request: string;
};
import DependencyTemplate = require('../DependencyTemplate');
type ContextOptions = import('../ContextModule').ContextOptions;
type TRANSITIVE = import('../Dependency').TRANSITIVE;
type ModuleGraph = import('../ModuleGraph');
type WebpackError = import('../WebpackError');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
