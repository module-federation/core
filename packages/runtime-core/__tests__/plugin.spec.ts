import { describe, expect, it, rs } from '@rstest/core';
import { ModuleFederation } from '../src/core';
import { registerGlobalPlugins } from '../src/global';
import type {
  ModuleFederationRuntimePlugin,
  RuntimePluginHooks,
} from '../src/type';

describe('runtime plugins', () => {
  it('calls apply once when a plugin contains handlers from multiple hook groups', () => {
    const apply = rs.fn();
    const plugin: ModuleFederationRuntimePlugin = {
      name: 'multiple-hook-groups',
      apply,
      beforeInit(args) {
        return args;
      },
      beforeRequest(args) {
        return args;
      },
      beforeLoadShare(args) {
        return args;
      },
      beforeLoadRemoteSnapshot() {},
      createScript() {},
      beforeBridgeRender() {},
    };

    new ModuleFederation({
      name: 'multiple-hook-groups-host',
      plugins: [plugin],
    });

    expect(apply).toHaveBeenCalledTimes(1);
  });

  it('creates isolated handlers for each instance without reading origin', async () => {
    const appliedInstances: Array<ModuleFederation> = [];
    const beforeInitInstances: Array<ModuleFederation> = [];
    const remoteInstances: Array<ModuleFederation> = [];
    const sharedInstances: Array<ModuleFederation> = [];
    const plugin: ModuleFederationRuntimePlugin = {
      name: 'instance-handlers',
      apply(instance) {
        appliedInstances.push(instance);
        return {
          beforeInit(args) {
            beforeInitInstances.push(instance);
            return args;
          },
          beforeRequest(args) {
            remoteInstances.push(instance);
            return args;
          },
          beforeLoadShare(args) {
            sharedInstances.push(instance);
            return args;
          },
        };
      },
    };

    const first = new ModuleFederation({
      name: 'instance-handlers-first',
      plugins: [plugin],
    });
    const second = new ModuleFederation({
      name: 'instance-handlers-second',
      plugins: [plugin],
    });

    await first.remoteHandler.hooks.lifecycle.beforeRequest.emit({
      id: 'first/remote',
      options: first.options,
      origin: first,
    });
    await second.remoteHandler.hooks.lifecycle.beforeRequest.emit({
      id: 'second/remote',
      options: second.options,
      origin: second,
    });
    await first.sharedHandler.hooks.lifecycle.beforeLoadShare.emit({
      pkgName: 'first-shared',
      shared: first.options.shared,
      origin: first,
    });
    await second.sharedHandler.hooks.lifecycle.beforeLoadShare.emit({
      pkgName: 'second-shared',
      shared: second.options.shared,
      origin: second,
    });

    expect(appliedInstances).toEqual([first, second]);
    expect(beforeInitInstances).toEqual([first, second]);
    expect(remoteInstances).toEqual([first, second]);
    expect(sharedInstances).toEqual([first, second]);
  });

  it('binds instance handlers before the first beforeInit event', () => {
    const events: Array<string> = [];
    const plugin: ModuleFederationRuntimePlugin = {
      name: 'synchronous-instance-binding',
      apply() {
        events.push('apply');
        return {
          beforeInit(args) {
            events.push('beforeInit');
            return args;
          },
        };
      },
    };

    new ModuleFederation({
      name: 'synchronous-instance-binding-host',
      plugins: [plugin],
    });

    expect(events).toEqual(['apply', 'beforeInit']);
  });

  it('does not reapply or register handlers again during repeated initialization', () => {
    const apply = rs.fn<() => RuntimePluginHooks>(() => ({
      beforeInit,
    }));
    const beforeInit = rs.fn((args) => args);
    const plugin: ModuleFederationRuntimePlugin = {
      name: 'repeated-init',
      apply,
    };
    const duplicate: ModuleFederationRuntimePlugin = {
      name: 'repeated-init',
      apply: rs.fn(() => ({
        beforeInit: rs.fn((args) => args),
      })),
    };

    const instance = new ModuleFederation({
      name: 'repeated-init-host',
      plugins: [plugin],
    });

    expect('registeredPlugins' in instance).toBe(false);

    instance.initOptions({
      name: 'repeated-init-host',
      plugins: [plugin, duplicate],
    });
    instance.initOptions({
      name: 'repeated-init-host',
      plugins: [duplicate],
    });

    expect(apply).toHaveBeenCalledTimes(1);
    expect(duplicate.apply).not.toHaveBeenCalled();
    expect(beforeInit).toHaveBeenCalledTimes(3);
  });

  it('keeps legacy handlers when apply returns undefined', () => {
    const beforeInit = rs.fn((args) => args);
    const plugin: ModuleFederationRuntimePlugin = {
      name: 'legacy-plugin',
      apply: rs.fn(() => undefined),
      beforeInit,
    };

    new ModuleFederation({
      name: 'legacy-plugin-host',
      plugins: [plugin],
    });

    expect(plugin.apply).toHaveBeenCalledTimes(1);
    expect(beforeInit).toHaveBeenCalledTimes(1);
  });

  it('uses returned handlers instead of shared handlers on the plugin definition', () => {
    const sharedBeforeInit = rs.fn((args) => args);
    const instanceBeforeInit = rs.fn((args) => args);
    const plugin: ModuleFederationRuntimePlugin = {
      name: 'complete-instance-handlers',
      beforeInit: sharedBeforeInit,
      apply() {
        return {
          beforeInit: instanceBeforeInit,
        };
      },
    };

    new ModuleFederation({
      name: 'complete-instance-handlers-host',
      plugins: [plugin],
    });

    expect(instanceBeforeInit).toHaveBeenCalledTimes(1);
    expect(sharedBeforeInit).not.toHaveBeenCalled();
  });

  it('registers semantic Bridge lifecycle handlers on each runtime instance', () => {
    const beforeBridgeRender = rs.fn();
    const afterBridgeRender = rs.fn();
    const beforeBridgeDestroy = rs.fn();
    const afterBridgeDestroy = rs.fn();
    const afterBridgeRouteSync = rs.fn();
    const instance = new ModuleFederation({
      name: 'bridge-lifecycle-host',
      plugins: [
        {
          name: 'bridge-lifecycle-plugin',
          apply: () => ({
            beforeBridgeRender,
            afterBridgeRender,
            beforeBridgeDestroy,
            afterBridgeDestroy,
            afterBridgeRouteSync,
          }),
        },
      ],
    });
    const context = {
      side: 'consumer' as const,
      framework: 'react' as const,
      operation: 'render' as const,
      target: {},
      moduleName: 'remote/App',
      reason: 'mount' as const,
    };
    const result = {
      context,
      result: undefined,
    };
    const args = { dom: context.target };

    instance.bridgeHook.lifecycle.beforeBridgeRender.emit(args, context);
    instance.bridgeHook.lifecycle.afterBridgeRender.emit(args, result);
    instance.bridgeHook.lifecycle.beforeBridgeDestroy.emit(args, context);
    instance.bridgeHook.lifecycle.afterBridgeDestroy.emit(args, result);
    instance.bridgeHook.lifecycle.afterBridgeRouteSync.emit(result);

    expect(beforeBridgeRender).toHaveBeenCalledWith(args, context);
    expect(afterBridgeRender).toHaveBeenCalledWith(args, result);
    expect(beforeBridgeDestroy).toHaveBeenCalledWith(args, context);
    expect(afterBridgeDestroy).toHaveBeenCalledWith(args, result);
    expect(afterBridgeRouteSync).toHaveBeenCalledWith(result);
  });
});

describe('global runtime plugins', () => {
  it('applies a global plugin to future instances with an empty user plugin list', () => {
    const beforeInit = rs.fn((args) => args);
    const apply = rs.fn(() => ({ beforeInit }));

    registerGlobalPlugins([
      {
        name: 'future-global-plugin',
        apply,
      },
    ]);

    const instance = new ModuleFederation({
      name: 'future-global-plugin-host',
      plugins: [],
    });

    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledWith(instance);
    expect(beforeInit).toHaveBeenCalledTimes(1);
  });

  it('prefers an explicitly configured plugin over a global plugin with the same name', () => {
    const globalApply = rs.fn();
    const explicitApply = rs.fn();

    registerGlobalPlugins([
      {
        name: 'same-name-plugin',
        apply: globalApply,
      },
    ]);

    new ModuleFederation({
      name: 'same-name-plugin-host',
      plugins: [
        {
          name: 'same-name-plugin',
          apply: explicitApply,
        },
      ],
    });

    expect(explicitApply).toHaveBeenCalledTimes(1);
    expect(globalApply).not.toHaveBeenCalled();
  });
});
