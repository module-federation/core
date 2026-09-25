import { execFile } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { resolveRspackRuntimeImplementation } from '../src/ModuleFederationPlugin';

jest.setTimeout(120_000);

const HARNESS = path.join(__dirname, 'composed-fixture/harness.mjs');
const SHARED = { 'shared-lib': { singleton: true } };
const EXPOSES = { './Button': './remote/Button.js' };
const COMPOSED_ENTRY =
  /\/node_modules\/\.federation\/rspack\/[\w.-]+\.[0-9a-f]{12}\.mjs$/;
const LEGACY_ENTRY = /webpack-bundler-runtime\/dist\/index\.cjs$/;

const PARTS = {
  shared: /runtime-core\/dist\/(shared(\/(?!disabled)|\.)|utils\/share\.)/,
  remote: /runtime-core\/dist\/remote(\/(?!disabled)|\.)/,
  snapshot:
    /runtime-core\/dist\/(snapshot\.|plugins\/snapshot\/(index|capability)\.|plugins\/generate-preload-assets\.)/,
  platform: /runtime-core\/dist\/platform\/(?!unavailable\.)/,
  nodePlatform:
    /runtime-core\/dist\/platform\/(node|universal)\.|sdk\/dist\/node\./,
  remotes: /webpack-bundler-runtime\/dist\/(adapters\/)?remotes\./,
  consumes: /webpack-bundler-runtime\/dist\/(adapters\/)?consumes\./,
  container:
    /webpack-bundler-runtime\/dist\/(adapters\/container|initContainerEntry)\./,
};
type Part = keyof typeof PARTS;

interface Build {
  errors: string[];
  warnings: string[];
  built: number;
  modules: string[];
}

interface BuildSpec {
  out: string;
  target: 'node' | 'web';
  mf: Record<string, unknown>;
  cacheDir?: string;
  singleChunk?: boolean;
  noVirtualModules?: boolean;
  buildVersion?: string;
  alias?: Record<string, string>;
}

let outRoot: string;
beforeAll(() => {
  outRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-rspack-composed-'));
});
afterAll(() => fs.rmSync(outRoot, { recursive: true, force: true }));

async function harness(
  builds: BuildSpec[],
  mode: { multi?: boolean; watch?: boolean } = {},
): Promise<Build[]> {
  const { stdout } = await promisify(execFile)(
    process.execPath,
    [HARNESS, JSON.stringify({ outRoot, builds, ...mode })],
    { maxBuffer: 1 << 26 },
  );
  const line = stdout.split('\n').find((l) => l.startsWith('RESULT '))!;
  const results: Build[] = JSON.parse(line.slice('RESULT '.length));
  for (const r of results) expect(r.errors).toEqual([]);
  return results;
}

const composed = (experiments: Record<string, unknown> = {}) => ({
  composedRuntime: true,
  ...experiments,
});

const remote = (
  target: 'node' | 'web',
  extra: Record<string, unknown> = {},
) => ({
  name: 'remoteApp',
  filename: 'remoteEntry.js',
  exposes: EXPOSES,
  ...(target === 'node' && {
    library: { type: 'commonjs-module', name: 'remoteApp' },
  }),
  ...extra,
});

const host = (
  extra: Record<string, unknown> = {},
  url = 'http://localhost/remoteEntry.js',
) => ({
  name: 'host',
  remotes: { remoteApp: `remoteApp@${url}` },
  ...extra,
});

const mainCode = (out: string) =>
  fs.readFileSync(path.join(outRoot, out, 'main.js'), 'utf-8');
const composedEntries = (b: Build) =>
  b.modules.filter((m) => COMPOSED_ENTRY.test(m));
const has = (b: Build, part: Part) =>
  b.modules.some((m) => PARTS[part].test(m));
const parts = (b: Build, list: Part[]) =>
  Object.fromEntries(list.map((part) => [part, has(b, part)]));

function expectComposed(b: Build, name: string) {
  expect(composedEntries(b)).toEqual([
    expect.stringMatching(new RegExp(`/${name}\\.[0-9a-f]{12}\\.mjs$`)),
  ]);
  expect(b.modules.filter((m) => LEGACY_ENTRY.test(m))).toEqual([]);
  expect(b.warnings.filter((w) => w.includes('composedRuntime'))).toEqual([]);
}

