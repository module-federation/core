export = ProvideSharedModule;
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
declare class ProvideSharedModule extends Module {
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {ProvideSharedModule} deserialize fallback dependency
   */
  static deserialize(context: ObjectDeserializerContext): ProvideSharedModule;
  /**
   * @param {string} shareScope shared scope name
   * @param {string} name shared key
   * @param {string | false} version version
   * @param {string} request request to the provided module
   * @param {boolean} eager include the module in sync way
   */
  constructor(
    shareScope: string,
    name: string,
    version: string | false,
    request: string,
    eager: boolean,
  );
  _shareScope: string;
  _name: string;
  _version: string | false;
  _request: string;
  _eager: boolean;
}
declare namespace ProvideSharedModule {
  export {
    WebpackOptions,
    Compilation,
    BuildCallback,
    CodeGenerationContext,
    CodeGenerationResult,
    LibIdentOptions,
    LibIdent,
    NeedBuildCallback,
    NeedBuildContext,
    SourceTypes,
    RequestShortener,
    ResolverWithOptions,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    InputFileSystem,
  };
}
import Module = require('../Module');
type WebpackOptions =
  import('../config/defaults').WebpackOptionsNormalizedWithDefaults;
type Compilation = import('../Compilation');
type BuildCallback = import('../Module').BuildCallback;
type CodeGenerationContext = import('../Module').CodeGenerationContext;
type CodeGenerationResult = import('../Module').CodeGenerationResult;
type LibIdentOptions = import('../Module').LibIdentOptions;
type LibIdent = import('../Module').LibIdent;
type NeedBuildCallback = import('../Module').NeedBuildCallback;
type NeedBuildContext = import('../Module').NeedBuildContext;
type SourceTypes = import('../Module').SourceTypes;
type RequestShortener = import('../RequestShortener');
type ResolverWithOptions = import('../ResolverFactory').ResolverWithOptions;
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type InputFileSystem = import('../util/fs').InputFileSystem;
