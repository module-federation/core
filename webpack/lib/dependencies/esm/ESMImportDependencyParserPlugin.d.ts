export = ESMImportDependencyParserPlugin;
declare class ESMImportDependencyParserPlugin {
    /**
     * Creates an instance of ESMImportDependencyParserPlugin.
     * @param {JavascriptParserOptions} options options
     */
    constructor(options: JavascriptParserOptions);
    /** @type {JavascriptParserOptions} */
    options: JavascriptParserOptions;
    /** @type {ExportPresenceMode} */
    exportPresenceMode: ExportPresenceMode;
    /** @type {boolean | undefined} */
    strictThisContextOnImports: boolean | undefined;
    /**
     * Gets export presence mode.
     * @param {JavascriptParser} parser the parser
     * @param {ESMSettings} settings settings
     * @param {Ids} ids ids
     * @returns {ExportPresenceMode} exportPresenceMode
     */
    getExportPresenceMode(parser: JavascriptParser, settings: ESMSettings, ids: Ids): ExportPresenceMode;
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {JavascriptParser} parser the parser
     * @returns {void}
     */
    apply(parser: JavascriptParser): void;
}
declare namespace ESMImportDependencyParserPlugin {
    export { harmonySpecifierTag, ESMSettings };
}
import type { JavascriptParserOptions } from "../../../declarations/WebpackOptions";
import type { ExportPresenceMode } from "./ESMImportDependency";
import type JavascriptParser from "../../javascript/JavascriptParser";
import type { Ids } from "./ESMImportDependency";
/**
 * @import {
 * 	Expression,
 * 	PrivateIdentifier,
 * 	Identifier,
 * 	MemberExpression,
 * 	Pattern,
 * 	UpdateExpression
 * } from "estree"
 */
/**
 * @import {
 * 	JavascriptParserOptions
 * } from "../../../declarations/WebpackOptions"
 */
/** @import Module from "../../module/Module" */
/**
 * @import JavascriptParser, {
 * 	ImportAttributes,
 * 	Range,
 * 	Members,
 * 	WriteStatement
 * } from "../../javascript/JavascriptParser"
 */
/** @import { Ids, ExportPresenceMode } from "./ESMImportDependency" */
/** @import { ImportPhaseType } from "../core/ImportPhase" */
/** @import { GuardFrame } from "./ESMImportGuard" */
declare const harmonySpecifierTag: unique symbol;
/**
 * Defines the harmony settings type used by this module.
 */
type ESMSettings = {
    ids: Ids;
    source: string;
    sourceOrder: number;
    name: string;
    await: boolean;
    attributes?: JavascriptParser.ImportAttributes | undefined;
    phase: ImportPhaseType;
    /**
     * whether the binding is referenced anywhere
     */
    used: boolean;
    /**
     * the statement's own dependency
     */
    dependency: ESMImportSideEffectDependency | undefined;
};
import type { ImportPhaseType } from "../core/ImportPhase";
import ESMImportSideEffectDependency = require("./ESMImportSideEffectDependency");
