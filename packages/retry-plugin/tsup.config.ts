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
      outDir: join('packages', 'retry-plugin', 'dist'),
      external: [join(__dirname, 'package.json')],
      ...config,
    };
  });
}

export const tsup: Options[] = generateConfigurations([
  [
    {
      index: join(__dirname, 'src', 'index.ts'),
    },
    {
      format: ['cjs', 'esm'],
    },
  ],
]);
