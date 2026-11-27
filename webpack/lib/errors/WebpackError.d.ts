export = WebpackError;
/** @import Chunk from "../graph/Chunk" */
/** @import { DependencyLocation } from "../graph/Dependency" */
/** @import Module from "../module/Module" */
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../serialization/ObjectMiddleware"
 */
declare class WebpackError extends Error {
    [x: number]: () => string;
    /**
     * Whether an error is a webpack error rather than any other thrown value.
     * @template T
     * @param {T} value an error
     * @returns {value is T & WebpackError} true when the value is a webpack error
     */
    static isWebpackError<T>(value: T): value is T & WebpackError;
    /**
     * Creates an instance of WebpackError.
     * @param {string=} message error message
     * @param {{ cause?: unknown }} options error options
     */
    constructor(message?: string | undefined, options?: {
        cause?: unknown;
    });
    /** @type {string=} */
    details: string | undefined;
    /** @type {(Module | null)=} */
    module: (Module | null) | undefined;
    /** @type {DependencyLocation=} */
    loc: DependencyLocation | undefined;
    /** @type {boolean=} */
    hideStack: boolean | undefined;
    /** @type {Chunk=} */
    chunk: Chunk | undefined;
    /** @type {string=} */
    file: string | undefined;
    /**
     * Serializes this instance into the provided serializer context.
     * @param {ObjectSerializerContext} context context
     */
    serialize({ write }: ObjectSerializerContext): void;
    /**
     * Restores this instance from the provided deserializer context.
     * @param {ObjectDeserializerContext} context context
     */
    deserialize({ read }: ObjectDeserializerContext): void;
    cause: EXPECTED_ANY;
}
import type Module from "../module/Module";
import type { DependencyLocation } from "../graph/Dependency";
import type Chunk from "../graph/Chunk";
import type { ObjectSerializerContext } from "../serialization/ObjectMiddleware";
import type { ObjectDeserializerContext } from "../serialization/ObjectMiddleware";
