// inspired by react-refresh-webpack-plugin
import getFederationGlobal from './getFederationGlobal';
import type { NormalizedRuntimeInitOptionsWithOutShared } from './utils';
import {
  getRuntimeGlobals,
  getRuntimeModule,
  getWebpack,
  getWebpackApi,
} from '../../webpack';

const defaultWebpack = getWebpack();
const RuntimeModule = getRuntimeModule(defaultWebpack);

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
    const webpack = getWebpack(this.compilation?.compiler);
    const Template = webpack.Template ?? defaultWebpack.Template;
    const RuntimeGlobals = getRuntimeGlobals(webpack);
    let matcher: string | boolean = false;
    let rootOutputDir: string | undefined;
    if (this.compilation && this.chunk) {
      const jsModulePlugin = getWebpackApi(
        webpack,
        (w) =>
          w.javascript?.JavascriptModulesPlugin ?? w.JavascriptModulesPlugin,
        'webpack/lib/javascript/JavascriptModulesPlugin',
      );
      const { chunkHasJs } = jsModulePlugin;
      if (this.runtimeRequirements.has(RuntimeGlobals.ensureChunkHandlers)) {
        const compileBooleanMatcher = getWebpackApi(
          webpack,
          (w) => w.util?.compileBooleanMatcher,
          'webpack/lib/util/compileBooleanMatcher',
        );
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
          const getUndoPath = getWebpackApi(
            webpack,
            (w) => w.util?.getUndoPath,
            'webpack/lib/util/identifier',
            (m: typeof import('webpack/lib/util/identifier')) => m.getUndoPath,
          );
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
