export = CachedConstDependency;
/** @import { ReplaceSource } from "webpack-sources" */
/** @import Dependency, { UpdateHashContext } from "../../graph/Dependency" */
/** @import { DependencyTemplateContext } from "../../template/DependencyTemplate" */
/** @import { Range } from "../../javascript/JavascriptParser" */
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../../serialization/ObjectMiddleware"
 */
/** @import Hash from "../../util/Hash" */
declare class CachedConstDependency extends NullDependency {
    /**
     * Creates an instance of CachedConstDependency.
     * @param {string} expression expression
     * @param {Range | null} range range
     * @param {string} identifier identifier
     * @param {number=} place place where we inject the expression
     */
    constructor(expression: string, range: Range | null, identifier: string, place?: number | undefined);
    /** @type {string} */
    expression: string;
    range: Range;
    /** @type {string} */
    identifier: string;
    /** @type {number} */
    place: number;
    /** @type {undefined | string} */
    _hashUpdate: undefined | string;
    /**
     * Create hash update.
     * @returns {string} hash update
     */
    _createHashUpdate(): string;
}
declare namespace CachedConstDependency {
    export let PLACE_MODULE: number;
    export let PLACE_CHUNK: number;
    export { CachedConstDependencyTemplate as Template };
}
import NullDependency = require("./NullDependency");
import type { Range } from "../../javascript/JavascriptParser";
declare class CachedConstDependencyTemplate extends DependencyTemplate {
}
import DependencyTemplate = require("../../template/DependencyTemplate");
