import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  parseCliArgs,
  resolveProjects,
  validateCommandGuards,
} from '../rslib-harness.mjs';

const HARNESS_CLI_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '../rslib-harness.mjs',
);

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

test('parseCliArgs enables list mode for list command', () => {
  const parsed = parseCliArgs(['list', '--project', 'pkg-a', '--json']);
  assert.equal(parsed.command, 'list');
  assert.equal(parsed.list, true);
  assert.equal(parsed.json, true);
  assert.deepEqual(parsed.projectFilters, ['pkg-a']);
});

test('parseCliArgs enables list mode when --json is passed', () => {
  const parsed = parseCliArgs(['build', '--json']);
  assert.equal(parsed.command, 'build');
  assert.equal(parsed.json, true);
  assert.equal(parsed.list, true);
});

test('parseCliArgs rejects invalid --parallel values', () => {
  assert.throws(
    () => parseCliArgs(['build', '--parallel', '0']),
    /Invalid --parallel value "0"/,
  );
});

test('parseCliArgs rejects unknown command values', () => {
  assert.throws(() => parseCliArgs(['deploy']), /Unknown command "deploy"/);
});

test('parseCliArgs supports inline option assignments', () => {
  const parsed = parseCliArgs([
    'build',
    '--config=./custom.harness.mjs',
    '--root=./apps',
    '--project=pkg-a,pkg-b',
    '--parallel=2',
  ]);
  assert.equal(parsed.config, './custom.harness.mjs');
  assert.match(parsed.root, /\/apps$/);
  assert.deepEqual(parsed.projectFilters, ['pkg-a', 'pkg-b']);
  assert.equal(parsed.parallel, 2);
});

test('parseCliArgs rejects empty inline config/root assignments', () => {
  assert.throws(
    () => parseCliArgs(['build', '--config=']),
    /Missing value for --config/,
  );
  assert.throws(
    () => parseCliArgs(['build', '--root=']),
    /Missing value for --root/,
  );
});

test('parseCliArgs rejects unknown options', () => {
  assert.throws(
    () => parseCliArgs(['build', '--mystery']),
    /Unknown option "--mystery"/,
  );
});

test('parseCliArgs rejects missing option values', () => {
  assert.throws(() => parseCliArgs(['build', '--config']), /Missing value/);
  assert.throws(() => parseCliArgs(['build', '--root']), /Missing value/);
  assert.throws(() => parseCliArgs(['build', '--project']), /Missing value/);
  assert.throws(() => parseCliArgs(['build', '--parallel']), /Missing value/);
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

test('resolveProjects merges default and per-project args', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  defaults: { args: ['--lib', 'esm'] },
  projects: [
    {
      name: 'pkg-a',
      root: './packages/pkg-a',
      args: ['--log-level', 'warn'],
    },
  ],
};
`,
    );

    const projects = await resolveProjects({
      harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
      rootDir: root,
      projectFilters: [],
    });

    assert.equal(projects.length, 1);
    assert.deepEqual(projects[0]?.args, [
      '--lib',
      'esm',
      '--log-level',
      'warn',
    ]);
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

test('resolveProjects applies project filters by path case-insensitively', async () => {
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
      projectFilters: ['PACKAGES/PKG-B'],
    });

    assert.equal(projects.length, 1);
    assert.equal(projects[0]?.name, 'pkg-b');
  });
});

test('resolveProjects deduplicates projects resolved from multiple entries', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  projects: [
    'packages/*',
    'packages/pkg-a/rslib.config.ts',
  ],
};
`,
    );

    const projects = await resolveProjects({
      harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
      rootDir: root,
      projectFilters: [],
    });

    assert.equal(projects.length, 1);
    assert.equal(projects[0]?.name, 'pkg-a');
  });
});

test('resolveProjects returns deterministic sorted project ordering', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-b', 'pkg-b');
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  projects: [
    'packages/pkg-b',
    'packages/pkg-a',
  ],
};
`,
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

test('resolveProjects respects ignore patterns in harness config', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeRslibProject(root, 'packages/pkg-b', 'pkg-b');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  ignore: ['packages/pkg-b/**'],
  projects: ['packages/*'],
};
`,
    );

    const projects = await resolveProjects({
      harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
      rootDir: root,
      projectFilters: [],
    });

    assert.equal(projects.length, 1);
    assert.equal(projects[0]?.name, 'pkg-a');
  });
});

test('resolveProjects throws when project filter has no matches', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `export default { projects: ['packages/*'] };`,
    );

    await assert.rejects(
      () =>
        resolveProjects({
          harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
          rootDir: root,
          projectFilters: ['does-not-exist'],
        }),
      /No projects matched filters/,
    );
  });
});

test('resolveProjects validates defaults.args as string array', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  defaults: { args: [true] },
  projects: ['packages/*'],
};
`,
    );

    await assert.rejects(
      () =>
        resolveProjects({
          harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
          rootDir: root,
          projectFilters: [],
        }),
      /"defaults\.args" must be an array of strings/,
    );
  });
});

test('resolveProjects validates defaults as object', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  defaults: true,
  projects: ['packages/*'],
};
`,
    );

    await assert.rejects(
      () =>
        resolveProjects({
          harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
          rootDir: root,
          projectFilters: [],
        }),
      /"defaults" must be an object/,
    );
  });
});

test('resolveProjects rejects defaults array shape', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  defaults: [],
  projects: ['packages/*'],
};
`,
    );

    await assert.rejects(
      () =>
        resolveProjects({
          harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
          rootDir: root,
          projectFilters: [],
        }),
      /"defaults" must be an object/,
    );
  });
});

test('resolveProjects validates top-level root as string', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  root: 123,
  projects: ['packages/*'],
};
`,
    );

    await assert.rejects(
      () =>
        resolveProjects({
          harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
          rootDir: root,
          projectFilters: [],
        }),
      /"root" must be a string/,
    );
  });
});

