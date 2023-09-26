export = ModuleDependency;
declare class ModuleDependency extends Dependency {
    /**
     * @param {string} request request path which needs resolving
     */
    constructor(request: string);
    request: string;
    userRequest: string;
    range: any;
    /** @type {Record<string, any> | undefined} */
    assertions: Record<string, any> | undefined;
    _context: any;
}
declare namespace ModuleDependency {
    export { DependencyTemplate as Template, TRANSITIVE, Module, ObjectDeserializerContext, ObjectSerializerContext };
}
import Dependency = require("../Dependency");
import DependencyTemplate = require("../DependencyTemplate");
type TRANSITIVE = import("../Dependency").TRANSITIVE;
type Module = import("../Module");
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
