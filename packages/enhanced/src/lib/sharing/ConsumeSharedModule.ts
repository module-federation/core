/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

'use strict';

import { RawSource } from 'webpack-sources';
import AsyncDependenciesBlock from 'webpack/lib/AsyncDependenciesBlock';
import Module, {
  WebpackOptions,
  Compilation,
  UpdateHashContext,
  CodeGenerationContext,
  CodeGenerationResult,
  LibIdentOptions,
  NeedBuildContext,
  RequestShortener,
  ResolverWithOptions,
  WebpackError,
  ObjectDeserializerContext,
  ObjectSerializerContext,
  Hash,
  InputFileSystem,
} from 'webpack/lib/Module';
import { WEBPACK_MODULE_TYPE_CONSUME_SHARED_MODULE } from 'webpack/lib/ModuleTypeConstants';
import RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import makeSerializable from 'webpack/lib/util/makeSerializable';
import { rangeToString, stringifyHoley } from 'webpack/lib/util/semver';
import ConsumeSharedFallbackDependency from './ConsumeSharedFallbackDependency';
export type ConsumeOptions = {
  /**
   * fallback request
   */
  import?: string | undefined;
  /**
   * resolved fallback request
   */
  importResolved?: string | undefined;
  /**
   * global share key
   */
  shareKey: string;
  /**
   * share scope
   */
  shareScope: string;
  /**
   * version requirement
   */
  requiredVersion:
    | import('webpack/lib/util/semver').SemVerRange
    | false
    | undefined;
  /**
   * package name to determine required version automatically
   */
  packageName: string;
  /**
   * don't use shared version even if version isn't valid
   */
  strictVersion: boolean;
  /**
   * use single global version
   */
  singleton: boolean;
  /**
   * include the fallback module in a sync way
   */
  eager: boolean;
};

/** @typedef {import("webpack/declarations/WebpackOptions").WebpackOptionsNormalized} WebpackOptions */
/** @typedef {import("webpack/lib/ChunkGraph")} ChunkGraph */
/** @typedef {import("webpack/lib/ChunkGroup")} ChunkGroup */
/** @typedef {import("webpack/lib/Compilation")} Compilation */
/** @typedef {import("webpack/lib/Dependency").UpdateHashContext} UpdateHashContext */
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
/** @typedef {import("webpack/lib/util/semver").SemVerRange} SemVerRange */

/**
 * @typedef {Object} ConsumeOptions
 * @property {string=} import fallback request
 * @property {string=} importResolved resolved fallback request
 * @property {string} shareKey global share key
 * @property {string} shareScope share scope
 * @property {SemVerRange | false | undefined} requiredVersion version requirement
 * @property {string} packageName package name to determine required version automatically
 * @property {boolean} strictVersion don't use shared version even if version isn't valid
 * @property {boolean} singleton use single global version
 * @property {boolean} eager include the fallback module in a sync way
 */

const TYPES = new Set(['consume-shared']);

class ConsumeSharedModule extends Module {
  options: ConsumeOptions;

  /**
   * @param {string} context context
   * @param {ConsumeOptions} options consume options
   */
  constructor(context: string, options: ConsumeOptions) {
    super(WEBPACK_MODULE_TYPE_CONSUME_SHARED_MODULE, context);
    this.options = options;
  }

  /**
   * @returns {string} a unique identifier of the module
   */
  override identifier(): string {
    const {
      shareKey,
      shareScope,
      importResolved,
      requiredVersion,
      strictVersion,
      singleton,
      eager,
    } = this.options;
    return `${WEBPACK_MODULE_TYPE_CONSUME_SHARED_MODULE}|${shareScope}|${shareKey}|${
      requiredVersion && rangeToString(requiredVersion)
    }|${strictVersion}|${importResolved}|${singleton}|${eager}`;
  }

