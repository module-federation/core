export function handleDependencyBase(
  depBase: CommonJSDependencyBaseKeywords,
  module: Module,
  runtimeRequirements: RuntimeRequirements,
): [string, string];
export type Module = import('../Module');
export type RuntimeRequirements = import('../Module').RuntimeRequirements;
export type CommonJSDependencyBaseKeywords =
  | 'exports'
  | 'module.exports'
  | 'this'
  | 'Object.defineProperty(exports)'
  | 'Object.defineProperty(module.exports)'
  | 'Object.defineProperty(this)';
