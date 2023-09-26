export function handleDependencyBase(
  depBase: CommonJSDependencyBaseKeywords,
  module: Module,
  runtimeRequirements: Set<string>,
): [string, string];
export type Module = import('../Module');
export type CommonJSDependencyBaseKeywords =
  | 'exports'
  | 'module.exports'
  | 'this'
  | 'Object.defineProperty(exports)'
  | 'Object.defineProperty(module.exports)'
  | 'Object.defineProperty(this)';
