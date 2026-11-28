import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

jest.setTimeout(120_000);

const HARNESS = path.join(__dirname, 'composed-fixture/harness.mjs');
const BUNDLER_RUNTIME = '@module-federation/webpack-bundler-runtime';
const COMPOSED_ENTRY = /\/\.federation\/rspack\/remoteApp\.[0-9a-f]{12}\.mjs$/;
const LEGACY_ENTRY = /webpack-bundler-runtime\/dist\/index\.cjs$/;
const PACKAGES = [
  'runtime-tools',
  'webpack-bundler-runtime',
  'runtime',
  'runtime-core',
  'sdk',
  'error-codes',
];

let outRoot: string;
beforeAll(() => {
  outRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-rspack-exports-'));
});
afterAll(() => fs.rmSync(outRoot, { recursive: true, force: true }));

function copyRuntimeFamily(name: string) {
  const root = path.join(outRoot, name, 'node_modules', '@module-federation');
  for (const pkg of PACKAGES) {
    const source = path.resolve(__dirname, '../..', pkg);
    const target = path.join(root, pkg);
    fs.mkdirSync(target, { recursive: true });
    fs.copyFileSync(
      path.join(source, 'package.json'),
      path.join(target, 'package.json'),
    );
    fs.cpSync(path.join(source, 'dist'), path.join(target, 'dist'), {
      recursive: true,
    });
  }
  return root;
}

async function buildRemote(name: string, family: string) {
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [
      HARNESS,
      JSON.stringify({
        outRoot,
        builds: [
          {
            out: `${name}/output`,
            target: 'node',
            singleChunk: true,
            mf: {
              name: 'remoteApp',
              filename: 'remoteEntry.js',
              exposes: { './Button': './remote/Button.js' },
              library: { type: 'commonjs-module', name: 'remoteApp' },
              implementation: path.join(
                family,
                'runtime-tools/dist/bundler.js',
              ),
            },
          },
        ],
      }),
    ],
    { maxBuffer: 1 << 26 },
  );
  const result = stdout.split('\n').find((line) => line.startsWith('RESULT '))!;
  const [build]: {
    errors: string[];
    warnings: string[];
    modules: string[];
  }[] = JSON.parse(result.slice('RESULT '.length));
  return build;
}

async function expectRemoteWorks(name: string) {
  const { stdout } = await promisify(execFile)(process.execPath, [
    '-e',
    `(async () => {
      const container = require(process.argv[1]).remoteApp;
      await container.init({});
      const exposed = (await container.get('./Button'))();
      console.log(JSON.stringify({
        button: exposed.default(),
        evaluations: globalThis.__sharedLibEvaluations,
      }));
    })().catch((error) => { console.error(error); process.exitCode = 1; });`,
    path.join(outRoot, name, 'output/remoteEntry.js'),
  ]);
  expect(JSON.parse(stdout)).toEqual({
    button: expect.stringMatching(/^Button from remoteApp, shared-lib#/),
    evaluations: 1,
  });
}

describe('conditional runtime exports in a real Rspack build', () => {
  it('composes a copied runtime family with importable subpaths', async () => {
    const family = copyRuntimeFamily('supported');
    const build = await buildRemote('supported', family);

    expect(build.errors).toEqual([]);
    expect(
      build.modules.filter((module) => COMPOSED_ENTRY.test(module)),
    ).toHaveLength(1);
    expect(build.modules.some((module) => LEGACY_ENTRY.test(module))).toBe(
      false,
    );
    expect(build.warnings).toEqual([]);
    await expectRemoteWorks('supported');
  });

  it.each(['require-only', 'missing-target'])(
    'fails the build when the composition export is %s',
    async (condition) => {
      const family = copyRuntimeFamily(condition);
      const bundlerRuntime = path.join(family, 'webpack-bundler-runtime');
      if (condition === 'require-only') {
        const filename = path.join(bundlerRuntime, 'package.json');
        const manifest = JSON.parse(fs.readFileSync(filename, 'utf-8'));
        manifest.exports['./compose'] = { require: './dist/compose.cjs' };
        fs.writeFileSync(filename, JSON.stringify(manifest));
      } else {
        fs.rmSync(path.join(bundlerRuntime, 'dist/compose.js'));
      }

      const build = await buildRemote(condition, family);

      expect(build.errors).toEqual([
        expect.stringContaining(
          `The federation runtime cannot be composed: ${BUNDLER_RUNTIME}/compose cannot be imported for composition`,
        ),
      ]);
      expect(build.warnings).toEqual([]);
    },
  );
});
