import type { Compilation } from 'webpack';
import type {
  InputFileSystem,
  LibIdentOptions,
  NeedBuildContext,
  ObjectDeserializerContext,
  ObjectSerializerContext,
  RequestShortener,
  ResolverWithOptions,
  WebpackOptions,
} from 'webpack/lib/Module';
import type WebpackError from 'webpack/lib/WebpackError';
declare const Module: typeof import('webpack').Module;
export type ExposeOptions = {
  /**
   * requests to exposed modules (last one is exported)
   */
  import: string[];
  /**
   * custom chunk name for the exposed module
   */
  name: string;
};
declare class ContainerEntryModule extends Module {
  private _name;
  private _exposes;
  private _shareScope;
  private _injectRuntimeEntry;
  /**
   * @param {string} name container entry name
   * @param {[string, ExposeOptions][]} exposes list of exposed modules
   * @param {string|string[]} shareScope name of the share scope
   * @param {string} injectRuntimeEntry the path of injectRuntime file.
   */
  constructor(
    name: string,
    exposes: [string, ExposeOptions][],
    shareScope: string | string[],
    injectRuntimeEntry: string,
  );
  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {ContainerEntryModule} deserialized container entry module
   */
  static deserialize(context: ObjectDeserializerContext): ContainerEntryModule;
  /**
   * @returns {Set<string>} types available (do not mutate)
   */
  getSourceTypes(): Set<string>;
  /**
   * @returns {string} a unique identifier of the module
   */
  identifier(): string;
  /**
   * @param {RequestShortener} requestShortener the request shortener
   * @returns {string} a user readable identifier of the module
   */
  readableIdentifier(requestShortener: RequestShortener): string;
  /**
   * @param {LibIdentOptions} options options
   * @returns {string | null} an identifier for library inclusion
   */
  libIdent(options: LibIdentOptions): string | null;
  /**
   * @param {NeedBuildContext} context context info
   * @param {function((WebpackError | null)=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
   * @returns {void}
   */
  needBuild(
    context: NeedBuildContext,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: boolean | undefined,
    ) => void,
  ): void;
  /**
   * @param {WebpackOptions} options webpack options
   * @param {Compilation} compilation the compilation
   * @param {ResolverWithOptions} resolver the resolver
   * @param {InputFileSystem} fs the file system
   * @param {function(WebpackError): void} callback callback function
   * @returns {void}
   */
  build(
    options: WebpackOptions,
    compilation: Compilation,
    resolver: ResolverWithOptions,
    fs: InputFileSystem,
    callback: (err?: WebpackError) => void,
  ): void;
  /**
   * @param {CodeGenerationContext} context context for code generation
   * @returns {CodeGenerationResult} result
   */
  codeGeneration({ moduleGraph, chunkGraph, runtimeTemplate }: any): {
    sources: Map<any, any>;
    runtimeRequirements: Set<
      '__webpack_exports__' | '__webpack_require__.d' | '__webpack_require__.o'
    >;
  };
  /**
   * @param {string=} type the source type for which the size should be estimated
   * @returns {number} the estimated size of the module (must be non-zero)
   */
  size(type?: string): number;
  /**
   * @param {ObjectSerializerContext} context context
   */
  serialize(context: ObjectSerializerContext): void;
}
export default ContainerEntryModule;
