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
      forkDevWorker: join(__dirname, 'src', 'dev-worker', 'forkDevWorker.ts'),
      startBroker: join(__dirname, 'src', 'server', 'broker', 'startBroker.ts'),
      forkGenerateDts: join(
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
