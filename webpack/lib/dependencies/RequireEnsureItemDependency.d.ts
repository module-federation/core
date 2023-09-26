export = RequireEnsureItemDependency;
declare class RequireEnsureItemDependency extends ModuleDependency {}
declare namespace RequireEnsureItemDependency {
  const Template: {
    new (): {
      apply(
        dependency: import('../Dependency'),
        source: any,
        templateContext: import('../DependencyTemplate').DependencyTemplateContext,
      ): void;
    };
  };
}
import ModuleDependency = require('./ModuleDependency');
