import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

import { reactExposes } from '../shared/exposes';

const typeCheckerTypeScriptPath = require.resolve('typescript-compiler');

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  server: {
    ssr: {
      mode: 'stream',
    },
    port: 5103,
  },
  tools: {
    rspack(config) {
      config.plugins ||= [];
      config.plugins.push({
        apply(compiler: any) {
          compiler.hooks.thisCompilation.tap(
            'ReactExposeMetadata',
            (compilation: any) => {
              compilation.hooks.processAssets.tap(
                { name: 'ReactExposeMetadata', stage: 4999 },
                () => {
                  for (const asset of compilation.getAssets()) {
                    if (!/mf-(manifest|stats)\.json$/.test(asset.name))
                      continue;
                    const json = JSON.parse(asset.source.source().toString());
                    json.metaData.reactExposes = reactExposes;
                    compilation.updateAsset(
                      asset.name,
                      new compiler.webpack.sources.RawSource(
                        JSON.stringify(json, null, 2),
                      ),
                    );
                  }
                },
              );
            },
          );
        },
      });
    },
    tsChecker: {
      typescript: {
        typescriptPath: typeCheckerTypeScriptPath,
      },
    },
  },
  plugins: [appTools(), moduleFederationPlugin()],
});
