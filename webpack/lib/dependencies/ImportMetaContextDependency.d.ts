export = ImportMetaContextDependency;
declare class ImportMetaContextDependency extends ContextDependency {
  constructor(options: any, range: any);
}
declare namespace ImportMetaContextDependency {
  export { ModuleDependencyTemplateAsRequireId as Template };
}
import ContextDependency = require('./ContextDependency');
import ModuleDependencyTemplateAsRequireId = require('./ModuleDependencyTemplateAsRequireId');
