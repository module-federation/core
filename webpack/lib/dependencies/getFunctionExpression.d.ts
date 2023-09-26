declare function _exports(expr: Expression): {
  fn: TODO;
  expressions: (Expression | SpreadElement)[];
  needThis: boolean | undefined;
};
export = _exports;
export type Expression = import('estree').Expression;
export type SpreadElement = import('estree').SpreadElement;
