export = RequireEnsureItemDependency;
declare class RequireEnsureItemDependency extends ModuleDependency {
    /**
     * Creates an instance of RequireEnsureItemDependency.
     * @param {string} request the request string
     */
    constructor(request: string);
}
declare namespace RequireEnsureItemDependency {
    let Template: {
        new (): {
            apply(dependency: import("../../graph/Dependency"), source: import("webpack-sources").ReplaceSource, templateContext: import("../../template/DependencyTemplate").DependencyTemplateContext): void;
        };
    };
}
import ModuleDependency = require("../core/ModuleDependency");
