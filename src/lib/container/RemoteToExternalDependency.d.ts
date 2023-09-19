export = RemoteToExternalDependency;
declare class RemoteToExternalDependency extends ModuleDependency {
    get type(): string;
    get category(): string;
}
import ModuleDependency = require("webpack/lib/dependencies/ModuleDependency");
