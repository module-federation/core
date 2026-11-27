export = InitFragment;
/** @import { Source } from "webpack-sources" */
/** @import { GenerateContext } from "../module/Generator" */
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../serialization/ObjectMiddleware"
 */
/** @typedef {string} InitFragmentKey */
/**
 * Defines the maybe mergeable init fragment type used by this module.
 * @template GenerateContext
 * @typedef {object} MaybeMergeableInitFragment
 * @property {InitFragmentKey=} key
 * @property {number} stage
 * @property {number} position
 * @property {(context: GenerateContext) => string | Source | undefined} getContent
 * @property {(context: GenerateContext) => string | Source | undefined} getEndContent
 * @property {(fragments: MaybeMergeableInitFragment<GenerateContext>) => MaybeMergeableInitFragment<GenerateContext>=} merge
 * @property {(fragments: MaybeMergeableInitFragment<GenerateContext>[]) => MaybeMergeableInitFragment<GenerateContext>[]=} mergeAll
 */
/**
 * Represents InitFragment.
 * @template GenerateContext
 * @implements {MaybeMergeableInitFragment<GenerateContext>}
 */
declare class InitFragment<GenerateContext> implements MaybeMergeableInitFragment<GenerateContext> {
    /**
     * Adds the provided source to the init fragment.
     * @template Context
     * @param {Source} source sources
     * @param {MaybeMergeableInitFragment<Context>[]} initFragments init fragments
     * @param {Context} context context
     * @returns {Source} source
     */
    static addToSource<Context>(source: Source, initFragments: MaybeMergeableInitFragment<Context>[], context: Context): Source;
    /**
     * Creates an instance of InitFragment.
     * @param {string | Source | undefined} content the source code that will be included as initialization code
     * @param {number} stage category of initialization code (contribute to order)
     * @param {number} position position in the category (contribute to order)
     * @param {InitFragmentKey=} key unique key to avoid emitting the same initialization code twice
     * @param {string | Source=} endContent the source code that will be included at the end of the module
     */
    constructor(content: string | Source | undefined, stage: number, position: number, key?: InitFragmentKey | undefined, endContent?: (string | Source) | undefined);
    /** @type {string | Source | undefined} */
    content: string | Source | undefined;
    /** @type {number} */
    stage: number;
    /** @type {number} */
    position: number;
    /** @type {string | undefined} */
    key: string | undefined;
    /** @type {string | Source | undefined} */
    endContent: string | Source | undefined;
    /**
     * Returns the source code that will be included as initialization code.
     * @param {GenerateContext} context context
     * @returns {string | Source | undefined} the source code that will be included as initialization code
     */
    getContent(context: GenerateContext): string | Source | undefined;
    /**
     * Returns the source code that will be included at the end of the module.
     * @param {GenerateContext} context context
     * @returns {string | Source | undefined} the source code that will be included at the end of the module
     */
    getEndContent(context: GenerateContext): string | Source | undefined;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize(context: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize(context: ObjectDeserializerContext): void;
}
declare namespace InitFragment {
    export { STAGE_CONSTANTS, STAGE_ASYNC_BOUNDARY, STAGE_ESM_EXPORTS, STAGE_ESM_IMPORTS, STAGE_PROVIDES, STAGE_ASYNC_DEPENDENCIES, STAGE_ASYNC_ESM_IMPORTS, STAGE_ESM_EXPORTS as STAGE_HARMONY_EXPORTS, STAGE_ESM_IMPORTS as STAGE_HARMONY_IMPORTS, STAGE_ASYNC_ESM_IMPORTS as STAGE_ASYNC_HARMONY_IMPORTS, InitFragmentKey, MaybeMergeableInitFragment };
}
import type { Source } from "webpack-sources";
import type { ObjectSerializerContext } from "../serialization/ObjectMiddleware";
import type { ObjectDeserializerContext } from "../serialization/ObjectMiddleware";
declare var STAGE_CONSTANTS: number;
declare var STAGE_ASYNC_BOUNDARY: number;
declare var STAGE_ESM_EXPORTS: number;
declare var STAGE_ESM_IMPORTS: number;
declare var STAGE_PROVIDES: number;
declare var STAGE_ASYNC_DEPENDENCIES: number;
declare var STAGE_ASYNC_ESM_IMPORTS: number;
type InitFragmentKey = string;
/**
 * Defines the maybe mergeable init fragment type used by this module.
 */
type MaybeMergeableInitFragment<GenerateContext> = {
    key?: InitFragmentKey | undefined;
    stage: number;
    position: number;
    getContent: (context: GenerateContext) => string | Source | undefined;
    getEndContent: (context: GenerateContext) => string | Source | undefined;
    merge?: ((fragments: MaybeMergeableInitFragment<GenerateContext>) => MaybeMergeableInitFragment<GenerateContext>) | undefined;
    mergeAll?: ((fragments: MaybeMergeableInitFragment<GenerateContext>[]) => MaybeMergeableInitFragment<GenerateContext>[]) | undefined;
};
