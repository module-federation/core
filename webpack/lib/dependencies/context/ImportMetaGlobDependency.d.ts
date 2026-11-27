export = ImportMetaGlobDependency;
/** @import { Range } from "../../javascript/JavascriptParser" */
/** @import { ContextDependencyOptions } from "./ContextDependency" */
/**
 * @typedef {ContextDependencyOptions & {
 * patterns: string[],
 * requestContext: string,
 * importName?: string,
 * exhaustive?: boolean,
 * caseSensitive?: boolean,
 * }} ImportMetaGlobDependencyOptions
 */
declare class ImportMetaGlobDependency extends ContextDependency {
    /**
     * @param {ImportMetaGlobDependencyOptions} options options
     * @param {Range} range range
     */
    constructor(options: ImportMetaGlobDependencyOptions, range: Range);
}
declare namespace ImportMetaGlobDependency {
    export { ModuleDependencyTemplateAsRequireId as Template, ImportMetaGlobDependencyOptions };
}
import ContextDependency = require("./ContextDependency");
import type { Range } from "../../javascript/JavascriptParser";
import ModuleDependencyTemplateAsRequireId = require("../core/ModuleDependencyTemplateAsRequireId");
type ImportMetaGlobDependencyOptions = ContextDependency.ContextDependencyOptions & {
    patterns: string[];
    requestContext: string;
    importName?: string;
    exhaustive?: boolean;
    caseSensitive?: boolean;
};
