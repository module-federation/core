export = ESMImportBareSideEffectDependency;
/**
 * An `import "..."` that declares no binding. It is a separate class rather
 * than a flag so it costs nothing per instance, and the bound form — much the
 * more common one — keeps the base class and its inline caches untouched.
 */
declare class ESMImportBareSideEffectDependency extends ESMImportSideEffectDependency {
}
declare namespace ESMImportBareSideEffectDependency {
    let Template: {
        new (): {
            apply(dependency: import("../../graph/Dependency"), source: import("webpack-sources").ReplaceSource, templateContext: import("../../template/DependencyTemplate").DependencyTemplateContext): void;
            _recordNamespaceBindings(dep: ESMImportSideEffectDependency, templateContext: import("../../template/DependencyTemplate").DependencyTemplateContext, importedModule: Module): void;
            _recordImportBinding(templateContext: import("../../template/DependencyTemplate").DependencyTemplateContext, name: string, value: string): void;
        };
        getImportEmittedRuntime(module: Module, referencedModule: Module): import("../../util/runtime").RuntimeSpec | boolean;
    };
    let KINDS: Set<keyof DependencyKinds>;
}
import ESMImportSideEffectDependency = require("./ESMImportSideEffectDependency");
import type Module from "../../module/Module";
import type { DependencyKinds } from "../../graph/Dependency";
