import { beforeEach, describe, expect, it, rs } from '@rstest/core';
import { DtsPlugin } from './DtsPlugin';
import { DevPlugin } from './DevPlugin';

const { createDevWorker, worker } = rs.hoisted(() => {
  const worker = { update: rs.fn(), exit: rs.fn() };
  return { worker, createDevWorker: rs.fn((_options: unknown) => worker) };
});
rs.mock('../dev-worker', () => ({ createDevWorker }));
rs.mock('./utils', () => ({
  isDev: () => true,
  getCompilerOutputDir: () => '/project/dist',
}));

function compiler() {
  const hooks: Record<string, () => void> = {};
  const hook = (name: string) => ({
    tap(_plugin: string, callback: () => void) {
      hooks[name] = callback;
    },
  });
  return {
    hooks,
    value: {
      context: '/project',
      options: { entry: { main: { import: ['./index.js'] } } },
      webpack: {
        DefinePlugin: class {
          apply() {}
        },
      },
      hooks: {
        afterEmit: hook('emit'),
        watchClose: hook('close'),
        shutdown: hook('shutdown'),
      },
    } as any,
  };
}

describe('development notifications without DTS', () => {
  beforeEach(() => {
    rs.clearAllMocks();
    rs.spyOn(DevPlugin, 'ensureLiveReloadEntry').mockImplementation(() => {});
  });

  it('honors explicit JS live reload without waiting for type promises', async () => {
    const current = compiler();
    const unexpectedExitListeners = process.listenerCount('uncaughtException');
    new DtsPlugin({
      name: 'js-only',
      dts: false,
      dev: { disableLiveReload: false },
    }).apply(current.value);
    await rs.waitFor(() => expect(createDevWorker).toHaveBeenCalledOnce());
    expect(createDevWorker.mock.calls[0][0]).toMatchObject({
      disableLiveReload: false,
      disableHotTypesReload: true,
      remote: undefined,
    });
    expect(process.listenerCount('uncaughtException')).toBe(
      unexpectedExitListeners,
    );
    current.hooks.emit();
    expect(worker.update).toHaveBeenCalledOnce();
    current.hooks.close();
    expect(worker.exit).toHaveBeenCalledOnce();
  });

  it('does not start type workers or inject type hints when dts is false by default', async () => {
    const current = compiler();
    const plugin = new DtsPlugin({ name: 'js-only', dts: false });
    plugin.apply(current.value);
    await Promise.resolve();
    expect(createDevWorker).not.toHaveBeenCalled();
    expect(plugin.clonedOptions.runtimePlugins).toBeUndefined();
    expect(DevPlugin.ensureLiveReloadEntry).not.toHaveBeenCalled();
  });

  it('retains explicit dev:false even when live reload could otherwise start', async () => {
    const current = compiler();
    new DtsPlugin({ name: 'disabled', dts: false, dev: false }).apply(
      current.value,
    );
    await Promise.resolve();
    expect(createDevWorker).not.toHaveBeenCalled();
    expect(current.hooks).toEqual({});
  });

  it('does not launch a late worker after the compiler closes', async () => {
    const current = compiler();
    new DtsPlugin({
      name: 'closed',
      dts: false,
      dev: { disableLiveReload: false },
    }).apply(current.value);
    current.hooks.shutdown();
    await Promise.resolve();
    expect(createDevWorker).not.toHaveBeenCalled();
  });
});
