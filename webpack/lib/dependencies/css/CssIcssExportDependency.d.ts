export = CssIcssExportDependency;
declare class CssIcssExportDependency extends NullDependency {
    /**
     * One consolidated `:export` dependency for a whole CSS module.
     * @param {CssExportEntry[]} entries export entries in source order
     */
    constructor(entries: CssExportEntry[]);
    /** @type {CssExportEntry[]} */
    entries: CssExportEntry[];
    /** @type {undefined | string} */
    _hashUpdate: undefined | string;
    /** @type {undefined | Map<string, CssExportEntry[]>} lazily-built `name -> entries` index, reused across every importer's codegen */
    _entriesByName: undefined | Map<string, CssExportEntry[]>;
    /**
     * The `entries` grouped by export name, built once and reused. `entries` is
     * immutable after construction/deserialization, so this stays valid for the
     * dependency's lifetime (the composes/`@value` target of many importers).
     * @returns {Map<string, CssExportEntry[]>} entries grouped by export name
     */
    getEntriesByName(): Map<string, CssExportEntry[]>;
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
declare namespace CssIcssExportDependency {
    export { CssIcssExportDependencyTemplate as Template, EXPORT_MODE, notSimpleIdentifierMessage, EXPORT_TYPE, KINDS, ObjectDeserializerContext, ObjectSerializerContext, Value, ExportsConventionFn, ExportMode, ExportType, CssExportEntry, ResolutionCache };
}
import NullDependency = require("../core/NullDependency");
declare const CssIcssExportDependencyTemplate_base: {
    new (): {
        apply(dependency: Dependency, source: ReplaceSource, templateContext: import("../../template/DependencyTemplate").DependencyTemplateContext): void;
    };
};
declare class CssIcssExportDependencyTemplate extends CssIcssExportDependencyTemplate_base {
    /**
     * Resolves a `[localName, importName, request]` reference to its final
     * value by following `@value` imports into other modules' consolidated
     * export dependencies.
     * @param {string} localName local name
     * @param {string} importName import name
     * @param {DependencyTemplateContext} templateContext the context object
     * @param {string | undefined} request user request of the `@value` import
     * @param {Set<CssExportEntry>=} seen cycle guard
     * @param {ResolutionCache=} cache transient per-codegen index (shared with `resolveReferences` within one `apply`)
     * @param {CssExportEntry=} scopeEntry entry to scope a plain imported value under, for a reference in a localized position
     * @param {boolean=} localized whether the use scopes a name, so a value naming its own module's declaration resolves to it
     * @returns {string | undefined} found reference
     */
    static resolve(localName: string, importName: string, templateContext: DependencyTemplateContext, request: string | undefined, seen?: Set<CssExportEntry> | undefined, cache?: ResolutionCache | undefined, scopeEntry?: CssExportEntry | undefined, localized?: boolean | undefined): string | undefined;
    /**
     * Resolves all references of a `composes` entry, deduplicated.
     * @param {CssExportEntry} entry composes entry
     * @param {DependencyTemplateContext} templateContext template context
     * @param {Set<CssExportEntry>} seen cycle guard
     * @param {ResolutionCache} cache transient per-codegen index, discarded after the module's `apply` (so it isn't retained on the dependency)
     * @returns {string[]} final names
     */
    static resolveReferences(entry: CssExportEntry, templateContext: DependencyTemplateContext, seen: Set<CssExportEntry>, cache: ResolutionCache): string[];
    /**
     * Returns the interpolated identifier for an entry value.
     * @param {string} value value to identifier
     * @param {CssExportEntry} entry the entry
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {string} identifier
     */
    static getIdentifier(value: string, entry: CssExportEntry, templateContext: DependencyTemplateContext): string;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Dependency} dependency the dependency for which the template should be applied
     * @param {ReplaceSource} source the current replace source which can be modified
     * @param {DependencyTemplateContext} templateContext the context object
     * @returns {void}
     */
    apply(dependency: Dependency, source: ReplaceSource, templateContext: DependencyTemplateContext): void;
}
/** @import CssIcssImportDependency from "./CssIcssImportDependency" */
/** @import { ReplaceSource } from "webpack-sources" */
/**
 * @import {
 * 	CssGeneratorExportsConvention,
 * 	CssGeneratorLocalIdentName,
 * 	HashFunction
 * } from "../../../declarations/WebpackOptions"
 */
/** @import CssGenerator from "../../css/CssGenerator" */
/** @import CssModule from "../../css/CssModule" */
/** @import ChunkGraph from "../../graph/ChunkGraph" */
/**
 * @import Dependency, {
 * 	ExportsSpec,
 * 	ReferencedExports,
 * 	UpdateHashContext,
 * 	DependencyLocation,
 * 	DependencyKinds
 * } from "../../graph/Dependency"
 */
/**
 * @import {
 * 	CssDependencyTemplateContext as DependencyTemplateContext
 * } from "../../template/DependencyTemplate"
 */
