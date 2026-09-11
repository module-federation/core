import { expect, it, rs } from '@rstest/core';
import plugin, { ownershipKey } from './ssr-ownership';

it('observes dynamic loads and rejects them before execution during selective updates', async () => {
  const load = rs.fn(async () => 'loaded');
  const instance = {
    loadRemote: load,
    registerRemotes: rs.fn(),
  } as any;
  plugin().apply!(instance);
  const state = instance[ownershipKey];
  await instance.loadRemote('remote/Value', { from: 'build' });
  expect(state.dynamic).toBe(false);
  state.selective = true;
  await expect(instance.loadRemote('remote/Value')).rejects.toThrow(
    'Dynamic MF consumption',
  );
  expect(load).toHaveBeenCalledTimes(1);
  expect(state.dynamic).toBe(true);
});

it('authorizes registration by async context rather than a process-wide flag', async () => {
  const register = rs.fn();
  const instance = { loadRemote: rs.fn(), registerRemotes: register } as any;
  plugin().apply!(instance);
  const state = instance[ownershipKey];
  const token = {};
  state.owner = token;
  state.selective = true;
  expect(() => instance.registerRemotes([])).toThrow(
    'outside the active SSR update owner',
  );
  expect(register).not.toHaveBeenCalled();
  await state.context.run(token, async () => {
    await Promise.resolve();
    instance.registerRemotes([]);
  });
  expect(register).toHaveBeenCalledTimes(1);
});
