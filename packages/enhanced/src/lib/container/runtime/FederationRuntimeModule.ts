import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
const compileBooleanMatcher = require(
  normalizeWebpackPath('webpack/lib/util/compileBooleanMatcher'),
) as typeof import('webpack/lib/util/compileBooleanMatcher');
const { getUndoPath } = require(
  normalizeWebpackPath('webpack/lib/util/identifier'),
) as typeof import('webpack/lib/util/identifier');
// inspired by react-refresh-webpack-plugin
import getFederationGlobal from './getFederationGlobal';
import { getDeclaredShareScopes } from '../../sharing/getDeclaredShareScopes';
import {
  FEDERATION_RUNTIME_MODULE_NAME,
  getFederationGlobalScope,
  type NormalizedRuntimeInitOptionsWithOutShared,
} from './utils';

const { RuntimeModule, RuntimeGlobals, Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class FederationRuntimeModule extends RuntimeModule {
  runtimeRequirements: ReadonlySet<string>;
  containerName: string;
  initOptionsWithoutShared: NormalizedRuntimeInitOptionsWithOutShared;

  constructor(
    runtimeRequirements: ReadonlySet<string>,
    containerName: string,
    initOptionsWithoutShared: NormalizedRuntimeInitOptionsWithOutShared,
  ) {
    super(FEDERATION_RUNTIME_MODULE_NAME, RuntimeModule.STAGE_NORMAL - 1);
    this.runtimeRequirements = runtimeRequirements;
    this.containerName = containerName;
    this.initOptionsWithoutShared = initOptionsWithoutShared;
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate() {
    let matcher: string | boolean = false;
    let rootOutputDir: string | undefined;
    if (this.compilation && this.chunk) {
      const jsModulePlugin =
        this.compilation.compiler.webpack?.javascript
          ?.JavascriptModulesPlugin ||
        require(
          normalizeWebpackPath(
            'webpack/lib/javascript/JavascriptModulesPlugin',
          ),
        );
      const { chunkHasJs } = jsModulePlugin;
      if (this.runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers)) {
        const conditionMap = this.compilation.chunkGraph.getChunkConditionMap(
          this.chunk,
          chunkHasJs,
        );
        const hasJsMatcher = compileBooleanMatcher(conditionMap);
        if (typeof hasJsMatcher === 'boolean') {
          matcher = hasJsMatcher;
        } else {
          matcher = hasJsMatcher('chunkId');
        }
        const { runtimeTemplate } = this.compilation;
        // Webpack generates runtime modules for hashing before chunk hashes
        // exist. From 5.110, chunkRootOutputDir avoids resolving the hash.
        if (typeof runtimeTemplate.chunkRootOutputDir === 'function') {
          rootOutputDir = runtimeTemplate.chunkRootOutputDir(this.chunk, false);
        } else {
          // Older webpack ignores an error in that first pass and generates
          // again once hashes exist, so the real filename gives the real depth,
          // even for a hash digest that contains `/`.
          const outputName = this.compilation.getPath(
            jsModulePlugin.getChunkFilenameTemplate(
              this.chunk,
              this.compilation.outputOptions,
            ),
            { chunk: this.chunk, contentHashType: 'javascript' },
          );
          rootOutputDir = getUndoPath(
            outputName,
            this.compilation.outputOptions.path || '',
            false,
          );
        }
      }
    }

    const results = this.compilation?.codeGenerationResults;
    const scopes =
      this.chunk &&
      this.chunkGraph &&
      results &&
      getDeclaredShareScopes(this.chunk, this.chunkGraph, results);
    const federationGlobal = getFederationGlobalScope(RuntimeGlobals);
    return Template.asString([
      getFederationGlobal(
        Template,
        RuntimeGlobals,
        matcher,
        rootOutputDir,
        this.initOptionsWithoutShared,
      ),
      ...(scopes
        ? [`${federationGlobal}.shareScopeDispatch = 'declared';`]
        : []),
      ...(scopes?.length
        ? [
            `${federationGlobal}.additionalShareScopeKeys = ${JSON.stringify(scopes)};`,
          ]
        : []),
    ]);
  }
}
export default FederationRuntimeModule;
