import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import { loadRemote, registerRemotes } from '@module-federation/runtime';
import { describe, expect, it } from '@rstest/core';
import nodeLocalRemote from 'node_local_remote/test';
import { remoteEntryUrl } from '../../remotes';

const execute = promisify(execFile);

describe('node host federation', () => {
  it('starts a webpack consumer with static local and HTTP remotes', async () => {
    const { stdout } = await execute(
      process.execPath,
      [path.resolve(import.meta.dirname, '../../dist/webpack-consumer.cjs')],
      { timeout: 30_000 },
    );

    expect(JSON.parse(stdout)).toEqual({
      nodeLocalRemote: 'module from node-local-remote',
      nodeRemote: 'module from node-remote',
    });
  });
  it('imports a local CommonJS remote statically', () => {
    expect(nodeLocalRemote).toBe('module from node-local-remote');
  });

  it('imports an HTTP remote dynamically', async () => {
    const { default: message } = await import('node_remote/test');

    expect(message).toBe('module from node-remote');
  });

  it('loads a runtime-registered remote and its shared dependency', async () => {
    registerRemotes([
      {
        name: 'node_dynamic_remote',
        entry: remoteEntryUrl('node_dynamic_remote'),
      },
    ]);

    await expect(loadRemote('node_dynamic_remote/test')).resolves.toBe(
      'module from node-dynamic-remote',
    );

    const listAxiosExports = await loadRemote<() => string[]>(
      'node_dynamic_remote/test-with-axios',
    );
    expect(listAxiosExports?.()).toContain('create');
  });

  it('replaces a registered remote when forced', async () => {
    registerRemotes(
      [
        {
          name: 'node_dynamic_remote',
          entry: remoteEntryUrl('node_dynamic_remote'),
        },
      ],
      { force: true },
    );
    await expect(loadRemote('node_dynamic_remote/test')).resolves.toBe(
      'module from node-dynamic-remote',
    );

    registerRemotes(
      [
        {
          name: 'node_dynamic_remote',
          entry: remoteEntryUrl('node_dynamic_remote_new_version'),
        },
      ],
      { force: true },
    );
    await expect(loadRemote('node_dynamic_remote/test')).resolves.toBe(
      'module from node-dynamic-remote-new-version',
    );
  });
});
