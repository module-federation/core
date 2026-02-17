export = ImportMetaPlugin;
declare class ImportMetaPlugin {
    /**
     * @param {Compilation} compilation the compilation
     * @returns {ImportMetaPluginHooks} the attached hooks
     */
    static getCompilationHooks(compilation: Compilation): ImportMetaPluginHooks;
    /**
     * @param {Compiler} compiler compiler
     */
    apply(compiler: Compiler): void;
}
declare namespace ImportMetaPlugin {
    export { MemberExpression, JavascriptParserOptions, Compiler, DependencyLocation, NormalModule, Parser, Range, Members, DestructuringAssignmentProperty, RawRuntimeRequirements, ImportMetaPluginHooks };
}
import Compilation = require("../Compilation");
type MemberExpression = import("estree").MemberExpression;
type JavascriptParserOptions = import("../../declarations/WebpackOptions").JavascriptParserOptions;
type Compiler = import("../Compiler");
type DependencyLocation = import("../Dependency").DependencyLocation;
type NormalModule = import("../NormalModule");
type Parser = import("../javascript/JavascriptParser");
type Range = import("../javascript/JavascriptParser").Range;
type Members = import("../javascript/JavascriptParser").Members;
type DestructuringAssignmentProperty = import("../javascript/JavascriptParser").DestructuringAssignmentProperty;
type RawRuntimeRequirements = import("./ConstDependency").RawRuntimeRequirements;
type ImportMetaPluginHooks = {
    propertyInDestructuring: SyncBailHook<[DestructuringAssignmentProperty], string | void>;
};
import { SyncBailHook } from "tapable";
