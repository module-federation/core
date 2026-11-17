/** @jest-environment node */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

test('inferred React declaration imports resolve outside the package source tree', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-react-declarations-'));
  try {
    const sourceDir = path.join(root, 'source');
    const consumerDir = path.join(root, 'consumer');
    for (const directory of [sourceDir, consumerDir]) {
      fs.mkdirSync(path.join(directory, 'node_modules/@types'), {
        recursive: true,
      });
      for (const name of ['react', 'react-dom']) {
        fs.symlinkSync(
          path.dirname(require.resolve(`@types/${name}/package.json`)),
          path.join(directory, 'node_modules/@types', name),
          'junction',
        );
      }
    }
    fs.writeFileSync(
      path.join(sourceDir, 'component.ts'),
      `import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
export const component = () => createElement('div');
export const root = (container: Element) => createRoot(container);`,
    );
    const wrapper = path.join(sourceDir, 'wrapper.ts');
    fs.writeFileSync(
      wrapper,
      `import { component, root } from './component';
export const wrap = () => component();
export const hydrate = (container: Element) => root(container);`,
    );
    const { compilerOptions } = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../tsconfig.json'), 'utf8'),
    );
    const compiler = path.join(
      path.dirname(require.resolve('typescript/package.json')),
      'bin/tsc',
    );
    const configPath = path.join(sourceDir, 'tsconfig.json');
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        compilerOptions: {
          declaration: true,
          emitDeclarationOnly: true,
          strict: true,
          skipLibCheck: true,
          types: [],
          module: 'commonjs',
          target: 'es2020',
          paths: compilerOptions.paths,
        },
        files: ['wrapper.ts'],
      }),
    );
    execFileSync(process.execPath, [compiler, '--project', configPath], {
      timeout: 20_000,
      stdio: 'pipe',
    });
    const declaration = fs.readFileSync(
      path.join(sourceDir, 'wrapper.d.ts'),
      'utf8',
    );
    expect(declaration).not.toContain('node_modules/');
    expect(declaration).toContain('import("react")');
    expect(declaration).toContain('import("react-dom/client")');

    fs.writeFileSync(path.join(consumerDir, 'bridge.d.ts'), declaration);
    const consumer = path.join(consumerDir, 'index.ts');
    fs.writeFileSync(
      consumer,
      `import { wrap, hydrate } from './bridge';
const element: import('react').ReactElement = wrap();
const root: import('react-dom/client').Root = hydrate(document.body);
export { element, root };`,
    );
    const consumerConfigPath = path.join(consumerDir, 'tsconfig.json');
    fs.writeFileSync(
      consumerConfigPath,
      JSON.stringify({
        compilerOptions: {
          strict: true,
          skipLibCheck: false,
          noEmit: true,
          types: [],
          target: 'es2020',
          module: 'commonjs',
        },
        files: ['index.ts'],
      }),
    );
    execFileSync(
      process.execPath,
      [compiler, '--project', consumerConfigPath],
      {
        timeout: 20_000,
        stdio: 'pipe',
      },
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}, 45_000);
