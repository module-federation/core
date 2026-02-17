export = RequireEnsureItemDependency;
declare class RequireEnsureItemDependency extends ModuleDependency {
  /**
   * @param {string} request the request string
   */
  constructor(request: string);
}
declare namespace RequireEnsureItemDependency {
  let Template: {
    new (): {
      apply(
        dependency: import('../Dependency'),
        source: ReplaceSource,
        templateContext: DependencyTemplateContext,
      ): void;
    };
  };
}
import ModuleDependency = require('./ModuleDependency');
import NullDependency = require('./NullDependency');