test('resolveProjects rejects unknown top-level config keys', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  projects: ['packages/*'],
  mystery: true,
};
`,
    );

    await assert.rejects(
      () =>
        resolveProjects({
          harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
          rootDir: root,
          projectFilters: [],
        }),
      /unknown top-level keys: mystery/,
    );
  });
});

test('resolveProjects rejects unknown defaults keys', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  defaults: {
    args: ['--lib', 'esm'],
    extra: true,
  },
  projects: ['packages/*'],
};
`,
    );

    await assert.rejects(
      () =>
        resolveProjects({
          harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
          rootDir: root,
          projectFilters: [],
        }),
      /unknown defaults keys: extra/,
    );
  });
});

test('resolveProjects validates project args as string array', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  projects: [
    {
      root: './packages/pkg-a',
      args: ['--lib', 123],
    },
  ],
};
`,
    );

    await assert.rejects(
      () =>
        resolveProjects({
          harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
          rootDir: root,
          projectFilters: [],
        }),
      /"projects\[0\]\.args" must be an array of strings/,
    );
  });
});

test('resolveProjects rejects unknown project entry keys', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  projects: [
    {
      root: './packages/pkg-a',
      featureFlag: true,
    },
  ],
};
`,
    );

    await assert.rejects(
      () =>
        resolveProjects({
          harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
          rootDir: root,
          projectFilters: [],
        }),
      /"projects\[0\]" has unknown keys: featureFlag/,
    );
  });
});

test('resolveProjects validates project root type', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  projects: [
    {
      root: 123,
    },
  ],
};
`,
    );

    await assert.rejects(
      () =>
        resolveProjects({
          harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
          rootDir: root,
          projectFilters: [],
        }),
      /"projects\[0\]\.root" must be a string/,
    );
  });
});

test('resolveProjects validates nested project entry keys recursively', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  projects: [
    {
      projects: [
        {
          root: './packages/pkg-a',
          mystery: true,
        },
      ],
    },
  ],
};
`,
    );

    await assert.rejects(
      () =>
        resolveProjects({
          harnessConfigPath: join(root, 'rslib.harness.config.mjs'),
          rootDir: root,
          projectFilters: [],
        }),
      /"projects\[0\]\.projects\[0\]" has unknown keys: mystery/,
    );
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

test('list --json emits machine-readable project metadata', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      'export default { projects: ["packages/*"] };\n',
    );

    const result = spawnSync(
      process.execPath,
      [
        HARNESS_CLI_PATH,
        'list',
        '--root',
        root,
        '--config',
        join(root, 'rslib.harness.config.mjs'),
        '--json',
      ],
      {
        cwd: root,
        encoding: 'utf8',
      },
    );

    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.length, 1);
    assert.equal(payload[0]?.name, 'pkg-a');
    assert.equal(payload[0]?.root, 'packages/pkg-a');
    assert.equal(payload[0]?.config, 'packages/pkg-a/rslib.config.ts');
    assert.deepEqual(payload[0]?.args, []);
  });
});

test('build --json --dry-run emits machine-readable command plan', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      'export default { projects: ["packages/*"] };\n',
    );

    const result = spawnSync(
      process.execPath,
      [
        HARNESS_CLI_PATH,
        'build',
        '--root',
        root,
        '--config',
        join(root, 'rslib.harness.config.mjs'),
        '--project',
        'pkg-a',
        '--json',
        '--dry-run',
      ],
      {
        cwd: root,
        encoding: 'utf8',
      },
    );

    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.equal(payload.command, 'build');
    assert.equal(payload.dryRun, true);
    assert.equal(payload.projects.length, 1);
    assert.equal(payload.projects[0]?.name, 'pkg-a');
    assert.equal(payload.commands.length, 1);
    assert.match(
      payload.commands[0]?.command ?? '',
      /^pnpm exec rslib build --config /,
    );
  });
});

test('build --json --dry-run command plan follows deterministic project order', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-b', 'pkg-b');
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      `
export default {
  projects: [
    'packages/pkg-b',
    'packages/pkg-a',
  ],
};
`,
    );

    const result = spawnSync(
      process.execPath,
      [
        HARNESS_CLI_PATH,
        'build',
        '--root',
        root,
        '--config',
        join(root, 'rslib.harness.config.mjs'),
        '--json',
        '--dry-run',
      ],
      {
        cwd: root,
        encoding: 'utf8',
      },
    );

    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    assert.deepEqual(
      payload.projects.map((project) => project.name),
      ['pkg-a', 'pkg-b'],
    );
    assert.deepEqual(
      payload.commands.map((command) => command.name),
      ['pkg-a', 'pkg-b'],
    );
  });
});

test('build --json without --dry-run fails fast', async () => {
  await withTempDir(async (root) => {
    writeRslibProject(root, 'packages/pkg-a', 'pkg-a');
    writeFile(
      join(root, 'rslib.harness.config.mjs'),
      'export default { projects: ["packages/*"] };\n',
    );

    const result = spawnSync(
      process.execPath,
      [
        HARNESS_CLI_PATH,
        'build',
        '--root',
        root,
        '--config',
        join(root, 'rslib.harness.config.mjs'),
        '--json',
      ],
      {
        cwd: root,
        encoding: 'utf8',
      },
    );

    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /--json requires list mode or --dry-run to avoid mixed structured and live command output/,
    );
  });
});
