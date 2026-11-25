export = ModuleDependency;
/** @import { TRANSITIVE, DependencyKinds } from "../../graph/Dependency" */
/** @import Module from "../../module/Module" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../../serialization/ObjectMiddleware"
 */
declare class ModuleDependency extends Dependency {
    /**
     * Creates an instance of ModuleDependency.
     * @param {string} request request path which needs resolving
     * @param {number=} sourceOrder source order
     */
    constructor(request: string, sourceOrder?: number | undefined);
    /** @type {string} */
    request: string;
    /** @type {string} */
    userRequest: string;
    /** @type {number | undefined} */
    sourceOrder: number | undefined;
    /** @type {Range | undefined} */
    range: Range | undefined;
    /** @type {undefined | string} */
    _context: undefined | string;
    /** @type {boolean} */
    weak: boolean;
}
declare namespace ModuleDependency {
    export { DependencyTemplate as Template };
    export let KINDS: Set<keyof Dependency.DependencyKinds>;
}
import Dependency = require("../../graph/Dependency");
import type { Range } from "../../javascript/JavascriptParser";
import DependencyTemplate = require("../../template/DependencyTemplate");
