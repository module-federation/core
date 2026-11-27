export = ImportMetaResolveDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
declare class ImportMetaResolveDependency extends URLDependency {
}
declare namespace ImportMetaResolveDependency {
    export { ImportMetaResolveDependencyTemplate as Template };
}
import URLDependency = require("./URLDependency");
declare const ImportMetaResolveDependencyTemplate_base: typeof import("../../template/DependencyTemplate");
declare class ImportMetaResolveDependencyTemplate extends ImportMetaResolveDependencyTemplate_base {
}
