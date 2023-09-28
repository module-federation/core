/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/
//@ts-ignore
import AsyncDependenciesBlock = require('webpack/lib/AsyncDependenciesBlock');
//@ts-ignore
import Module = require('webpack/lib/Module');
import * as RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
//@ts-ignore
import makeSerializable = require('webpack/lib/util/makeSerializable');
import type Compilation from 'webpack/lib/Compilation';
import WebpackError = require('webpack/lib/WebpackError');
import { WEBPACK_MODULE_TYPE_PROVIDE } from 'webpack/lib/ModuleTypeConstants';
import type {
  CodeGenerationContext,
  CodeGenerationResult,
  LibIdentOptions,
  NeedBuildContext,
  RequestShortener,
  ResolverWithOptions,
  ObjectDeserializerContext,
  ObjectSerializerContext,
} from 'webpack/lib/Module';
import { InputFileSystem } from 'webpack/lib/util/fs';
import ProvideForSharedDependency from './ProvideForSharedDependency';
import { WebpackOptionsNormalized as WebpackOptions } from 'webpack/declarations/WebpackOptions';

/** @typedef {import("webpack/declarations/WebpackOptions").WebpackOptionsNormalized} WebpackOptions */
/** @typedef {import("webpack/lib/Chunk")} Chunk */
/** @typedef {import("webpack/lib/ChunkGraph")} ChunkGraph */
/** @typedef {import("webpack/lib/ChunkGroup")} ChunkGroup */
/** @typedef {import("webpack/lib/Compilation")} Compilation */
/** @typedef {import("webpack/lib/Module").CodeGenerationContext} CodeGenerationContext */
/** @typedef {import("webpack/lib/Module").CodeGenerationResult} CodeGenerationResult */
/** @typedef {import("webpack/lib/Module").LibIdentOptions} LibIdentOptions */
/** @typedef {import("webpack/lib/Module").NeedBuildContext} NeedBuildContext */
/** @typedef {import("webpack/lib/RequestShortener")} RequestShortener */
/** @typedef {import("webpack/lib/ResolverFactory").ResolverWithOptions} ResolverWithOptions */
/** @typedef {import("webpack/lib/WebpackError")} WebpackError */
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectDeserializerContext} ObjectDeserializerContext */
/** @typedef {import("webpack/lib/serialization/ObjectMiddleware").ObjectSerializerContext} ObjectSerializerContext */
/** @typedef {import("webpack/lib/util/Hash")} Hash */
/** @typedef {import("webpack/lib/util/fs").InputFileSystem} InputFileSystem */

const TYPES = new Set(['share-init']);

/**
 * @class
 * @extends {Module}
 */
class ProvideSharedModule extends Module {
  private _shareScope: string;
  private _name: string;
  private _version: string | false;
  private _request: string;
  private _eager: boolean;

  /**
   * @constructor
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
  ) {
    super(WEBPACK_MODULE_TYPE_PROVIDE);
    this._shareScope = shareScope;
    this._name = name;
    this._version = version;
    this._request = request;
    this._eager = eager;
  }

  /**
   * @returns {string} a unique identifier of the module
   */
  override identifier(): string {
    return `provide module (${this._shareScope}) ${this._name}@${this._version} = ${this._request}`;
  }

  /**
   * @param {RequestShortener} requestShortener the request shortener
   * @returns {string} a user readable identifier of the module
   */
  override readableIdentifier(requestShortener: RequestShortener): string {
    return `provide shared module (${this._shareScope}) ${this._name}@${
      this._version
    } = ${requestShortener.shorten(this._request)}`;
  }

  /**
   * @param {LibIdentOptions} options options
   * @returns {string | null} an identifier for library inclusion
   */
  override libIdent(options: LibIdentOptions): string | null {
    return `${this.layer ? `(${this.layer})/` : ''}webpack/sharing/provide/${
      this._shareScope
    }/${this._name}`;
  }

  /**
   * @param {NeedBuildContext} context context info
   * @param {function((WebpackError | null)=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
   * @returns {void}
   */
  override needBuild(
    context: NeedBuildContext,
    callback: (error?: WebpackError | null, needsRebuild?: boolean) => void,
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
  override build(
    options: WebpackOptions,
    compilation: Compilation,
    resolver: ResolverWithOptions,
    fs: InputFileSystem,
    callback: (error?: WebpackError) => void,
  ): void {
    this.buildMeta = {};
    this.buildInfo = {
      strict: true,
    };

    this.clearDependenciesAndBlocks();
    const dep = new ProvideForSharedDependency(this._request);
    if (this._eager) {
      this.addDependency(dep);
    } else {
      const block = new AsyncDependenciesBlock({});
      block.addDependency(dep);
      this.addBlock(block);
    }

    callback();
  }

  /**
   * @param {string=} type the source type for which the size should be estimated
   * @returns {number} the estimated size of the module (must be non-zero)
   */
  override size(type?: string): number {
    return 42;
  }

  /**
   * @returns {Set<string>} types available (do not mutate)
   */
  override getSourceTypes(): Set<string> {
    return TYPES;
  }

  /**
   * @param {CodeGenerationContext} context context for code generation
   * @returns {CodeGenerationResult} result
   */
  override codeGeneration({
    runtimeTemplate,
    moduleGraph,
    chunkGraph,
  }: CodeGenerationContext): CodeGenerationResult {
    const runtimeRequirements = new Set([RuntimeGlobals.initializeSharing]);
    const code = `register(${JSON.stringify(this._name)}, ${JSON.stringify(
      this._version || '0',
    )}, ${
      this._eager
        ? runtimeTemplate.syncModuleFactory({
            dependency: this.dependencies[0],
            chunkGraph,
            request: this._request,
            runtimeRequirements,
          })
        : runtimeTemplate.asyncModuleFactory({
            block: this.blocks[0],
            chunkGraph,
            request: this._request,
            runtimeRequirements,
          })
    }${this._eager ? ', 1' : ''});`;
    const sources = new Map();
    const data = new Map();
    data.set('share-init', [
      {
        shareScope: this._shareScope,
        initStage: 10,
        init: code,
      },
    ]);
    return { sources, data, runtimeRequirements };
  }

  /**
   * @param {ObjectSerializerContext} context context
   */
  override serialize(context: ObjectSerializerContext): void {
    const { write } = context;
    write(this._shareScope);
    write(this._name);
    write(this._version);
    write(this._request);
    write(this._eager);
    super.serialize(context);
  }

  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {ProvideSharedModule} deserialize fallback dependency
   */
  static deserialize(context: ObjectDeserializerContext): ProvideSharedModule {
    const { read } = context;
    const obj = new ProvideSharedModule(read(), read(), read(), read(), read());
    obj.deserialize(context);
    return obj;
  }
}

makeSerializable(
  ProvideSharedModule,
  'enhanced/lib/sharing/ProvideSharedModule',
);

export default ProvideSharedModule;
