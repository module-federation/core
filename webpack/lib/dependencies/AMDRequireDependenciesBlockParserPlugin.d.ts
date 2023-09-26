export = AMDRequireDependenciesBlockParserPlugin;
/** @typedef {import("../javascript/JavascriptParser")} JavascriptParser */
declare class AMDRequireDependenciesBlockParserPlugin {
  constructor(options: any);
  options: any;
  processFunctionArgument(parser: any, expression: any): boolean;
  /**
   * @param {JavascriptParser} parser the parser
   * @returns {void}
   */
  apply(parser: JavascriptParser): void;
  processArray(parser: any, expr: any, param: any): boolean;
  processItem(parser: any, expr: any, param: any): boolean;
  processContext(parser: any, expr: any, param: any): boolean;
  processArrayForRequestString(param: any): any;
  processItemForRequestString(param: any): any;
  processCallRequire(parser: any, expr: any): boolean;
  newRequireDependenciesBlock(
    loc: any,
    request: any,
  ): AMDRequireDependenciesBlock;
  newRequireDependency(
    outerRange: any,
    arrayRange: any,
    functionRange: any,
    errorCallbackRange: any,
  ): AMDRequireDependency;
  newRequireItemDependency(request: any, range: any): AMDRequireItemDependency;
  newRequireArrayDependency(
    depsArray: any,
    range: any,
  ): AMDRequireArrayDependency;
}
declare namespace AMDRequireDependenciesBlockParserPlugin {
  export { JavascriptParser };
}
type JavascriptParser = import('../javascript/JavascriptParser');
import AMDRequireDependenciesBlock = require('./AMDRequireDependenciesBlock');
import AMDRequireDependency = require('./AMDRequireDependency');
import AMDRequireItemDependency = require('./AMDRequireItemDependency');
import AMDRequireArrayDependency = require('./AMDRequireArrayDependency');
