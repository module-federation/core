export type InlinedValueKind = "null" | "undefined" | "boolean" | "number" | "string";
export class InlinedUsedName {
    /**
     * @param {InlinedValue} value inlined value
     * @param {string[]=} suffix nested property access after the literal
     */
    constructor(value: InlinedValue, suffix?: string[] | undefined);
    /** @type {InlinedValue} */
    value: InlinedValue;
    /** @type {string[]} */
    suffix: string[];
    /**
     * @param {string=} comment leading comment text
     * @returns {string} rendered literal with property access suffix
     */
    render(comment?: string | undefined): string;
    /**
     * Updates the hash with the data contributed by this instance.
     * @param {Hash} hash the hash used to track dependencies
     * @returns {void}
     */
    updateHash(hash: Hash): void;
}
/** @typedef {"null" | "undefined" | "boolean" | "number" | "string"} InlinedValueKind */
export class InlinedValue {
    /**
     * @param {InlinedValueKind} kind value kind
     * @param {null | undefined | boolean | number | string} value raw value
     */
    constructor(kind: InlinedValueKind, value: null | undefined | boolean | number | string);
    /** @type {InlinedValueKind} */
    kind: InlinedValueKind;
    /** @type {string | number | boolean | null | undefined} */
    value: string | number | boolean | null | undefined;
    /**
     * @returns {string} rendered literal source
     */
    renderLiteral(): string;
    /**
     * @param {string} comment leading comment text
     * @returns {string} parenthesized literal with comment
     */
    render(comment: string): string;
    /**
     * @param {InlinedValue} other other inlined value
     * @returns {boolean} true when kind and value match
     */
    equals(other: InlinedValue): boolean;
    /**
     * @param {ObjectSerializerContext} context context
     */
    serialize({ write }: ObjectSerializerContext): void;
    /**
     * @param {ObjectDeserializerContext} context context
     */
    deserialize({ read }: ObjectDeserializerContext): void;
}
/**
 * @import {
 * 	ObjectDeserializerContext,
 * 	ObjectSerializerContext
 * } from "../serialization/ObjectMiddleware"
 */
/** @import ModuleGraph from "../graph/ModuleGraph" */
/** @import Module from "../module/Module" */
/** @import { RuntimeSpec } from "../util/runtime" */
/** @import Hash from "../util/Hash" */
export const MAX_INLINE_BYTES: 6;
/**
 * Marks export inlining as active for this module graph (set by InlineExportsPlugin).
 * @param {ModuleGraph} moduleGraph module graph
 * @returns {void}
 */
export function enableInlineExports(moduleGraph: ModuleGraph): void;
/**
 * Check whether an import to `module` for `ids` resolves to an inlined value.
 * @param {ModuleGraph} moduleGraph module graph
 * @param {Module} module the target module
 * @param {string[]} ids import ids
 * @param {RuntimeSpec} runtime runtime
 * @returns {boolean} true if the export is inlined
 */
export function isExportInlined(moduleGraph: ModuleGraph, module: Module, ids: string[], runtime: RuntimeSpec): boolean;
/**
 * @param {Module} module the target module
 * @returns {boolean} true when inlining is enabled for this module
 */
export function isInlineEnabled(module: Module): boolean;
/**
 * Whether a used name is an inlined value rather than a property name.
 * @template V
 * @param {V} value a used name
 * @returns {value is Extract<V, InlinedUsedName>} true when the value is inlined
 */
export function isInlinedUsedName<V>(value: V): value is Extract<V, InlinedUsedName>;
/**
 * @param {ModuleGraph} moduleGraph module graph
 * @returns {boolean} true when InlineExportsPlugin is active for this module graph
 */
export function isInlineExportsEnabled(moduleGraph: ModuleGraph): boolean;
/**
 * Convert an evaluated expression into an inlined primitive value if it qualifies.
 * @param {import("../javascript/BasicEvaluatedExpression")} evaluated evaluated expression
 * @returns {InlinedValue | undefined} inlined value or undefined
 */
export function toInlinedValue(evaluated: import("../javascript/BasicEvaluatedExpression")): InlinedValue | undefined;
import type Hash from "../util/Hash";
import type { ObjectSerializerContext } from "../serialization/ObjectMiddleware";
import type { ObjectDeserializerContext } from "../serialization/ObjectMiddleware";
import type ModuleGraph from "../graph/ModuleGraph";
import type Module from "../module/Module";
import type { RuntimeSpec } from "../util/runtime";
