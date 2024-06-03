import { join } from 'path';
import type { Options } from 'tsup';

function generateConfigurations(
  options: Array<[string[] | Record<string, string>, Options]>,
): Options[] {
  return options.map((option) => {
    const [entry, config] = option;
    return {
      entry,
      clean: true,
      tsconfig: join(__dirname, 'tsconfig.json'),
      dts: true,
      legacyOutput: true,
      outDir: join('packages', 'dts-plugin', 'dist'),
      external: [join(__dirname, 'package.json')],
      ...config,
    };
  });
}

export const tsup: Options[] = generateConfigurations([
  [
    {
      index: join(__dirname, 'src', 'index.ts'),
      core: join(__dirname, 'src', 'core', 'index.ts'),
      'fork-dev-worker': join(
        __dirname,
        'src',
        'dev-worker',
        'forkDevWorker.ts',
      ),
      'start-broker': join(
        __dirname,
        'src',
        'server',
        'broker',
        'startBroker.ts',
      ),
      'fork-generate-dts': join(
        __dirname,
        'src',
        'core',
        'lib',
        'forkGenerateDts.ts',
      ),
      'create-websocket': join(
        __dirname,
        'src',
        'server',
        'createWebsocket.ts',
      ),
      'server-actions': join(
        __dirname,
        'src',
        'server',
        'message',
        'Action',
        'index.ts',
      ),
    },
    {
      format: ['cjs', 'esm'],
    },
  ],
  [
    {
      'launch-web-client': join(
        __dirname,
        'src',
        'server',
        'launchWebClient.ts',
      ),
    },
    {
      format: ['iife'],
      platform: 'browser',
    },
  ],
]);
