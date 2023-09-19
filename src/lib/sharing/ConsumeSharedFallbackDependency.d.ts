export = ConsumeSharedFallbackDependency;
declare class ConsumeSharedFallbackDependency extends ModuleDependency {
    get type(): string;
    get category(): string;
}
import ModuleDependency = require("webpack/lib/dependencies/ModuleDependency");
