import { join } from 'path';
import type { Options } from 'tsup';

function generateConfigurations(
  options: Array<[string[] | Record<string, string>, Options]>,
): Options[] {
  return options.map((option) => {
    const [entry, config] = option;
    return {
      tsconfig: join(__dirname, 'tsconfig.json'),
      entry,
      clean: true,
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
      server: join(__dirname, 'src', 'server', 'index.ts'),
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
    },
    {
      format: ['cjs'],
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
