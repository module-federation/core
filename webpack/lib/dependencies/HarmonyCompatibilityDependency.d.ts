export = HarmonyCompatibilityDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../Module")} Module */
/** @typedef {import("../Module").BuildMeta} BuildMeta */
declare class HarmonyCompatibilityDependency extends NullDependency {}
declare namespace HarmonyCompatibilityDependency {
  export {
    HarmonyExportDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    DependencyTemplateContext,
    Module,
    BuildMeta,
  };
}
import NullDependency = require('./NullDependency');
declare const HarmonyExportDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: any,
      templateContext: import('../DependencyTemplate').DependencyTemplateContext,
    ): void;
  };
};
declare class HarmonyExportDependencyTemplate extends HarmonyExportDependencyTemplate_base {}
type ReplaceSource = any;
type Dependency = import('../Dependency');
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type Module = import('../Module');
type BuildMeta = import('../Module').BuildMeta;
