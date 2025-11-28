import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { getFederationGlobalScope } from '../../container/runtime/utils';
import { ShareFallback } from './IndependentSharedPlugin';
import type { Compilation } from 'webpack';

/**
 * Map of shared module name to Map of runtime id to Set of exported names
 * @example {
 *   'antd': {
 *     'main': Set(['Button', 'exportedName2']),
 *   },
 * }
 */
export type ReferencedExports = Map<string, Map<string, Set<string>>>;

const { Template, RuntimeGlobals, RuntimeModule } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class IndependentSharedRuntimeModule extends RuntimeModule {
  buildAssets: ShareFallback = {};
  libraryType = 'global';

  constructor(buildAssets: ShareFallback, libraryType: string) {
    super('shared-fallback', RuntimeModule.STAGE_ATTACH);
    this.buildAssets = buildAssets;
    this.libraryType = libraryType;
  }

  /**
   * @returns {string | null} runtime code
   */
  override generate(): string | null {
    if (!this.buildAssets || !Object.keys(this.buildAssets).length) {
      return null;
    }
    const { compilation, chunkGraph } = this;
    const { runtimeTemplate, moduleGraph } = compilation as Compilation;

    const federationGlobal = getFederationGlobalScope(RuntimeGlobals);
    // const getSharedFallbackGetter = (shareKey, factory, version) => {
    // 	// { react: [  [ react/19.0.0/index.js , 19.0.0, react_global_name, var ]  ] }
    // 	const fallbackItems = shareFallbacks[shareKey];
    // 	if (!fallbackItems) {
    // 		return factory;
    // 	}
    // 	const fallbackItem = version
    // 		? fallbackItems.find(item => item[1] === version)
    // 		: fallbackItems[0];
    // 	return () =>
    // 		__webpack_require__.federation.runtime
    // 			.getRemoteEntry({
    // 				origin,
    // 				remoteInfo: {
    // 					name: globalName,
    // 					entry: `${webpackRequire.p}${filepath}`,
    // 					type,
    // 					entryGlobalName: globalName
    // 				}
    // 			})
    // 			.then(shareEntry =>
    // 				shareEntry.init(origin, bundlerRuntime).then(() => shareEntry.get())
    // 			);
    // };

    return Template.asString([
      `${federationGlobal}.sharedFallback = ${JSON.stringify(this.buildAssets)};`,
      `${federationGlobal}.libraryType = ${JSON.stringify(this.libraryType)};`,

      // `var getSharedFallbackGetter = ${runtimeTemplate.basicFunction(
      //   'shareKey, factory, version',
      //   [
      //     `var fallbackItems = fallbackSharedAssets[shareKey];`,
      //     `if (!fallbackItems) {`,
      //     `	return factory;`,
      //     `}`,
      //     `var fallbackItem = version`,
      //     `	? fallbackItems.find(item => item[1] === version)`,
      //     `	: fallbackItems[0];`,
      //     `return function getSharedFallback() {`,
      //     `	return __webpack_require__.federation.runtime`,
      //     `		.getRemoteEntry({`,
      //     `			origin,`,
      //     `			remoteInfo: {`,
      //     `				name: globalName,`,
      //     `				entry: ${RuntimeGlobals.publicPath} + fallbackItem[0],`,
      //     `				type: fallbackItem[3],`,
      //     `				entryGlobalName: fallbackItem[2]`,
      //     `			}`,
      //     `		})`,
      //     `		.then(shareEntry =>`,
      //     `			shareEntry.init(origin, bundlerRuntime).then(() => shareEntry.get())`,
      //     `		);`,
      //     `}`,
      //   ],
      // )}`,
      `${federationGlobal}.sharedFallback = getSharedFallbackGetter;`,
    ]);
  }
}

export default IndependentSharedRuntimeModule;
