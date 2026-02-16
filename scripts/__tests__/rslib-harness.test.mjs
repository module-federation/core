import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import {
  parseCliArgs,
  resolveProjects,
  validateCommandGuards,
} from '../rslib-harness.mjs';

async function withTempDir(run) {
  const tempRoot = mkdtempSync(join(tmpdir(), 'rslib-harness-test-'));
  try {
    return await run(tempRoot);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

function writeFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
}

function writeRslibProject(root, projectDir, packageName) {
  const fullProjectRoot = join(root, projectDir);
  writeFile(
    join(fullProjectRoot, 'package.json'),
    JSON.stringify({ name: packageName }, null, 2),
  );
  writeFile(
    join(fullProjectRoot, 'rslib.config.ts'),
    'export default { lib: [{ format: "esm" }] };\n',
  );
}

test('parseCliArgs parses project filters, parallel and passthrough', () => {
  const parsed = parseCliArgs([
    'build',
    '--project',
    'pkg-a,pkg-b',
    '--project',
    'pkg-c',
    '--parallel',
    '3',
    '--',
    '--watch',
  ]);

  assert.equal(parsed.command, 'build');
  assert.deepEqual(parsed.projectFilters, ['pkg-a', 'pkg-b', 'pkg-c']);
  assert.equal(parsed.parallel, 3);
  assert.deepEqual(parsed.passthroughArgs, ['--watch']);
});

test('resolveProjects discovers projects from glob entries', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeRslibProject(root, 'packages/pkg-b', 'pkg-b');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      'export default { projects: ["packages/*"] };\n',
    );

    const projects = await resolveProjects({
      harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
      rootDir: root,
      projectFilters: [],
    });

    assert.equal(projects.length, 2);
    assert.deepEqual(
      projects.map((project) => project.name),
      ['pkg-a', 'pkg-b'],
    );
  });
});

test('resolveProjects supports nested harness config recursion', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/leaf', 'leaf');
    writeRslibProject(root, 'packages/group/nested', 'nested-fallback-name');
    writeFile(
      join(root, 'packages/group/rslib.harness.config.mjs'),
      `
export default {
  projects: [
    {
      name: 'nested-explicit',
      root: './nested',
      config: './rslib.config.ts',
    },
  ],
};
`,
    );
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      'export default { projects: ["packages/*"] };\n',
    );

    const projects = await resolveProjects({
      harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
      rootDir: root,
      projectFilters: [],
    });

    assert.equal(projects.length, 2);
    assert.deepEqual(
      projects.map((project) => project.name),
      ['nested-explicit', 'leaf'],
    );
  });
});

test('resolveProjects enforces unique project names', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'duplicate-name');
    writeRslibProject(root, 'packages/pkg-b', 'duplicate-name');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      'export default { projects: ["packages/*"] };\n',
    );

    await assert.rejects(
      () =>
        resolveProjects({
          harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
          rootDir: root,
          projectFilters: [],
        }),
      /Duplicate project name "duplicate-name"/,
    );
  });
});

test('resolveProjects applies project filters', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeRslibProject(root, 'packages/pkg-b', 'pkg-b');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      'export default { projects: ["packages/*"] };\n',
    );

    const projects = await resolveProjects({
      harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
      rootDir: root,
      projectFilters: ['pkg-b'],
    });

    assert.equal(projects.length, 1);
    assert.equal(projects[0]?.name, 'pkg-b');
  });
});

test('validateCommandGuards rejects multi-project watch/mf-dev mode', () => {
  assert.throws(
    () =>
      validateCommandGuards({
        command: 'mf-dev',
        passthroughArgs: [],
        projects: [{ name: 'a' }, { name: 'b' }],
        parallel: 1,
      }),
    /single-project only/,
  );

  assert.throws(
    () =>
      validateCommandGuards({
        command: 'build',
        passthroughArgs: ['--watch'],
        projects: [{ name: 'a' }],
        parallel: 2,
      }),
    /does not support --parallel > 1/,
  );
});
