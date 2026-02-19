import { defineConfig } from 'tsdown';
import {
  createDualFormatConfig,
  packageDirFromMetaUrl,
} from '../../tools/scripts/tsdown/phase1-template.mjs';

const packageDir = packageDirFromMetaUrl(import.meta.url);

export default defineConfig([
  {
    ...createDualFormatConfig({
      name: 'node-build',
      packageDir,
      entry: {
        'src/index': 'src/index.ts',
        'src/runtimePlugin': 'src/runtimePlugin.ts',
        'src/recordDynamicRemoteEntryHashPlugin':
          'src/recordDynamicRemoteEntryHashPlugin.ts',
        'src/utils/index': 'src/utils/index.ts',
        'src/utils/flush-chunks': 'src/utils/flush-chunks.ts',
        'src/utils/hot-reload': 'src/utils/hot-reload.ts',
        'src/filesystem/stratagies': 'src/filesystem/stratagies.ts',
        'src/types/index': 'src/types/index.ts',
        'src/plugins/AutomaticPublicPathPlugin':
          'src/plugins/AutomaticPublicPathPlugin.ts',
        'src/plugins/CommonJsChunkLoadingPlugin':
          'src/plugins/CommonJsChunkLoadingPlugin.ts',
        'src/plugins/ChunkCorrelationPlugin':
          'src/plugins/ChunkCorrelationPlugin.ts',
        'src/plugins/DynamicFilesystemChunkLoadingRuntimeModule':
          'src/plugins/DynamicFilesystemChunkLoadingRuntimeModule.ts',
        'src/plugins/EntryChunkTrackerPlugin':
          'src/plugins/EntryChunkTrackerPlugin.ts',
        'src/plugins/NodeFederationPlugin':
          'src/plugins/NodeFederationPlugin.ts',
        'src/plugins/RemotePublicPathRuntimeModule':
          'src/plugins/RemotePublicPathRuntimeModule.ts',
        'src/plugins/StreamingTargetPlugin':
          'src/plugins/StreamingTargetPlugin.ts',
        'src/plugins/UniversalFederationPlugin':
          'src/plugins/UniversalFederationPlugin.ts',
        'src/plugins/UniverseEntryChunkTrackerPlugin':
          'src/plugins/UniverseEntryChunkTrackerPlugin.ts',
        'src/plugins/webpackChunkUtilities':
          'src/plugins/webpackChunkUtilities.ts',
      },
      external: ['@module-federation/*', 'webpack', 'tapable'],
      define: {},
      outExtensions: undefined,
      copyLicense: false,
      unbundle: true,
      format: {
        cjs: {
          define: {
            'process.env.IS_ESM_BUILD': JSON.stringify('false'),
          },
        },
        esm: {
          define: {
            'process.env.IS_ESM_BUILD': JSON.stringify('true'),
          },
        },
      },
      preferNonModuleCjs: false,
    }),
    inlineOnly: false,
    dts: {
      resolver: 'tsc',
    },
    outputOptions: {
      exports: 'named',
    },
  },
]);
