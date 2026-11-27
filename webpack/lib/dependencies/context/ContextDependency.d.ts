export = ContextDependency;
declare class ContextDependency extends Dependency {
    /**
     * Creates an instance of ContextDependency.
     * @param {ContextDependencyOptions} options options for the context module
     * @param {string=} context request context
     */
    constructor(options: ContextDependencyOptions, context?: string | undefined);
    /** @type {ContextDependencyOptions} */
    options: ContextDependencyOptions;
    /** @type {string} */
    userRequest: string;
    /** @type {false | undefined | string} */
    critical: false | undefined | string;
    /** @type {boolean} */
    hadGlobalOrStickyRegExp: boolean;
    /** @type {string | undefined} */
    request: string | undefined;
    /** @type {Range | undefined} */
    range: Range | undefined;
    /** @type {Range | undefined} */
    valueRange: Range | undefined;
    /** @type {boolean | string | undefined} */
    inShorthand: boolean | string | undefined;
    /** @type {Replaces | undefined} */
    replaces: Replaces | undefined;
    /** @type {string | undefined} */
    _requestContext: string | undefined;
}
declare namespace ContextDependency {
    export { DependencyTemplate as Template, ContextDependencyOptions, Replaces };
}
import Dependency = require("../../graph/Dependency");
import type { Range } from "../../javascript/JavascriptParser";
import DependencyTemplate = require("../../template/DependencyTemplate");
type ContextDependencyOptions = ContextOptions & {
    request: string;
};
type Replaces = {
    value: string;
    range: Range;
}[];
import type { ContextOptions } from "../../context/ContextModule";
