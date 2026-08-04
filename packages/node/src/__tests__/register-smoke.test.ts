/**
 * Smoke tests for the `@module-federation/node/register` entry points. These
 * run against the built dist (the turbo `test` task depends on `build`) in
 * child processes, so they exercise exactly what ships to users.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import * as nodeModule from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const distSrc = join(__dirname, '..', '..', 'dist', 'src');
const registerMjs = join(distSrc, 'register.mjs');
const registerCjs = join(distSrc, 'register.cjs');
const smokeFixture = join(__dirname, 'fixtures', 'native-loader-smoke.mjs');

const distAvailable = existsSync(registerMjs) && existsSync(registerCjs);
const hooksSupported =
  typeof (nodeModule as { register?: unknown }).register === 'function';

const describeSmoke = distAvailable ? describe : describe.skip;
if (!distAvailable) {
  console.warn(
    `[@module-federation/node] register-smoke tests skipped: built dist not ` +
      `found at ${distSrc}. Run the package build first to exercise them.`,
  );
}

function runNode(args: string[], env: NodeJS.ProcessEnv = {}): string {
  return execFileSync(process.execPath, args, {
    encoding: 'utf-8',
    timeout: 30_000,
    env: { ...process.env, ...env },
  });
}

describeSmoke('register entry points (built dist)', () => {
  it('loads the ESM register entry without crashing', () => {
    const output = runNode([
      '--import',
      pathToFileURL(registerMjs).href,
      '-e',
      'console.log("esm-register-ok")',
    ]);
    expect(output).toContain('esm-register-ok');
  });

  it('loads the CJS register entry without crashing', () => {
    const output = runNode([
      '-e',
      `require(${JSON.stringify(registerCjs)}); console.log("cjs-register-ok")`,
    ]);
    expect(output).toContain('cjs-register-ok');
  });

  (hooksSupported ? it : it.skip)(
    'loads an ESM remote entry and its chunk over HTTP through the native loader',
    () => {
      const output = runNode(
        ['--import', pathToFileURL(registerMjs).href, smokeFixture],
        { MF_NODE_DIST_SRC: pathToFileURL(distSrc + '/').href },
      );
      expect(output).toContain('native-loader-smoke:ok');
    },
  );
});
