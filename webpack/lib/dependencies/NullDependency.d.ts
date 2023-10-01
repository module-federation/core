export = NullDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency").TRANSITIVE} TRANSITIVE */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
declare class NullDependency extends Dependency {}
declare namespace NullDependency {
  export {
    NullDependencyTemplate as Template,
    ReplaceSource,
    TRANSITIVE,
    DependencyTemplateContext,
  };
}
import Dependency = require('../Dependency');
declare class NullDependencyTemplate extends DependencyTemplate {}
type ReplaceSource = any;
type TRANSITIVE = unique symbol;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
import DependencyTemplate = require('../DependencyTemplate');
