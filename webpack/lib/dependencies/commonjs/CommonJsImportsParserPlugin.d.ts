export = CommonJsImportsParserPlugin;
declare class CommonJsImportsParserPlugin {
    /**
     * Creates an instance of CommonJsImportsParserPlugin.
     * @param {JavascriptParserOptions} options parser options
     */
    constructor(options: JavascriptParserOptions);
    /** @type {JavascriptParserOptions} */
    options: JavascriptParserOptions;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
declare namespace CommonJsImportsParserPlugin {
    export { createProcessResolveHandler, createRequireAsExpressionHandler, createRequireCacheDependency, createRequireCallHandler as createRequireHandler, REQUIRE_BINDING_TAG, CommonJsImportSettings, RequireBindingData };
}
import type { JavascriptParserOptions } from "../../../declarations/WebpackOptions";
import type JavascriptParser from "../../javascript/JavascriptParser";
/**
 * Creates a process resolve handler.
 * @param {JavascriptParser} parser parser
 * @param {JavascriptParserOptions} options options
 * @param {() => undefined | string} getContext context accessor
 * @returns {(expr: CallExpression, weak: boolean) => (boolean | void)} resolver
 */
declare function createProcessResolveHandler(parser: JavascriptParser, options: JavascriptParserOptions, getContext: () => undefined | string): (expr: CallExpression, weak: boolean) => (boolean | void);
/**
 * Creates a require as expression handler.
 * @param {JavascriptParser} parser parser
 * @param {JavascriptParserOptions} options options
 * @param {() => undefined | string} getContext context accessor
 * @returns {(expr: Expression) => boolean} handler
 */
declare function createRequireAsExpressionHandler(parser: JavascriptParser, options: JavascriptParserOptions, getContext: () => undefined | string): (expr: Expression) => boolean;
/**
 * Creates a require cache dependency.
 * @param {JavascriptParser} parser parser
 * @returns {(expr: Expression) => boolean} handler
 */
declare function createRequireCacheDependency(parser: JavascriptParser): (expr: Expression) => boolean;
/**
 * Creates a require call handler.
 * @param {JavascriptParser} parser parser
 * @param {JavascriptParserOptions} options options
 * @param {() => undefined | string} getContext context accessor
 * @param {WeakMap<CallExpression, RequireBindingData>=} requireBindingData per-parser `const NAME = require(LITERAL)` binding state; only the free-`require` plugin populates it
 * @returns {(callNew: boolean) => (expr: CallExpression | NewExpression) => (boolean | void)} handler factory
 */
declare function createRequireCallHandler(parser: JavascriptParser, options: JavascriptParserOptions, getContext: () => undefined | string, requireBindingData?: WeakMap<CallExpression, RequireBindingData> | undefined): (callNew: boolean) => (expr: CallExpression | NewExpression) => (boolean | void);
/** @import { CallExpression, Expression, NewExpression } from "estree" */
/**
 * @import {
 * 	JavascriptParserOptions
 * } from "../../../declarations/WebpackOptions"
 */
/** @import { RawReferencedExports } from "../../graph/Dependency" */
/**
 * @import JavascriptParser, {
 * 	Range,
 * 	Members,
 * 	CalleeMembers
 * } from "../../javascript/JavascriptParser"
 */
/** @import BasicEvaluatedExpression from "../../javascript/BasicEvaluatedExpression" */
/** @import LocalModule from "../amd/LocalModule" */
/**
 * Defines the common js import settings type used by this module.
 * @typedef {object} CommonJsImportSettings
 * @property {string=} name
 * @property {string} context
 */
/**
 * Per-`const NAME = require(LITERAL)` binding state used to forward
 * member-access references on `NAME` to the `CommonJsRequireDependency`
 * created for the `require()` call.
 * @typedef {object} RequireBindingData
 * @property {string} request request passed to `require()`
 * @property {RawReferencedExports | null} referencedExports mutable list, pushed to as `NAME.x.y` accesses are walked; null means the whole namespace is used. Separate from `dep` so a deferred require (walked after accesses on `NAME`) still collects them; becomes the dep's shared list on creation.
 * @property {InstanceType<typeof import("./CommonJsRequireDependency")> | null} dep dependency for the `require()` call, null until the `require()` is walked; kept so a later whole-namespace use can null its list directly
 */
declare const REQUIRE_BINDING_TAG: unique symbol;
/**
 * Defines the common js import settings type used by this module.
 */
type CommonJsImportSettings = {
    name?: string | undefined;
    context: string;
};
/**
 * Per-`const NAME = require(LITERAL)` binding state used to forward
 * member-access references on `NAME` to the `CommonJsRequireDependency`
 * created for the `require()` call.
 */
type RequireBindingData = {
    /**
     * request passed to `require()`
     */
    request: string;
    /**
     * mutable list, pushed to as `NAME.x.y` accesses are walked; null means the whole namespace is used. Separate from `dep` so a deferred require (walked after accesses on `NAME`) still collects them; becomes the dep's shared list on creation.
     */
    referencedExports: RawReferencedExports | null;
    /**
     * dependency for the `require()` call, null until the `require()` is walked; kept so a later whole-namespace use can null its list directly
     */
    dep: InstanceType<typeof import("./CommonJsRequireDependency")> | null;
};
import type { CallExpression } from "estree";
import type { Expression } from "estree";
import type { NewExpression } from "estree";
import type { RawReferencedExports } from "../../graph/Dependency";
