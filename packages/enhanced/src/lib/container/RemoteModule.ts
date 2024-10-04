/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Compilation, WebpackOptionsNormalized } from 'webpack';
import type {
  CodeGenerationContext,
  CodeGenerationResult,
  LibIdentOptions,
  NeedBuildContext,
  WebpackError,
} from 'webpack/lib/Module';
import FallbackDependency from './FallbackDependency';
import RemoteToExternalDependency from './RemoteToExternalDependency';
import { WEBPACK_MODULE_TYPE_REMOTE } from '../Constants';
import type { ResolverWithOptions } from 'webpack/lib/ResolverFactory';
import type { InputFileSystem } from 'webpack/lib/FileSystemInfo';
import type { RequestShortener } from 'webpack/lib/RuntimeModule';
import type { ObjectDeserializerContext } from 'webpack/lib/serialization/ObjectMiddleware';

const { sources: webpackSources } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const { Module, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const makeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
) as typeof import('webpack/lib/util/makeSerializable');

const TYPES: Set<string> = new Set(['remote', 'share-init']);
const RUNTIME_REQUIREMENTS: Set<string> = new Set([RuntimeGlobals.module]);

class RemoteModule extends Module {
  private _identifier: string;
  public request: string;
  public externalRequests: string[];
  public internalRequest: string;
  public shareScope: string;

  /**
   * @param {string} request request string
   * @param {string[]} externalRequests list of external requests to containers
   * @param {string} internalRequest name of exposed module in container
   * @param {string} shareScope the used share scope name
   */
  constructor(
    request: string,
    externalRequests: string[],
    internalRequest: string,
    shareScope: string,
  ) {
    super(WEBPACK_MODULE_TYPE_REMOTE);
    this.request = request;
    this.externalRequests = externalRequests;
    this.internalRequest = internalRequest;
    this.shareScope = shareScope;
    this._identifier = `remote (${shareScope}) ${this.externalRequests.join(
      ' ',
    )} ${this.internalRequest}`;
  }

  /**
   * @returns {string} a unique identifier of the module
   */
  override identifier(): string {
    return this._identifier;
  }

  /**
   * @param {RequestShortener} requestShortener the request shortener
   * @returns {string} a user readable identifier of the module
   */
  override readableIdentifier(requestShortener: RequestShortener): string {
    return `remote ${this.request}`;
  }

  /**
   * @param {LibIdentOptions} options options
   * @returns {string | null} an identifier for library inclusion
   */
  override libIdent(options: LibIdentOptions): string | null {
    return `${this.layer ? `(${this.layer})/` : ''}webpack/container/remote/${
      this.request
    }`;
  }

  /**
   * @param {NeedBuildContext} context context info
   * @param {function((WebpackError | null)=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
   * @returns {void}
   */
  override needBuild(
    context: NeedBuildContext,
    callback: (err: WebpackError | null, needsRebuild?: boolean) => void,
  ): void {
    callback(null, !this.buildInfo);
  }

  /**
   * @param {WebpackOptions} options webpack options
   * @param {Compilation} compilation the compilation
   * @param {ResolverWithOptions} resolver the resolver
   * @param {InputFileSystem} fs the file system
   * @param {function(WebpackError=): void} callback callback function
   * @returns {void}
   */
  // @ts-ignore
  override build(
    options: WebpackOptionsNormalized,
    compilation: Compilation,
    resolver: ResolverWithOptions,
    fs: InputFileSystem,
    callback: (err?: WebpackError | undefined) => void,
  ): void {
    this.buildMeta = {};
    this.buildInfo = {
      strict: true,
    };

    this.clearDependenciesAndBlocks();
    if (this.externalRequests.length === 1) {
      this.addDependency(
        new RemoteToExternalDependency(this.externalRequests[0]),
      );
    } else {
      this.addDependency(new FallbackDependency(this.externalRequests));
    }

    callback();
  }

  /**
   * @param {string=} type the source type for which the size should be estimated
   * @returns {number} the estimated size of the module (must be non-zero)
   */
  override size(type?: string): number {
    return 6;
  }

  /**
   * @returns {Set<string>} types available (do not mutate)
   */
  override getSourceTypes(): Set<string> {
    return TYPES;
  }

  /**
   * @returns {string | null} absolute path which should be used for condition matching (usually the resource path)
   */
  override nameForCondition(): string | null {
    return this.request;
  }

  /**
   * @param {CodeGenerationContext} context context for code generation
   * @returns {CodeGenerationResult} result
   */
  // @ts-ignore
  override codeGeneration(
    context: CodeGenerationContext,
  ): CodeGenerationResult {
    const { moduleGraph, chunkGraph } = context;
    const module = moduleGraph.getModule(this.dependencies[0]);
    const id = module && chunkGraph.getModuleId(module);
    const sources = new Map();
    sources.set('remote', new webpackSources.RawSource(''));
    const data = new Map();
    data.set('share-init', [
      {
        shareScope: this.shareScope,
        initStage: 20,
        init: id === undefined ? '' : `initExternal(${JSON.stringify(id)});`,
      },
    ]);
    return { sources, data, runtimeRequirements: RUNTIME_REQUIREMENTS };
  }
  override serialize(context: any) {
    const { write } = context;
    write(this.request);
    write(this.externalRequests);
    write(this.internalRequest);
    write(this.shareScope);
    super.serialize(context);
  }

  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {RemoteModule} deserialized module
   */
  static deserialize(context: ObjectDeserializerContext): RemoteModule {
    const { read } = context;
    const obj = new RemoteModule(read(), read(), read(), read());
    obj.deserialize(context);
    return obj;
  }
}

makeSerializable(RemoteModule, 'enhanced/lib/container/RemoteModule');

export default RemoteModule;
