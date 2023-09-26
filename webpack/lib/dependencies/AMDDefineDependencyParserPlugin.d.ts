export = AMDDefineDependencyParserPlugin;
declare class AMDDefineDependencyParserPlugin {
  constructor(options: any);
  options: any;
  /**
   * @param {JavascriptParser} parser the parser
   * @returns {void}
   */
  apply(parser: JavascriptParser): void;
  processArray(
    parser: any,
    expr: any,
    param: any,
    identifiers: any,
    namedModule: any,
  ): boolean;
  processItem(parser: any, expr: any, param: any, namedModule: any): boolean;
  processContext(parser: any, expr: any, param: any): boolean;
  processCallDefine(parser: any, expr: any): boolean;
  newDefineDependency(
    range: any,
    arrayRange: any,
    functionRange: any,
    objectRange: any,
    namedModule: any,
  ): AMDDefineDependency;
  newRequireArrayDependency(
    depsArray: any,
    range: any,
  ): AMDRequireArrayDependency;
  newRequireItemDependency(request: any, range: any): AMDRequireItemDependency;
}
declare namespace AMDDefineDependencyParserPlugin {
  export { CallExpression, JavascriptParser };
}
type JavascriptParser = import('../javascript/JavascriptParser');
import AMDDefineDependency = require('./AMDDefineDependency');
import AMDRequireArrayDependency = require('./AMDRequireArrayDependency');
import AMDRequireItemDependency = require('./AMDRequireItemDependency');
type CallExpression = import('estree').CallExpression;
