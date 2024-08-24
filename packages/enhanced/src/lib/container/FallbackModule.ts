/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

'use strict';

import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Chunk, ChunkGraph } from 'webpack';
import type {
  CodeGenerationContext,
  CodeGenerationResult,
  Compilation,
  InputFileSystem,
  LibIdentOptions,
  NeedBuildContext,
  ObjectDeserializerContext,
  ObjectSerializerContext,
  RequestShortener,
  ResolverWithOptions,
  WebpackError,
  WebpackOptions,
} from 'webpack/lib/Module';
import { WEBPACK_MODULE_TYPE_FALLBACK } from '../Constants';
import FallbackItemDependency from './FallbackItemDependency';

const { sources: webpackSources } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const { Template, Module, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const makeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
) as typeof import('webpack/lib/util/makeSerializable');

const TYPES = new Set(['javascript']);
const RUNTIME_REQUIREMENTS = new Set([RuntimeGlobals.module]);

class FallbackModule extends Module {
  public requests: string[];
  private _identifier: string;

  /**
   * @param {string[]} requests list of requests to choose one
   */
  constructor(requests: string[]) {
    super(WEBPACK_MODULE_TYPE_FALLBACK);
    this.requests = requests;
    this._identifier = `fallback ${this.requests.join(' ')}`;
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
    return this._identifier;
  }

  /**
   * @param {LibIdentOptions} options options
   * @returns {string | null} an identifier for library inclusion
   */
  override libIdent(options: LibIdentOptions): string | null {
    return `${this.layer ? `(${this.layer})/` : ''}webpack/container/fallback/${
      this.requests[0]
    }/and ${this.requests.length - 1} more`;
  }

  /**
   * @param {Chunk} chunk the chunk which condition should be checked
   * @param {Compilation} compilation the compilation
   * @returns {boolean} true, if the chunk is ok for the module
   */
  override chunkCondition(
    chunk: Chunk,
    { chunkGraph }: { chunkGraph: ChunkGraph },
  ): boolean {
    return chunkGraph.getNumberOfEntryModules(chunk) > 0;
  }

  /**
   * @param {NeedBuildContext} context context info
   * @param {function((WebpackError | null)=, boolean=): void} callback callback function, returns true, if the module needs a rebuild
   * @returns {void}
   */
  override needBuild(
    context: NeedBuildContext,
    callback: (error: WebpackError | null, result?: boolean) => void,
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
    for (const request of this.requests)
      this.addDependency(new FallbackItemDependency(request));

    callback();
  }

  /**
   * @param {string=} type the source type for which the size should be estimated
   * @returns {number} the estimated size of the module (must be non-zero)
   */
  override size(type?: string): number {
    return this.requests.length * 5 + 42;
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
    const ids = this.dependencies.map((dep) =>
      // @ts-expect-error incompatible dependency type
      chunkGraph.getModuleId(moduleGraph.getModule(dep)),
    );
    const code = Template.asString([
      `var ids = ${JSON.stringify(ids)};`,
      'var error, result, i = 0;',
      `var loop = ${runtimeTemplate.basicFunction('next', [
        'while(i < ids.length) {',
        Template.indent([
          `try { next = ${RuntimeGlobals.require}(ids[i++]); } catch(e) { return handleError(e); }`,
          'if(next) return next.then ? next.then(handleResult, handleError) : handleResult(next);',
        ]),
        '}',
        'if(error) throw error;',
      ])}`,
      `var handleResult = ${runtimeTemplate.basicFunction('result', [
        'if(result) return result;',
        'return loop();',
      ])};`,
      `var handleError = ${runtimeTemplate.basicFunction('e', [
        'error = e;',
        'return loop();',
      ])};`,
      'module.exports = loop();',
    ]);
    const sources = new Map();
    sources.set('javascript', new webpackSources.RawSource(code));
    return { sources, runtimeRequirements: RUNTIME_REQUIREMENTS };
  }

  /**
   * @param {ObjectSerializerContext} context context
   */
  override serialize(context: ObjectSerializerContext): void {
    const { write } = context;
    write(this.requests);
    super.serialize(context);
  }

  /**
   * @param {ObjectDeserializerContext} context context
   * @returns {FallbackModule} deserialized fallback module
   */
  static deserialize(context: ObjectDeserializerContext): FallbackModule {
    const { read } = context;
    const obj = new FallbackModule(read());
    obj.deserialize(context);
    return obj;
  }
}

makeSerializable(FallbackModule, 'enhanced/lib/container/FallbackModule');

export default FallbackModule;
