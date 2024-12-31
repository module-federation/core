import type { moduleFederationPlugin } from '@module-federation/sdk';
import type { Rspack } from '@rsbuild/core';

// lib-polyfill.js: include core-js，@babel/runtime，@swc/helpers，tslib.
// lib-react.js: include react，react-dom.
// lib-router.js: include react-router，react-router-dom，history，@remix-run/router.
// lib-lodash.js: include lodash，lodash-es.
// lib-antd.js: include antd.
// lib-arco.js: include @arco-design/web-react.
// lib-semi.js: include @douyinfe/semi-ui.
// lib-axios.js: include axios.

const SPLIT_CHUNK_MAP = {
  REACT: 'react',
  ROUTER: 'router',
  LODASH: 'lib-lodash',
  ANTD: 'lib-antd',
  ARCO: 'lib-arco',
  SEMI: 'lib-semi',
  AXIOS: 'lib-axios',
};
const SHARED_SPLIT_CHUNK_MAP = {
  react: SPLIT_CHUNK_MAP.REACT,
  'react-dom': SPLIT_CHUNK_MAP.REACT,
  'react-router': SPLIT_CHUNK_MAP.ROUTER,
  'react-router-dom': SPLIT_CHUNK_MAP.ROUTER,
  '@remix-run/router': SPLIT_CHUNK_MAP.ROUTER,
  lodash: SPLIT_CHUNK_MAP.LODASH,
  'lodash-es': SPLIT_CHUNK_MAP.LODASH,
  antd: SPLIT_CHUNK_MAP.ANTD,
  '@arco-design/web-react': SPLIT_CHUNK_MAP.ARCO,
  '@douyinfe/semi-ui': SPLIT_CHUNK_MAP.SEMI,
  axios: SPLIT_CHUNK_MAP.AXIOS,
};

export function autoDeleteSplitChunkCacheGroups(
  mfConfig: moduleFederationPlugin.ModuleFederationPluginOptions,
  bundlerConfig: Rspack.Configuration,
) {
  if (!mfConfig.shared) {
    return;
  }
  if (
    !bundlerConfig.optimization?.splitChunks ||
    !bundlerConfig.optimization.splitChunks.cacheGroups
  ) {
    return;
  }
  const arrayShared = Array.isArray(mfConfig.shared)
    ? mfConfig.shared
    : Object.keys(mfConfig.shared);
  for (const shared of arrayShared) {
    const splitChunkKey =
      SHARED_SPLIT_CHUNK_MAP[shared as keyof typeof SHARED_SPLIT_CHUNK_MAP];
    if (!splitChunkKey) {
      continue;
    }
    if (bundlerConfig.optimization.splitChunks.cacheGroups[splitChunkKey]) {
      delete bundlerConfig.optimization.splitChunks.cacheGroups[splitChunkKey];
    }
  }
}
