export = URLDependency;
declare class URLDependency extends ModuleDependency {
    /**
     * @param {string} request request
     * @param {Range} range range of the arguments of new URL( |> ... <| )
     * @param {Range} outerRange range of the full |> new URL(...) <|
     * @param {boolean=} relative use relative urls instead of absolute with base uri
     */
    constructor(request: string, range: Range, outerRange: Range, relative?: boolean | undefined);
    outerRange: import("../javascript/JavascriptParser").Range;
    relative: boolean;
    /** @type {UsedByExports | undefined} */
    usedByExports: UsedByExports | undefined;
}
declare namespace URLDependency {
    export { URLDependencyTemplate as Template, ReplaceSource, Dependency, GetConditionFn, DependencyTemplateContext, Module, ModuleGraph, Range, UsedByExports, ObjectDeserializerContext, ObjectSerializerContext };
}
import ModuleDependency = require("./ModuleDependency");
declare const URLDependencyTemplate_base: typeof import("../DependencyTemplate");
declare class URLDependencyTemplate extends URLDependencyTemplate_base {
}
type ReplaceSource = import("webpack-sources").ReplaceSource;
type Dependency = import("../Dependency");
type GetConditionFn = import("../Dependency").GetConditionFn;
type DependencyTemplateContext = import("../DependencyTemplate").DependencyTemplateContext;
type Module = import("../Module");
type ModuleGraph = import("../ModuleGraph");
type Range = import("../javascript/JavascriptParser").Range;
type UsedByExports = import("../optimize/InnerGraph").UsedByExports;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
