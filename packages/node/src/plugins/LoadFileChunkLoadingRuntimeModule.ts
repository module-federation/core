/*
  MIT License http://www.opensource.org/licenses/mit-license.php
*/
import type { Chunk, ChunkGraph, Compiler } from 'webpack';
import { RuntimeModule, RuntimeGlobals, Template } from 'webpack';
import { getUndoPath } from 'webpack/lib/util/identifier';
import compileBooleanMatcher from 'webpack/lib/util/compileBooleanMatcher';
import {
  generateHmrCode,
  getInitialChunkIds,
  generateLoadingCode,
  generateHmrManifestCode,
  handleOnChunkLoad,
  generateLoadScript,
  generateInstallChunk,
  generateExternalInstallChunkCode
} from './parts';


interface RemotesByType {
  functional: string[];
  normal: string[];
}

interface ReadFileChunkLoadingRuntimeModuleOptions {
  baseURI: Compiler['options']['output']['publicPath'];
  promiseBaseURI?: string;
  remotes: Record<string, string>;
  name?: string;
  debug?: boolean;
}

interface ChunkLoadingContext {
  webpack: Compiler['webpack'];
}

class ReadFileChunkLoadingRuntimeModule extends RuntimeModule {
  private runtimeRequirements: Set<string>;
  private options: ReadFileChunkLoadingRuntimeModuleOptions;
  private chunkLoadingContext: ChunkLoadingContext;

  constructor(
    runtimeRequirements: Set<string>,
    options: ReadFileChunkLoadingRuntimeModuleOptions,
    chunkLoadingContext: ChunkLoadingContext
  ) {
    super('readFile chunk loading', RuntimeModule.STAGE_ATTACH);
    this.runtimeRequirements = runtimeRequirements;

    this.options = options;
    this.chunkLoadingContext = chunkLoadingContext;
  }

  /**
   * @private
   * @param {Chunk} chunk chunk
   * @param {string} rootOutputDir root output directory
   * @returns {string} generated code
   */
  _generateBaseUri(chunk: Chunk, rootOutputDir: string) {
    const options = chunk.getEntryOptions();
    if (options && options.baseUri) {
      return `${RuntimeGlobals.baseURI} = ${JSON.stringify(options.baseUri)};`;
    }

    return `${RuntimeGlobals.baseURI} = require("url").pathToFileURL(${
      rootOutputDir
        ? `__dirname + ${JSON.stringify('/' + rootOutputDir)}`
        : '__filename'
    });`;
  }

  /**
   * @private
   * @param {unknown[]} items item to log
   */
  _getLogger(...items: unknown[]) {
    if (!this.options.debug) {
      return '';
    }

    return `console.log(${items.join(',')});`;
  }


  /**
   * @returns {string} runtime code
   */
  override generate() {
    const { remotes = {}, name } = this.options;
    const { webpack } = this.chunkLoadingContext;
    const { chunkGraph, chunk, compilation } = this;

    if (!chunkGraph || !chunk || !compilation) return '';

    const { runtimeTemplate } = compilation;
    const jsModulePlugin =
      webpack?.javascript?.JavascriptModulesPlugin ||
      require('webpack/lib/javascript/JavascriptModulesPlugin');
    const chunkHasJs = jsModulePlugin.chunkHasJs;
    const fn = RuntimeGlobals.ensureChunkHandlers;

    const conditionMap = chunkGraph.getChunkConditionMap(chunk, chunkHasJs);
    const hasJsMatcher = compileBooleanMatcher(conditionMap);
    const initialChunkIds = getInitialChunkIds(chunk, chunkGraph, chunkHasJs);

    const outputName = compilation.getPath(
      jsModulePlugin.getChunkFilenameTemplate(chunk, compilation.outputOptions),
      { chunk, contentHashType: 'javascript' }
    );
    const rootOutputDir = getUndoPath(
      outputName,
      compilation.outputOptions.path,
      false
    );
    const stateExpression = this.runtimeRequirements.has(
      RuntimeGlobals.hmrDownloadUpdateHandlers
    )
      ? `${RuntimeGlobals.hmrRuntimeStatePrefix}_readFileVm`
      : undefined;

    return Template.asString([
      this.runtimeRequirements.has(RuntimeGlobals.baseURI)
        ? this._generateBaseUri(chunk, rootOutputDir)
        : '// no baseURI',
      '',
      '// object to store loaded chunks',
      '// "0" means "already loaded", Promise means loading',
      `var installedChunks = ${
        stateExpression ? `${stateExpression} = ${stateExpression} || ` : ''
      }{`,
      Template.indent(
        Array.from(initialChunkIds, (id) => `${JSON.stringify(id)}: 0`).join(
          ',\n'
        )
      ),
      '};',
      '',
      handleOnChunkLoad(
        this.runtimeRequirements.has(RuntimeGlobals.onChunksLoaded),
        runtimeTemplate
      ),
      '',
      generateInstallChunk(
        runtimeTemplate,
        this.runtimeRequirements.has(RuntimeGlobals.onChunksLoaded)
      ),
      '',
      this.runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers)
        ? generateLoadScript(runtimeTemplate)
        : '// no remote script loader needed',
      this.runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers)
        ? generateLoadingCode(
            this.runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers),
            fn,
            hasJsMatcher,
            rootOutputDir,
            remotes,
            name
          )
        : '// no chunk loading',
      '',
      generateExternalInstallChunkCode(
        this.runtimeRequirements.has(RuntimeGlobals.externalInstallChunk),
        this.options.debug
      ),
      '',
      generateHmrCode(
        this.runtimeRequirements.has(RuntimeGlobals.hmrDownloadUpdateHandlers),
        rootOutputDir
      ),
      '',
      generateHmrManifestCode(
        this.runtimeRequirements.has(RuntimeGlobals.hmrDownloadManifest),
        rootOutputDir
      ),
    ]);
  }
}

export default ReadFileChunkLoadingRuntimeModule;
