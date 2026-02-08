import fs from 'fs';
import os from 'os';
import path from 'path';
import * as vm from 'vm';
import type { LoaderContext } from 'webpack';
import pagesMapLoader from './pages-map-loader';

function createTempAppDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'nextjs-mf-pages-map-test-'));
}

function compilePagesMap(
  rootContext: string,
  useV2: boolean,
): Record<string, string> {
  let generatedSource = '';
  pagesMapLoader.call({
    getOptions: () => (useV2 ? { v2: true } : {}),
    rootContext,
    callback: (_error: Error | null | undefined, source?: string) => {
      generatedSource = source || '';
    },
  } as unknown as LoaderContext<Record<string, unknown>>);

  const sandbox = {
    module: { exports: {} as { default?: Record<string, string> } },
    exports: {},
  };
  vm.runInNewContext(generatedSource, sandbox);
  return sandbox.module.exports.default || {};
}

describe('core/features/pages-map-loader', () => {
  it('sorts dynamic routes ahead of optional catch-all routes', () => {
    const cwd = createTempAppDir();
    fs.mkdirSync(path.join(cwd, 'pages', 'blog'), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, 'pages', 'blog', 'index.tsx'),
      'export default function Page() { return null; }',
    );
    fs.writeFileSync(
      path.join(cwd, 'pages', 'blog', '[slug].tsx'),
      'export default function Page() { return null; }',
    );
    fs.writeFileSync(
      path.join(cwd, 'pages', 'blog', '[[...slug]].tsx'),
      'export default function Page() { return null; }',
    );

    const map = compilePagesMap(cwd, true);
    expect(Object.keys(map)).toEqual([
      '/blog',
      '/blog/[slug]',
      '/blog/[[...slug]]',
    ]);
  });
});
