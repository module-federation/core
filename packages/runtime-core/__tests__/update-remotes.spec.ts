import { describe, expect, it } from '@rstest/core';
import { ModuleFederation } from '../src/index';

const remote = (name: string, entry = 'https://example.test/v1.js') => ({
  name,
  entry,
});
describe('explicit remote updates', () => {
  it('makes identical registration a no-op and rejects force and conflicts before adding anything', () => {
    let calls = 0;
    const host = new ModuleFederation({
      name: 'registration',
      remotes: [remote('a')],
      plugins: [
        {
          name: 'observer',
          registerRemote() {
            calls++;
          },
        },
      ],
    });
    const initial = calls;
    host.registerRemotes([remote('a')]);
    expect(calls).toBe(initial);
    expect(() =>
      host.registerRemotes([
        remote('b'),
        remote('a', 'https://example.test/v2.js'),
      ]),
    ).toThrow('updateRemotes');
    expect(() => host.registerRemotes([remote('b')], { force: true })).toThrow(
      'updateRemotes',
    );
    expect(host.options.remotes.map((item) => item.name)).toEqual(['a']);
  });
  it('serializes updates, captures input, and preserves unspecified registrations', async () => {
    let release!: () => void;
    const barrier = new Promise<void>((resolve) => {
      release = resolve;
    });
    const removed: string[] = [];
    const host = new ModuleFederation({
      name: 'queued',
      remotes: [remote('a'), remote('b')],
      plugins: [
        {
          name: 'drain',
          async removeRemote({ remote }) {
            removed.push((remote as { entry: string }).entry);
            if (removed.length === 1) await barrier;
          },
        },
      ],
    });
    const first = host.updateRemotes([
      remote('a', 'https://example.test/v2.js'),
    ]);
    const input = remote('a', 'https://example.test/v3.js');
    const second = host.updateRemotes([input, remote('c')]);
    input.entry = 'caller-mutated';
    await Promise.resolve();
    expect(removed).toHaveLength(1);
    release();
    await Promise.all([first, second]);
    expect(removed).toEqual([
      'https://example.test/v1.js',
      'https://example.test/v2.js',
    ]);
    expect(
      host.options.remotes.map(({ name, entry }) => [name, entry]),
    ).toEqual([
      ['b', 'https://example.test/v1.js'],
      ['a', 'https://example.test/v3.js'],
      ['c', 'https://example.test/v1.js'],
    ]);
  });
  it('preflights the whole batch and allows retry after an asynchronous cleanup failure', async () => {
    let fail = true;
    let removals = 0;
    const host = new ModuleFederation({
      name: 'retry',
      remotes: [remote('a')],
      plugins: [
        {
          name: 'failure',
          async removeRemote() {
            removals++;
            if (fail) {
              fail = false;
              throw new Error('cleanup failed');
            }
          },
        },
      ],
    });
    await expect(
      host.updateRemotes([
        remote('a', 'https://example.test/v2.js'),
        remote('b', ''),
      ]),
    ).rejects.toThrow();
    expect(removals).toBe(0);
    await expect(
      host.updateRemotes([remote('a', 'https://example.test/v2.js')]),
    ).rejects.toThrow('cleanup failed');
    await host.updateRemotes([remote('a', 'https://example.test/v2.js')]);
    expect(host.options.remotes[0]).toMatchObject({
      name: 'a',
      entry: 'https://example.test/v2.js',
    });
  });
  it('can exchange aliases within one upsert batch', async () => {
    const host = new ModuleFederation({
      name: 'aliases',
      remotes: [
        { ...remote('a'), alias: 'first' },
        { ...remote('b'), alias: 'second' },
      ],
    });
    await host.updateRemotes([
      { ...remote('a'), alias: 'second' },
      { ...remote('b'), alias: 'first' },
    ]);
    expect(host.options.remotes.map((item) => item.alias)).toEqual([
      'second',
      'first',
    ]);
  });
});