  /**
   * @param {RequestShortener} requestShortener the request shortener
   * @returns {string} a user readable identifier of the module
   */
  override readableIdentifier(requestShortener: RequestShortener): string {
    const {
      shareKey,
      shareScope,
      importResolved,
      requiredVersion,
      strictVersion,
      singleton,
      eager,
    } = this.options;
    return `consume shared module (${shareScope}) ${shareKey}@${
      requiredVersion ? rangeToString(requiredVersion) : '*'
    }${strictVersion ? ' (strict)' : ''}${singleton ? ' (singleton)' : ''}${
      importResolved
        ? ` (fallback: ${requestShortener.shorten(importResolved)})`
        : ''
    }${eager ? ' (eager)' : ''}`;
  }

  /**
   * @param {LibIdentOptions} options options
   * @returns {string | null} an identifier for library inclusion
   */
  override libIdent(options: LibIdentOptions): string | null {
    const { shareKey, shareScope, import: request } = this.options;
    return `${
      this.layer ? `(${this.layer})/` : ''
    }webpack/sharing/consume/${shareScope}/${shareKey}${
      request ? `/${request}` : ''
    }`;
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
    this.buildInfo = {};
    if (this.options.import) {
      const dep = new ConsumeSharedFallbackDependency(this.options.import);
      if (this.options.eager) {
        this.addDependency(dep);
      } else {
        const block = new AsyncDependenciesBlock({});
        block.addDependency(dep);
        this.addBlock(block);
      }
    }
    callback();
  }

  /**
   * @returns {Set<string>} types available (do not mutate)
   */
  override getSourceTypes(): Set<string> {
    return TYPES;
  }

  /**
   * @param {string=} type the source type for which the size should be estimated
   * @returns {number} the estimated size of the module (must be non-zero)
   */
  override size(type?: string): number {
    return 42;
  }

  /**
   * @param {Hash} hash the hash used to track dependencies
   * @param {UpdateHashContext} context context
   * @returns {void}
   */
  override updateHash(hash: Hash, context: UpdateHashContext): void {
    hash.update(JSON.stringify(this.options));
    super.updateHash(hash, context);
  }

  /**
   * @param {CodeGenerationContext} context context for code generation
   * @returns {CodeGenerationResult} result
   */
  override codeGeneration({
    chunkGraph,
    moduleGraph,
    runtimeTemplate,
  }: CodeGenerationContext): CodeGenerationResult {
    const runtimeRequirements = new Set([RuntimeGlobals.shareScopeMap]);
    const {
      shareScope,
      shareKey,
      strictVersion,
      requiredVersion,
      import: request,
      singleton,
      eager,
    } = this.options;
    let fallbackCode;
    if (request) {
      if (eager) {
        const dep = this.dependencies[0];
        fallbackCode = runtimeTemplate.syncModuleFactory({
          dependency: dep,
          chunkGraph,
          runtimeRequirements,
          request: this.options.import,
        });
      } else {
        const block = this.blocks[0];
        fallbackCode = runtimeTemplate.asyncModuleFactory({
          block,
          chunkGraph,
          runtimeRequirements,
          request: this.options.import,
        });
      }
    }
    let fn = 'load';
    const args = [JSON.stringify(shareScope), JSON.stringify(shareKey)];
    if (requiredVersion) {
      if (strictVersion) {
        fn += 'Strict';
      }
      if (singleton) {
        fn += 'Singleton';
      }
      args.push(stringifyHoley(requiredVersion));
      fn += 'VersionCheck';
    } else {
      if (singleton) {
        fn += 'Singleton';
      }
    }
    if (fallbackCode) {
      fn += 'Fallback';
      args.push(fallbackCode);
    }
    const code = runtimeTemplate.returningFunction(`${fn}(${args.join(', ')})`);
    const sources = new Map();
    sources.set('consume-shared', new RawSource(code));
    return {
      runtimeRequirements,
      sources,
    };
  }

  /**
   * @param {ObjectSerializerContext} context context
   */
  override serialize(context: ObjectSerializerContext): void {
    const { write } = context;
    write(this.options);
    super.serialize(context);
  }

  /**
   * @param {ObjectDeserializerContext} context context
   */
  override deserialize(context: ObjectDeserializerContext): void {
    const { read } = context;
    this.options = read();
    super.deserialize(context);
  }
}

makeSerializable(
  ConsumeSharedModule,
  'webpack/lib/sharing/ConsumeSharedModule',
);

export default ConsumeSharedModule;
