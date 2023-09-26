export = RawDataUrlModule;
declare class RawDataUrlModule extends Module {
  /**
   * @param {string} url raw url
   * @param {string} identifier unique identifier
   * @param {string=} readableIdentifier readable identifier
   */
  constructor(
    url: string,
    identifier: string,
    readableIdentifier?: string | undefined,
  );
  url: string;
  urlBuffer: Buffer;
  identifierStr: string;
  readableIdentifierStr: string;
  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  updateHash(hash: Hash, context: UpdateHashContext): void;
}
declare namespace RawDataUrlModule {
  export {
    WebpackOptions,
    Compilation,
    UpdateHashContext,
    CodeGenerationContext,
    CodeGenerationResult,
    NeedBuildContext,
    RequestShortener,
    ResolverWithOptions,
    WebpackError,
    ObjectDeserializerContext,
    ObjectSerializerContext,
    Hash,
    InputFileSystem,
  };
}
import Module = require('../Module');
type Hash = import('../util/Hash');
type UpdateHashContext = import('../Dependency').UpdateHashContext;
type WebpackOptions =
  import('../../declarations/WebpackOptions').WebpackOptionsNormalized;
type Compilation = import('../Compilation');
type CodeGenerationContext = import('../Module').CodeGenerationContext;
type CodeGenerationResult = import('../Module').CodeGenerationResult;
type NeedBuildContext = import('../Module').NeedBuildContext;
type RequestShortener = import('../RequestShortener');
type ResolverWithOptions = import('../ResolverFactory').ResolverWithOptions;
type WebpackError = import('../WebpackError');
type ObjectDeserializerContext =
  import('../serialization/ObjectMiddleware').ObjectDeserializerContext;
type ObjectSerializerContext =
  import('../serialization/ObjectMiddleware').ObjectSerializerContext;
type InputFileSystem = import('../util/fs').InputFileSystem;
