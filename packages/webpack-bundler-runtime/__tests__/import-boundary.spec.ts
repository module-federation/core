import { readdirSync, readFileSync } from 'fs';
import { join, relative } from 'path';

const srcDir = join(__dirname, '../src');
const forbidden =
  /^import(?!\s+type\b)[^;]*?from\s+'@module-federation\/(runtime|runtime-core|runtime\/helpers)'/gm;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sourceFiles(join(dir, entry.name))
      : entry.name.endsWith('.ts')
        ? [join(dir, entry.name)]
        : [],
  );
}

test('only the legacy root imports the runtime or runtime-core root or runtime/helpers', () => {
  const offenders = sourceFiles(srcDir)
    .filter((file) => relative(srcDir, file) !== 'index.ts')
    .flatMap((file) =>
      (readFileSync(file, 'utf8').match(forbidden) ?? []).map(
        (line) => `${relative(srcDir, file)}: ${line}`,
      ),
    );
  expect(offenders).toEqual([]);
});
