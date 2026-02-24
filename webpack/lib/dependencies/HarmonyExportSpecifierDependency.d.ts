export = HarmonyExportSpecifierDependency;
/** @typedef {import("webpack-sources").ReplaceSource} ReplaceSource */
/** @typedef {import("../Dependency")} Dependency */
/** @typedef {import("../Dependency").ExportsSpec} ExportsSpec */
/** @typedef {import("../DependencyTemplate").DependencyTemplateContext} DependencyTemplateContext */
/** @typedef {import("../ModuleGraph")} ModuleGraph */
/** @typedef {import("../ModuleGraphConnection").ConnectionState} ConnectionState */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
declare class HarmonyExportSpecifierDependency extends NullDependency {
  /**
   * @param {string} id the id
   * @param {string} name the name
   */
  constructor(id: string, name: string);
  id: string;
  name: string;
}
declare namespace HarmonyExportSpecifierDependency {
  export {
    HarmonyExportSpecifierDependencyTemplate as Template,
    ReplaceSource,
    Dependency,
    ExportsSpec,
    DependencyTemplateContext,
    ModuleGraph,
    ConnectionState,
    ObjectDeserializerContext,
    ObjectSerializerContext,
  };
}
import NullDependency = require('./NullDependency');
declare const HarmonyExportSpecifierDependencyTemplate_base: {
  new (): {
    apply(
      dependency: import('../Dependency'),
      source: NullDependency.ReplaceSource,
      templateContext: NullDependency.DependencyTemplateContext,
    ): void;
  };
};
declare class HarmonyExportSpecifierDependencyTemplate extends HarmonyExportSpecifierDependencyTemplate_base {}
type ReplaceSource = import('webpack-sources').ReplaceSource;
type Dependency = import('../Dependency');
type ExportsSpec = import('../Dependency').ExportsSpec;
type DependencyTemplateContext =
  import('../DependencyTemplate').DependencyTemplateContext;
type ModuleGraph = import('../ModuleGraph');
type ConnectionState = import('../ModuleGraphConnection').ConnectionState;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