/** @import ModuleGraph from "../../graph/ModuleGraph" */
/** @import RuntimeTemplate from "../../template/RuntimeTemplate" */
/** @import { Range } from "../../css/CssParser" */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<(number | string | Value | Range | boolean | ExportMode | ExportType | DependencyLocation | undefined)[]>} ObjectDeserializerContext */
/** @typedef {import("../../serialization/ObjectMiddleware").ObjectSerializerContext<(number | string | Value | Range | boolean | ExportMode | ExportType | DependencyLocation | undefined)[]>} ObjectSerializerContext */
/** @import Hash from "../../util/Hash" */
/** @import { RuntimeSpec } from "../../util/runtime" */
/** @import WebpackErrorType from "../../errors/WebpackError" */
/** @typedef {string | [string, string] | [string, string, string] | [string, string, string | undefined, string]} Value */
/** @typedef {(name: string) => string | string[]} ExportsConventionFn */
/** @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7} ExportMode */
/** @typedef {0 | 1 | 2 | 3} ExportType */
/** @type {Record<"NONE" | "REPLACE" | "APPEND" | "ONCE" | "SELF_REFERENCE" | "RESOLVED_NAME" | "RESOLVED_SELECTOR" | "RESOLVED_REFERENCE", ExportMode>} */
declare const EXPORT_MODE: Record<"NONE" | "REPLACE" | "APPEND" | "ONCE" | "SELF_REFERENCE" | "RESOLVED_NAME" | "RESOLVED_SELECTOR" | "RESOLVED_REFERENCE", ExportMode>;
/**
 * The warning for a `@value` standing in for a declared name (an at-rule prelude, `local()`) whose value is not one identifier.
 * @param {string} name `@value` name as written
 * @param {string} value what it resolves to
 * @returns {string} warning message
 */
declare function notSimpleIdentifierMessage(name: string, value: string): string;
/** @type {Record<"NORMAL" | "CUSTOM_VARIABLE" | "GRID_CUSTOM_IDENTIFIER" | "COMPOSES", ExportType>} */
declare const EXPORT_TYPE: Record<"NORMAL" | "CUSTOM_VARIABLE" | "GRID_CUSTOM_IDENTIFIER" | "COMPOSES", ExportType>;
declare var KINDS: Set<keyof Dependency.DependencyKinds>;
type ObjectDeserializerContext = import("../../serialization/ObjectMiddleware").ObjectDeserializerContext<(number | string | Value | Range | boolean | ExportMode | ExportType | Dependency.DependencyLocation | undefined)[]>;
type ObjectSerializerContext = import("../../serialization/ObjectMiddleware").ObjectSerializerContext<(number | string | Value | Range | boolean | ExportMode | ExportType | Dependency.DependencyLocation | undefined)[]>;
type Value = string | [string, string] | [string, string, string] | [string, string, string | undefined, string];
type ExportsConventionFn = (name: string) => string | string[];
type ExportMode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type ExportType = 0 | 1 | 2 | 3;
/**
 * One `:export { name: value }` style entry — a plain object so a module holds
 * a single `Dependency` plus a flat array instead of thousands of `Dependency`
 * instances. `_conventionNames`/`_valueConventionNames` memoize the convention
 * expansion per entry.
 */
type CssExportEntry = {
    /**
     * export name
     */
    name: string;
    /**
     * value or [localName, importName, request?]
     */
    value: Value;
    /**
     * source range to replace, when present
     */
    range?: Range | undefined;
    /**
     * whether the value needs interpolation
     */
    interpolate: boolean;
    /**
     * export mode
     */
    exportMode: ExportMode;
    /**
     * export type
     */
    exportType: ExportType;
    /**
     * per-export source start line (1-based; flat numbers instead of a nested `DependencyLocation` — entries are per-export hot allocations)
     */
    locStartLine: number;
    /**
     * per-export source start column
     */
    locStartColumn: number;
    /**
     * per-export source end line
     */
    locEndLine: number;
    /**
     * per-export source end column
     */
    locEndColumn: number;
    /**
     * memoized convention names for `name`
     */
    _conventionNames?: string[] | undefined;
    /**
     * memoized convention names for `value`
     */
    _valueConventionNames?: string[] | undefined;
};
type ResolutionCache = {
    /**
     * module -> (export name -> entries) across all its export deps
     */
    exports: Map<CssModule, Map<string, CssExportEntry[]>>;
    /**
     * import dep -> resolved target module
     */
    targets: Map<CssIcssImportDependency, CssModule | null>;
};
import type Dependency from "../../graph/Dependency";
import type { ReplaceSource } from "webpack-sources";
import type { CssDependencyTemplateContext as DependencyTemplateContext } from "../../template/DependencyTemplate";
import type { Range } from "../../css/CssParser";
import type CssModule from "../../css/CssModule";
import type CssIcssImportDependency from "./CssIcssImportDependency";
