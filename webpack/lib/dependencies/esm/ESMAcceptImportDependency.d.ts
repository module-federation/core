export = ESMAcceptImportDependency;
declare class ESMAcceptImportDependency extends ESMImportDependency {
    /**
     * Creates an instance of ESMAcceptImportDependency.
     * @param {string} request the request string
     */
    constructor(request: string);
}
declare namespace ESMAcceptImportDependency {
    let Template: {
        new (): {
            apply(dependency: import("../../graph/Dependency"), source: import("webpack-sources").ReplaceSource, templateContext: import("../../template/DependencyTemplate").DependencyTemplateContext): void;
            _recordImportBinding(templateContext: import("../../template/DependencyTemplate").DependencyTemplateContext, name: string, value: string): void;
        };
        getImportEmittedRuntime(module: import("../../module/Module"), referencedModule: import("../../module/Module")): import("../../util/runtime").RuntimeSpec | boolean;
    };
}
import ESMImportDependency = require("./ESMImportDependency");
