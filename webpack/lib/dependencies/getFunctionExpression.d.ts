declare namespace _exports {
  export {
    ArrowFunctionExpression,
    Expression,
    FunctionExpression,
    SpreadElement,
  };
}
declare function _exports(expr: Expression | SpreadElement):
  | {
      fn: FunctionExpression | ArrowFunctionExpression;
      expressions: (Expression | SpreadElement)[];
      needThis: boolean | undefined;
    }
  | undefined;
export = _exports;
type ArrowFunctionExpression = import('estree').ArrowFunctionExpression;
type Expression = import('estree').Expression;
type FunctionExpression = import('estree').FunctionExpression;
type SpreadElement = import('estree').SpreadElement;