function serve(root: string): Promise<http.Server> {
  const server = http.createServer((req, res) => {
    const file = path.join(root, new URL(req.url!, 'http://x').pathname);
    if (!file.startsWith(root) || !fs.existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': 'text/javascript' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve(server)),
  );
}

describe('experiments.composedRuntime', () => {
  it('runs a composed host against a composed remote with one shared singleton', async () => {
    const server = await serve(outRoot);
    try {
      const { port } = server.address() as { port: number };
      const [remoteBuild, hostBuild] = await harness([
        {
          out: 'run/remote',
          target: 'node',
          singleChunk: true,
          mf: remote('node', { shared: SHARED, experiments: composed() }),
        },
        {
          out: 'run/host',
          target: 'node',
          mf: host(
            { shared: SHARED, experiments: composed() },
            `http://127.0.0.1:${port}/run/remote/remoteEntry.js`,
          ),
        },
      ]);
      expectComposed(remoteBuild, 'remoteApp');
      expectComposed(hostBuild, 'host');

      const { stdout } = await promisify(execFile)(process.execPath, [
        '-e',
        'require(process.argv[1]).default.then((r) => console.log(JSON.stringify(r)))',
        path.join(outRoot, 'run/host/main.js'),
      ]);
      const result = JSON.parse(stdout);
      expect(result.button).toBe(
        `Button from remoteApp, shared-lib#${result.hostToken}`,
      );
      expect(result.evaluations).toBe(1);
    } finally {
      server.close();
    }
  });

  it('builds a remotes-only host without the shared, snapshot, consumes, or container parts', async () => {
    const [b] = await harness([
      {
        out: 'graph/host',
        target: 'web',
        mf: host({
          experiments: composed({
            optimization: { disableShared: true, disableSnapshot: true },
          }),
        }),
      },
    ]);
    expectComposed(b, 'host');
    expect(mainCode('graph/host')).toContain(
      'typeof FEDERATION_BUILD_IDENTIFIER',
    );
    expect(
      parts(b, [
        'remote',
        'remotes',
        'shared',
        'snapshot',
        'consumes',
        'container',
        'nodePlatform',
      ]),
    ).toEqual({
      remote: true,
      remotes: true,
      shared: false,
      snapshot: false,
      consumes: false,
      container: false,
      nodePlatform: false,
    });
  });

  it('builds an exposes-only remote without a remote handler, loader, or share handler', async () => {
    const [b] = await harness([
      {
        out: 'graph/remote',
        target: 'web',
        mf: remote('web', {
          experiments: composed({
            optimization: { disableRemote: true, disableShared: true },
          }),
        }),
      },
    ]);
    expectComposed(b, 'remoteApp');
    expect(
      parts(b, [
        'container',
        'shared',
        'remote',
        'snapshot',
        'platform',
        'remotes',
        'consumes',
      ]),
    ).toEqual({
      container: true,
      shared: false,
      remote: false,
      snapshot: false,
      platform: false,
      remotes: false,
      consumes: false,
    });
  });

  it('keeps the full runtime and warns when @rspack/core has no VirtualModulesPlugin', async () => {
    const [b] = await harness([
      {
        out: 'legacy/host',
        target: 'web',
        noVirtualModules: true,
        mf: host({ experiments: composed() }),
      },
    ]);
    expect(composedEntries(b)).toEqual([]);
    expect(b.modules.some((m) => LEGACY_ENTRY.test(m))).toBe(true);
    expect(mainCode('legacy/host')).not.toContain(
      'FEDERATION_BUILD_IDENTIFIER',
    );
    expect(b.warnings).toEqual([
      expect.stringContaining(
        'this @rspack/core has no experiments.VirtualModulesPlugin',
      ),
    ]);
  });

  it('keeps the full runtime and warns when resolve.alias already maps the bundler runtime', async () => {
    const bundlerRuntime = require.resolve(
      '@module-federation/webpack-bundler-runtime',
      { paths: [resolveRspackRuntimeImplementation()] },
    );
    const [b] = await harness([
      {
        out: 'user-alias/bundler-runtime',
        target: 'web',
        alias: { [bundlerRuntime]: bundlerRuntime },
        mf: host({ experiments: composed() }),
      },
    ]);
    expect(composedEntries(b)).toEqual([]);
    expect(b.modules.some((m) => LEGACY_ENTRY.test(m))).toBe(true);
    expect(b.warnings).toEqual([
      expect.stringContaining(`resolve.alias already maps ${bundlerRuntime}`),
    ]);
  });

  it('keeps the full runtime and warns when a user alias names a runtime package', async () => {
    const runtimeCore = path.resolve(
      __dirname,
      '../../runtime-core/dist/index.js',
    );
    const [b] = await harness([
      {
        out: 'user-alias/runtime-core',
        target: 'web',
        alias: { '@module-federation/runtime-core$': runtimeCore },
        mf: host({ experiments: composed() }),
      },
    ]);
    expect(composedEntries(b)).toEqual([]);
    expect(b.modules.some((m) => LEGACY_ENTRY.test(m))).toBe(true);
    expect(b.warnings).toEqual([
      expect.stringContaining(
        '@module-federation/runtime-core is aliased by resolve.alias["@module-federation/runtime-core$"]',
      ),
    ]);
  });

  it('keeps the full runtime without the experiment', async () => {
    const [b] = await harness([{ out: 'off/host', target: 'web', mf: host() }]);
    expect(composedEntries(b)).toEqual([]);
    expect(mainCode('off/host')).not.toContain('FEDERATION_BUILD_IDENTIFIER');
    expect(b.modules.some((m) => LEGACY_ENTRY.test(m))).toBe(true);
    expect(b.warnings).toEqual([]);
  });

  it('stays composed, without a warning, across a watch rebuild', async () => {
    const builds = await harness(
      [
        {
          out: 'watch/host',
          target: 'web',
          mf: host({ experiments: composed() }),
        },
      ],
      { watch: true },
    );
    expect(builds).toHaveLength(2);
    for (const b of builds) expectComposed(b, 'host');
    expect(composedEntries(builds[1])).toEqual(composedEntries(builds[0]));
  });

  it('gives each compiler of a MultiCompiler its own plan', async () => {
    const [h, r] = await harness(
      [
        {
          out: 'multi/host',
          target: 'web',
          mf: host({
            experiments: composed({
              optimization: { disableShared: true, disableSnapshot: true },
            }),
          }),
        },
        {
          out: 'multi/remote',
          target: 'web',
          mf: remote('web', {
            experiments: composed({
              optimization: { disableRemote: true, disableShared: true },
            }),
          }),
        },
      ],
      { multi: true },
    );
    expectComposed(h, 'host');
    expectComposed(r, 'remoteApp');
    expect(parts(h, ['remote', 'container'])).toEqual({
      remote: true,
      container: false,
    });
    expect(parts(r, ['remote', 'container'])).toEqual({
      remote: false,
      container: true,
    });
  });

  it('picks the current bootstrap on every build under the persistent cache (A, B, B, A, A at a new version)', async () => {
    const cacheDir = path.join(outRoot, 'cache');
    const plans = { A: { disableShared: true, disableSnapshot: true }, B: {} };
    const steps = [
      { plan: 'A' },
      { plan: 'B' },
      { plan: 'B' },
      { plan: 'A' },
      { plan: 'A', buildVersion: '9.9.9' },
    ] as const;
    const builds: { entry: string; shared: boolean; built: number }[] = [];
    for (const [i, step] of steps.entries()) {
      const [b] = await harness([
        {
          out: `cache/${i}`,
          target: 'web',
          cacheDir,
          buildVersion: 'buildVersion' in step ? step.buildVersion : undefined,
          mf: host({
            experiments: composed({ optimization: plans[step.plan] }),
          }),
        },
      ]);
      expectComposed(b, 'host');
      builds.push({
        entry: composedEntries(b)[0],
        shared: has(b, 'shared'),
        built: b.built,
      });
    }
    expect(builds.map((b) => b.shared)).toEqual([
      false,
      true,
      true,
      false,
      false,
    ]);
    expect(builds[0].entry).toBe(builds[3].entry);
    expect(builds[1].entry).toBe(builds[2].entry);
    expect(builds[0].entry).not.toBe(builds[1].entry);
    expect(builds[2].built).toBe(0);
    expect(builds[4].entry).not.toBe(builds[3].entry);
    expect(mainCode('cache/4')).toContain("buildId: 'host:9.9.9'");
  });
});
