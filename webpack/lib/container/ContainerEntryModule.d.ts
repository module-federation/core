export = ContainerEntryModule;
/** @typedef {import("../config/defaults").WebpackOptionsNormalizedWithDefaults} WebpackOptions */
/** @typedef {import("../Compilation")} Compilation */
/** @typedef {import("../Module").BuildCallback} BuildCallback */
/** @typedef {import("../Module").CodeGenerationContext} CodeGenerationContext */
/** @typedef {import("../Module").CodeGenerationResult} CodeGenerationResult */
/** @typedef {import("../Module").LibIdentOptions} LibIdentOptions */
/** @typedef {import("../Module").LibIdent} LibIdent */
/** @typedef {import("../Module").NeedBuildCallback} NeedBuildCallback */
/** @typedef {import("../Module").NeedBuildContext} NeedBuildContext */
/** @typedef {import("../Module").SourceTypes} SourceTypes */
/** @typedef {import("../RequestShortener")} RequestShortener */
/** @typedef {import("../ResolverFactory").ResolverWithOptions} ResolverWithOptions */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("../serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("../util/fs").InputFileSystem} InputFileSystem */
/**
 * @typedef {object} ExposeOptions
 * @property {string[]} import requests to exposed modules (last one is exported)
 * @property {string} name custom chunk name for the exposed module
 */
/** @typedef {[string, ExposeOptions][]} ExposesList */
declare class ContainerEntryModule extends Module {
    /**
     * @param {ObjectDeserializerContext} context context
     * @returns {ContainerEntryModule} deserialized container entry module
     */
    static deserialize(context: ObjectDeserializerContext): ContainerEntryModule;
    /**
     * @param {string} name container entry name
     * @param {ExposesList} exposes list of exposed modules
     * @param {string} shareScope name of the share scope
     */
    constructor(name: string, exposes: ExposesList, shareScope: string);
    _name: string;
    _exposes: ExposesList;
    _shareScope: string;
}
declare namespace ContainerEntryModule {
    export { WebpackOptions, Compilation, BuildCallback, CodeGenerationContext, CodeGenerationResult, LibIdentOptions, LibIdent, NeedBuildCallback, NeedBuildContext, SourceTypes, RequestShortener, ResolverWithOptions, ObjectDeserializerContext, ObjectSerializerContext, InputFileSystem, ExposeOptions, ExposesList };
}
import Module = require("../Module");
type WebpackOptions = import("../config/defaults").WebpackOptionsNormalizedWithDefaults;
type Compilation = import("../Compilation");
type BuildCallback = import("../Module").BuildCallback;
type CodeGenerationContext = import("../Module").CodeGenerationContext;
type CodeGenerationResult = import("../Module").CodeGenerationResult;
type LibIdentOptions = import("../Module").LibIdentOptions;
type LibIdent = import("../Module").LibIdent;
type NeedBuildCallback = import("../Module").NeedBuildCallback;
type NeedBuildContext = import("../Module").NeedBuildContext;
type SourceTypes = import("../Module").SourceTypes;
type RequestShortener = import("../RequestShortener");
type ResolverWithOptions = import("../ResolverFactory").ResolverWithOptions;
type ObjectDeserializerContext = import("../serialization/ObjectMiddleware").ObjectDeserializerContext;
type ObjectSerializerContext = import("../serialization/ObjectMiddleware").ObjectSerializerContext;
type InputFileSystem = import("../util/fs").InputFileSystem;
type ExposeOptions = {
    /**
     * requests to exposed modules (last one is exported)
     */
    import: string[];
    /**
     * custom chunk name for the exposed module
     */
    name: string;
};
type ExposesList = [string, ExposeOptions][];
