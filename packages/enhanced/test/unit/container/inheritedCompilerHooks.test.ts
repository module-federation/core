import fs from 'fs';
import path from 'path';

// Child compilers (`compilation.createChildCompiler`) inherit the parent's taps for every
// compiler hook except these. See `isInheritedChildCompilation` in
// src/lib/container/runtime/utils.ts for why federation taps must not run there.
const NON_INHERITED_HOOKS = new Set([
  'thisCompilation',
  'make',
  'compile',
  'emit',
  'afterEmit',
  'invalid',
  'done',
]);

// Hooks that only fire for the top-level compiler, so their copies in a child never run.
const TOP_LEVEL_ONLY_HOOKS = new Set([
  'afterPlugins',
  'environment',
  'entryOption',
]);

const SRC_DIR = path.resolve(__dirname, '../../../src');
const LINES_TO_SEARCH = 6;

const listSourceFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(fullPath);
    return /\.ts$/.test(entry.name) && !/\.d\.ts$/.test(entry.name)
      ? [fullPath]
      : [];
  });

describe('federation taps on inheritable compiler hooks', () => {
  it('skip inherited child compilations via isInheritedChildCompilation', () => {
    const offenders: string[] = [];

    for (const file of listSourceFiles(SRC_DIR)) {
      const lines = fs.readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, index) => {
        const match = line.match(/compiler\.hooks\.([a-zA-Z]+)\.tap/);
        if (!match) return;
        const hook = match[1];
        if (NON_INHERITED_HOOKS.has(hook) || TOP_LEVEL_ONLY_HOOKS.has(hook)) {
          return;
        }
        const window = lines
          .slice(index, index + LINES_TO_SEARCH + 1)
          .join('\n');
        if (!window.includes('isInheritedChildCompilation(')) {
          offenders.push(
            `${path.relative(SRC_DIR, file)}:${index + 1} (${hook})`,
          );
        }
      });
    }

    expect(offenders).toEqual([]);
  });
});
