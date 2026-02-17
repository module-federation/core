export function create(
  Dep: ContextDependencyConstructor,
  range: Range,
  param: BasicEvaluatedExpression,
  expr: Expression,
  options: Pick<
    JavascriptParserOptions,
    | `${'expr' | 'wrapped'}Context${'Critical' | 'Recursive' | 'RegExp'}`
    | 'exprContextRequest'
  >,
  contextOptions: PartialContextDependencyOptions,
  parser: JavascriptParser,
  ...depArgs: EXPECTED_ANY[]
): ContextDependency;
export type Expression = import('estree').Expression;
export type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
export type DependencyLocation = import('../Dependency').DependencyLocation;
export type BasicEvaluatedExpression =
  import('../javascript/BasicEvaluatedExpression');
export type JavascriptParser = import('../javascript/JavascriptParser');
export type Range = import('../javascript/JavascriptParser').Range;
export type ContextDependency = import('./ContextDependency');
export type ContextDependencyOptions =
  import('./ContextDependency').ContextDependencyOptions;
export type Replaces = import('./ContextDependency').Replaces;
export type PartialContextDependencyOptions = Partial<
  Omit<ContextDependencyOptions, 'resource'>
>;
export type ContextDependencyConstructor = {
  new (
    options: ContextDependencyOptions,
    range: Range,
    valueRange: Range,
    ...args: EXPECTED_ANY[]
  ): ContextDependency;
};
