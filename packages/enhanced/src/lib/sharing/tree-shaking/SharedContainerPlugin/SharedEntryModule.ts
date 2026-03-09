import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Compilation, Dependency } from 'webpack';
import type {
  CodeGenerationResult,
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
import SharedDependency from './SharedDependency';
import { getFederationGlobalScope } from '../../../container/runtime/utils';

const makeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
) as typeof import('webpack/lib/util/makeSerializable');
const {
  sources: webpackSources,
  Template,
  Module,
  RuntimeGlobals,
} = require(normalizeWebpackPath('webpack')) as typeof import('webpack');
const StaticExportsDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/StaticExportsDependency'),
) as typeof import('webpack/lib/dependencies/StaticExportsDependency');

const SOURCE_TYPES = new Set(['javascript']);

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

class SharedEntryModule extends Module {
  private _name: string;
  private _request: string;

  /**
   * @param {string} name shared name
   * @param {string} request request
   */
  constructor(name: string, request: string) {
    super('shared-entry-module', null);
    // super(JAVASCRIPT_MODULE_TYPE_DYNAMIC, null);
    this._name = name;
    this._request = request;
  }

  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {SharedEntryModule} deserialized container entry module
   */
  static deserialize(context: ObjectDeserializerContext): SharedEntryModule {
    const { read } = context;
    const obj = new SharedEntryModule(read(), read());
    obj.deserialize(context);
    return obj;
  }

  /**
   * @returns {Set<string>} types available (do not mutate)
   */
  override getSourceTypes(): Set<string> {
    return SOURCE_TYPES;
  }
  /**
   * @returns {string} a unique identifier of the module
   */
  override identifier(): string {
    return `shared module ${this._name} ${this._request}`;
  }
  /**
   * @param {RequestShortener} requestShortener the request shortener
   * @returns {string} a user readable identifier of the module
   */
  override readableIdentifier(requestShortener: RequestShortener): string {
    return `shared module ${this._name} ${requestShortener.shorten(this._request)}`;
  }
  /**
   * @param {LibIdentOptions} options options
   * @returns {string | null} an identifier for library inclusion
   */
  override libIdent(options: LibIdentOptions): string | null {
    return `shared module ${this._name}`;
  }
  /**
   * @param {NeedBuildContext} context context info
   * @param {function((WebpackError | null)=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
   * @returns {void}
   */
  override needBuild(
    context: NeedBuildContext,
    callback: (
      arg0: (WebpackError | null) | undefined,
      arg1: boolean | undefined,
    ) => void,
  ): void {
    callback(null, !this.buildMeta);
  }
  /**
   * @param {WebpackOptions} options webpack options
   * @param {Compilation} compilation the compilation
   * @param {ResolverWithOptions} resolver the resolver
   * @param {InputFileSystem} fs the file system
   * @param {function(WebpackError): void} callback callback function
   * @returns {void}
   */
  override build(
    options: WebpackOptions,
    compilation: Compilation,
    resolver: ResolverWithOptions,
    fs: InputFileSystem,
    callback: (err?: WebpackError) => void,
  ): void {
    this.buildMeta = {};
    this.buildInfo = {
      strict: true,
      topLevelDeclarations: new Set(['get', 'init']),
    };
    this.buildMeta.exportsType = 'namespace';
    this.clearDependenciesAndBlocks();

    this.addDependency(
      new StaticExportsDependency(
        ['get', 'init'],
        false,
      ) as unknown as Dependency,
    );

    this.addDependency(new SharedDependency(this._name, this._request));
    callback();
  }

  /**
   * @param {CodeGenerationContext} context context for code generation
   * @returns {CodeGenerationResult} result
   */
  // @ts-ignore
  override codeGeneration({
    // @ts-ignore
    chunkGraph,
    // @ts-ignore
    runtimeTemplate,
  }: CodeGenerationResult) {
    const sources = new Map();
    const runtimeRequirements = new Set([
      RuntimeGlobals.definePropertyGetters,
      RuntimeGlobals.hasOwnProperty,
      RuntimeGlobals.exports,
    ]);
    const moduleGetter = runtimeTemplate.syncModuleFactory({
      dependency: this.dependencies[1],
      chunkGraph,
      request: this._request,
      runtimeRequirements,
    });
    const source = Template.asString([
      `var moduleGetter = ${moduleGetter};`,
      `var get = ${runtimeTemplate.basicFunction('module, getScope', [
        'return moduleGetter();',
      ])};`,
      `var init = ${runtimeTemplate.basicFunction(
        'mfInstance, bundlerRuntime',
        [
          `${getFederationGlobalScope(RuntimeGlobals)}.instance = mfInstance;`,
          `${getFederationGlobalScope(RuntimeGlobals)}.bundlerRuntime = bundlerRuntime;`,
          `if(!${getFederationGlobalScope(RuntimeGlobals)}.installInitialConsumes) { return Promise.resolve(); }`,
          `return ${getFederationGlobalScope(RuntimeGlobals)}.installInitialConsumes({ asyncLoad: true });`,
        ],
      )};`,
      '// This exports getters to disallow modifications',
      `${RuntimeGlobals.definePropertyGetters}(exports, {`,
      Template.indent([
        `get: ${runtimeTemplate.returningFunction('get')},`,
        `init: ${runtimeTemplate.returningFunction('init')}`,
      ]),

      '});',
    ]);

    sources.set(
      'javascript',
      this.useSourceMap || this.useSimpleSourceMap
        ? new webpackSources.OriginalSource(source, 'webpack/shared-entry')
        : new webpackSources.RawSource(source),
    );

    return {
      sources,
      runtimeRequirements,
    };
  }

  /**
   * @param {string=} type the source type for which the size should be estimated
   * @returns {number} the estimated size of the module (must be non-zero)
   */
  override size(type?: string): number {
    return 42;
  }
  /**
   * @param {ObjectSerializerContext} context context
   */
  override serialize(context: ObjectSerializerContext): void {
    const { write } = context;
    write(this._name);
    write(this._request);
    super.serialize(context);
  }
}

makeSerializable(SharedEntryModule, 'SharedEntryModule');

export default SharedEntryModule;
