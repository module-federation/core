import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
const compileBooleanMatcher = require(
  normalizeWebpackPath('webpack/lib/util/compileBooleanMatcher'),
) as typeof import('webpack/lib/util/compileBooleanMatcher');
const { getUndoPath } = require(
  normalizeWebpackPath('webpack/lib/util/identifier'),
) as typeof import('webpack/lib/util/identifier');
// inspired by react-refresh-webpack-plugin
import getFederationGlobal from './getFederationGlobal';
import type { NormalizedRuntimeInitOptionsWithOutShared } from './utils';

const { RuntimeModule, RuntimeGlobals, Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const HASH_PLACEHOLDER = /\[(?:full|chunk|content)?hash(?::[^\]]+)?\]/g;

class FederationRuntimeModule extends RuntimeModule {
  runtimeRequirements: ReadonlySet<string>;
  containerName: string;
  initOptionsWithoutShared: NormalizedRuntimeInitOptionsWithOutShared;

  constructor(
    runtimeRequirements: ReadonlySet<string>,
    containerName: string,
    initOptionsWithoutShared: NormalizedRuntimeInitOptionsWithOutShared,
  ) {
    super('federation runtime', RuntimeModule.STAGE_NORMAL - 1);
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
        const runtimeTemplate = this.compilation
          .runtimeTemplate as typeof this.compilation.runtimeTemplate & {
          chunkRootOutputDir?: (
            chunk: import('webpack').Chunk,
            enforceRelative: boolean,
          ) => string;
        };
        // Runtime modules are generated for hashing before chunk hashes exist.
        if (typeof runtimeTemplate.chunkRootOutputDir === 'function') {
          rootOutputDir = runtimeTemplate.chunkRootOutputDir(this.chunk, false);
        } else {
          // Older Webpack has no chunkRootOutputDir. A hash does not change the
          // directory depth of a string template, so neutralize it like Webpack does.
          const template = jsModulePlugin.getChunkFilenameTemplate(
            this.chunk,
            this.compilation.outputOptions,
          );
          const outputName = this.compilation.getPath(
            typeof template === 'function'
              ? (...args: Parameters<typeof template>) =>
                  template(...args).replace(HASH_PLACEHOLDER, 'x')
              : template.replace(HASH_PLACEHOLDER, 'x'),
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

    return Template.asString([
      getFederationGlobal(
        Template,
        RuntimeGlobals,
        matcher,
        rootOutputDir,
        this.initOptionsWithoutShared,
      ),
    ]);
  }
}
export default FederationRuntimeModule;
