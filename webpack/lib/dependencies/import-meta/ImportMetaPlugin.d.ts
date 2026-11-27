export = ImportMetaPlugin;
/**
 * Defines the import meta plugin hooks type used by this module.
 * @typedef {object} ImportMetaPluginHooks
 * @property {SyncBailHook<[DestructuringAssignmentProperty], string | void>} propertyInDestructuring
 */
declare class ImportMetaPlugin {
    /**
     * Applies the plugin by registering its hooks on the compiler.
     * @param {Compiler} compiler compiler
     */
    apply(compiler: Compiler): void;
}
declare namespace ImportMetaPlugin {
    export { getCompilationHooks, IMPORT_META_DIRNAME, IMPORT_META_FILENAME, IMPORT_META_NAMES, IMPORT_META_STAGE_ESM_DETECTION, isImportMetaFieldEnabled, ImportMetaDefinitions, ImportMetaPluginHooks };
}
import type Compiler from "../../Compiler";
declare var getCompilationHooks: (compilation: import("../../Compilation")) => ImportMetaPluginHooks;
declare const IMPORT_META_DIRNAME: "import.meta.dirname";
declare const IMPORT_META_FILENAME: "import.meta.filename";
declare const IMPORT_META_NAMES: string[];
declare const IMPORT_META_STAGE_ESM_DETECTION: -1000;
/**
 * Checks whether webpack should handle an import.meta field.
 * @param {JavascriptParserOptions["importMeta"]} importMeta parser option
 * @param {string} field field name
 * @returns {boolean} true when the field should be handled
 */
declare function isImportMetaFieldEnabled(importMeta: JavascriptParserOptions["importMeta"], field: string): boolean;
/**
 * import.meta definitions collected from DefinePlugin's merged view.
 */
type ImportMetaDefinitions = {
    /**
     * `import.meta.env` node (a map unless custom-defined)
     */
    envNode: DefinePlugin.MergedDefinitionNode | undefined;
    /**
     * custom (non-field) property nodes
     */
    customProps: Map<string, DefinePlugin.MergedDefinitionNode>;
};
/**
 * Defines the import meta plugin hooks type used by this module.
 */
type ImportMetaPluginHooks = {
    propertyInDestructuring: SyncBailHook<[Parser.DestructuringAssignmentProperty], string | void>;
};
import type Compilation from "../../Compilation";
import type { JavascriptParserOptions } from "../../../declarations/WebpackOptions";
import DefinePlugin = require("../../define/DefinePlugin");
import { SyncBailHook } from "tapable";
import type Parser from "../../javascript/JavascriptParser";
