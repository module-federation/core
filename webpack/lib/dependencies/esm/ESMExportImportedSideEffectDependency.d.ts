export = ESMExportImportedSideEffectDependency;
/** @import { LazyRole } from "../../graph/Dependency" */
/**
 * The evaluation of an `export … from "..."` statement's module. It is a separate
 * class rather than a flag so a lazy barrel defers it with the re-export, while an
 * import declaration's evaluation stays tied to the barrel's own code.
 */
declare class ESMExportImportedSideEffectDependency extends ESMImportSideEffectDependency {
}
declare namespace ESMExportImportedSideEffectDependency {
    let Template: {
        new (): {
            apply(dependency: Dependency, source: import("webpack-sources").ReplaceSource, templateContext: import("../../template/DependencyTemplate").DependencyTemplateContext): void;
            _recordNamespaceBindings(dep: ESMImportSideEffectDependency, templateContext: import("../../template/DependencyTemplate").DependencyTemplateContext, importedModule: import("../../module/Module")): void;
            _recordImportBinding(templateContext: import("../../template/DependencyTemplate").DependencyTemplateContext, name: string, value: string): void;
        };
        getImportEmittedRuntime(module: import("../../module/Module"), referencedModule: import("../../module/Module")): import("../../util/runtime").RuntimeSpec | boolean;
    };
}
import ESMImportSideEffectDependency = require("./ESMImportSideEffectDependency");
import Dependency = require("../../graph/Dependency");
