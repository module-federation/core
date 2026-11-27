import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';

it('checks disabled handler capabilities against the built enabled contract', () => {
  const root = path.resolve(__dirname, '..');
  const require = createRequire(path.join(root, 'package.json'));
  const dir = mkdtempSync(path.join(tmpdir(), 'mf-handler-types-'));
  const built = (file: string) =>
    path.join(root, 'dist', file).replaceAll('\\', '/');
  try {
    // DisabledRemoteHandler is internal and has no emitted declaration. Check its
    // actual source; resolve only its dependencies to the built declarations.
    writeFileSync(
      path.join(dir, 'disabled.ts'),
      readFileSync(path.join(root, 'src/remote/disabled.ts'), 'utf8')
        .replace("'./index'", JSON.stringify(built('remote/index.js')))
        .replace(
          "import { AsyncHook, PluginSystem } from '../utils/hooks';",
          `import { AsyncHook } from ${JSON.stringify(built('utils/hooks/asyncHook.js'))};\nimport { PluginSystem } from ${JSON.stringify(built('utils/hooks/pluginSystem.js'))};`,
        ),
    );
    writeFileSync(
      path.join(dir, 'consumer.ts'),
      readFileSync(path.join(root, 'type-tests/remote-handler.ts'), 'utf8')
        .replace("'../src/remote/disabled'", "'./disabled'")
        .replaceAll("'../dist/", "'" + built('') + '/'),
    );
    const result = spawnSync(
      process.execPath,
      [
        require.resolve('typescript/bin/tsc'),
        '--noEmit',
        '--strict',
        '--skipLibCheck',
        '--target',
        'ES2021',
        '--module',
        'commonjs',
        '--moduleResolution',
        'node',
        '--ignoreDeprecations',
        '6.0',
        '--types',
        'node',
        '--typeRoots',
        path.join(root, '../../node_modules/@types'),
        path.join(dir, 'consumer.ts'),
      ],
      { encoding: 'utf8', cwd: dir },
    );
    expect(result.status, result.stdout + result.stderr).toBe(0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}, 30000);
