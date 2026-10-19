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

const HASH_IN_FILENAME = /\[(?:full|chunk|content)?hash(?::[^\]]+)?\]/g;

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
        const { runtimeTemplate } = this.compilation;
        const chunkRootOutputDir = (
          runtimeTemplate as {
            chunkRootOutputDir?: (
              chunk: import('webpack').Chunk,
              withoutPublicPath: boolean,
            ) => string;
          }
        ).chunkRootOutputDir;
        if (typeof chunkRootOutputDir === 'function') {
          // webpack >= 5.111 computes the depth without resolving unsettled hashes
          rootOutputDir = chunkRootOutputDir.call(
            runtimeTemplate,
            this.chunk,
            false,
          );
        } else {
          const template = jsModulePlugin.getChunkFilenameTemplate(
            this.chunk,
            this.compilation.outputOptions,
          );
          // hashes are not settled yet and only change the basename, not the depth
          const filenameTemplate =
            typeof template === 'string'
              ? template.replace(HASH_IN_FILENAME, 'x')
              : template;
          let outputName: string;
          try {
            outputName = this.compilation.getPath(filenameTemplate, {
              chunk: this.chunk,
              contentHashType: 'javascript',
            });
          } catch (err) {
            const originalContentHash = this.chunk.contentHash;
            this.chunk.contentHash = {
              ...originalContentHash,
              javascript: 'x',
            };
            try {
              outputName = this.compilation.getPath(filenameTemplate, {
                chunk: this.chunk,
                contentHashType: 'javascript',
              });
            } finally {
              this.chunk.contentHash = originalContentHash;
            }
          }
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
