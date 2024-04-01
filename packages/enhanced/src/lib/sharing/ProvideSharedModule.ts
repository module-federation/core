/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Compilation } from 'webpack';
import type WebpackError from 'webpack/lib/WebpackError';
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
import ProvideForSharedDependency from './ProvideForSharedDependency';
import { WEBPACK_MODULE_TYPE_PROVIDE } from '../Constants';
import type { InputFileSystem } from 'webpack/lib/util/fs';
import type { WebpackOptionsNormalized as WebpackOptions } from 'webpack/declarations/WebpackOptions';

const { AsyncDependenciesBlock, Module, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const makeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
) as typeof import('webpack/lib/util/makeSerializable');

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
  private _requiredVersion: string | false;
  private _strictVersion: boolean;
  private _singleton: boolean;

  /**
   * @constructor
   * @param {string} shareScope shared scope name
   * @param {string} name shared key
   * @param {string | false} version version
   * @param {string} request request to the provided module
   * @param {boolean} eager include the module in sync way
   * @param {boolean} requiredVersion version requirement
   * @param {boolean} strictVersion don't use shared version even if version isn't valid
   * @param {boolean} singleton use single global version
   */
  constructor(
    shareScope: string,
    name: string,
    version: string | false,
    request: string,
    eager: boolean,
    requiredVersion: string | false,
    strictVersion: boolean,
    singleton: boolean,
  ) {
    super(WEBPACK_MODULE_TYPE_PROVIDE);
    this._shareScope = shareScope;
    this._name = name;
    this._version = version;
    this._request = request;
    this._eager = eager;
    this._requiredVersion = requiredVersion;
    this._strictVersion = strictVersion;
    this._singleton = singleton;
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
  // @ts-ignore
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
  // @ts-ignore
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
  // @ts-ignore
  override codeGeneration({
    runtimeTemplate,
    moduleGraph,
    chunkGraph,
  }: CodeGenerationContext): CodeGenerationResult {
    const runtimeRequirements = new Set([RuntimeGlobals.initializeSharing]);
    const moduleGetter = this._eager
      ? runtimeTemplate.syncModuleFactory({
          //@ts-ignore
          dependency: this.dependencies[0],
          chunkGraph,
          request: this._request,
          runtimeRequirements,
        })
      : runtimeTemplate.asyncModuleFactory({
          //@ts-ignore
          block: this.blocks[0],
          chunkGraph,
          request: this._request,
          runtimeRequirements,
        });
    const code = `register(${JSON.stringify(this._name)}, ${JSON.stringify(
      this._version || '0',
    )}, ${moduleGetter}${this._eager ? ', 1' : ''});`;
    const sources = new Map();
    const data = new Map();
    data.set('share-init', [
      {
        shareScope: this._shareScope,
        initStage: 10,
        init: code,
      },
    ]);
    data.set('share-init-option', {
      name: this._name,
      version: JSON.stringify(this._version || '0'),
      request: this._request,
      getter: moduleGetter,
      shareScope: [this._shareScope],
      shareConfig: {
        eager: this._eager,
        requiredVersion: this._requiredVersion,
        strictVersion: this._strictVersion,
        singleton: this._singleton,
      },
    });
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
    write(this._requiredVersion);
    write(this._strictVersion);
    write(this._singleton);
    super.serialize(context);
  }

  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {ProvideSharedModule} deserialize fallback dependency
   */
  static deserialize(context: ObjectDeserializerContext): ProvideSharedModule {
    const { read } = context;
    const obj = new ProvideSharedModule(
      read(),
      read(),
      read(),
      read(),
      read(),
      read(),
      read(),
      read(),
    );
    obj.deserialize(context);
    return obj;
  }
}

makeSerializable(
  ProvideSharedModule,
  'enhanced/lib/sharing/ProvideSharedModule',
);

export default ProvideSharedModule;
