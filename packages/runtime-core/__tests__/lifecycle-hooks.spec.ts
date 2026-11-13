import { expect, it, rs } from '@rstest/core';
import { ModuleFederation } from '../src';

it('uses a plugin cleanup without knowing the container implementation', async () => {
  const remove = rs.fn();
  const host = new ModuleFederation({
    name: 'custom-cleanup',
    remotes: [{ name: 'a', entry: 'https://example.test/a.js' }],
    plugins: [
      { name: 'custom-container', beforeRemoveRemote: () => ({ remove }) },
    ],
  });
  await host.removeRemote('a');
  expect(remove).toHaveBeenCalledOnce();
  expect(host.options.remotes).toEqual([]);
  expect('retainedProviders' in host).toBe(false);
});

it('notifies every disposal listener and waits for asynchronous cleanup after a failure', async () => {
  const { default: helpers } = await import('../src/helpers');
  const syncError = new Error('synchronous cleanup failed');
  const asyncError = new Error('asynchronous cleanup failed');
  const origin = new ModuleFederation({
    name: 'dispose-notification',
    remotes: [],
  });
  const lateListener = rs.fn();
  let finish!: () => void;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const completed: string[] = [];
  origin.hooks.lifecycle.dispose.on(({ origin: notified }) => {
    expect(notified).toBe(origin);
    origin.hooks.lifecycle.dispose.removeAll();
    origin.hooks.lifecycle.dispose.on(lateListener);
    throw syncError;
  });
  origin.hooks.lifecycle.dispose.on(async () => {
    await pending;
    completed.push('async');
    throw asyncError;
  });
  origin.hooks.lifecycle.dispose.on(() => {
    completed.push('last');
  });
  let settled = false;
  const notification = helpers.dispose.notifyDispose(origin).catch((error) => {
    settled = true;
    return error;
  });
  await Promise.resolve();
  await Promise.resolve();
  expect(completed).toEqual(['last']);
  expect(settled).toBe(false);
  finish();
  const error = await notification;
  expect(error).toBeInstanceOf(AggregateError);
  expect(error.errors).toEqual([syncError, asyncError]);
  expect(completed).toEqual(['last', 'async']);
  expect(lateListener).not.toHaveBeenCalled();
});

it('leaves loading and registration policy to an optional lifecycle plugin', async () => {
  const { default: helpers } = await import('../src/helpers');
  const host = new ModuleFederation({
    name: 'bare-runtime-lifecycle',
    remotes: [],
    shared: { library: { version: '1.0.0', lib: () => 'shared value' } },
    plugins: [
      {
        name: 'entry-loader',
        loadEntry: async () => ({
          init() {},
          get: async () => () => 'remote value',
        }),
      },
    ],
  });
  expect('destroy' in host).toBe(false);
  expect('disposed' in host).toBe(false);
  await helpers.dispose.notifyDispose(host);
  host.registerRemotes([
    { name: 'remote', entry: 'https://example.test/entry.js' },
  ]);
  expect(await host.loadRemote('remote/value')).toBe('remote value');
  expect(host.loadShareSync('library')()).toBe('shared value');
});
