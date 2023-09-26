export function create(
  Dep: ContextDependencyConstructor,
  range: import('../javascript/JavascriptParser').Range,
  param: BasicEvaluatedExpression,
  expr: EsTreeNode,
  options: Pick<
    JavascriptParserOptions,
    | `${'expr' | 'wrapped'}Context${'Critical' | 'Recursive' | 'RegExp'}`
    | 'exprContextRequest'
  >,
  contextOptions: PartialContextDependencyOptions,
  parser: JavascriptParser,
  ...depArgs: any[]
): ContextDependency;
export type EsTreeNode = import('estree').Node;
export type JavascriptParserOptions =
  import('../../declarations/WebpackOptions').JavascriptParserOptions;
export type ModuleOptions =
  import('../../declarations/WebpackOptions').ModuleOptionsNormalized;
export type BasicEvaluatedExpression =
  import('../javascript/BasicEvaluatedExpression');
export type JavascriptParser = import('../javascript/JavascriptParser');
export type ContextDependency = import('./ContextDependency');
export type ContextDependencyOptions =
  import('./ContextDependency').ContextDependencyOptions;
export type PartialContextDependencyOptions = Partial<
  Omit<ContextDependencyOptions, 'resource'>
>;
export type Range = import('../javascript/JavascriptParser').Range;
export type ContextDependencyConstructor = new (
  options: ContextDependencyOptions,
  range: import('../javascript/JavascriptParser').Range,
  valueRange: [number, number],
  ...args: any[]
) => ContextDependency;
