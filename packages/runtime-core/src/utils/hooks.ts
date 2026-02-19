import type { ModuleFederation } from '../core';
import { error, warn } from './logger';
import { isObject, isPlainObject } from './tool';
import { assert } from './logger';

// --- Types ---

export type Callback<T, K> = (...args: ArgsType<T>) => K;
export type ArgsType<T> = T extends Array<any> ? T : Array<any>;

const checkReturnData = (orig: any, ret: any): boolean =>
  isObject(ret) && (orig === ret || Object.keys(orig).every((k) => k in ret));

// --- Unified Hook class ---

type EmitStrategy = 'sync' | 'async' | 'syncWaterfall' | 'asyncWaterfall';

class Hook<T, K> {
  listeners = new Set<Callback<T, K>>();
  onerror: (errMsg: string | Error | unknown) => void = error;
  protected strategy: EmitStrategy;

  constructor(
    strategy: EmitStrategy,
    public type = '',
  ) {
    this.strategy = strategy;
  }

  on(fn: Callback<T, K>): void {
    if (typeof fn === 'function') {
      this.listeners.add(fn);
    }
  }

  once(fn: Callback<T, K>): void {
    const wrapper = (...args: ArgsType<T>) => {
      this.remove(wrapper as Callback<T, K>);
      return fn.apply(null, args);
    };
    this.on(wrapper as Callback<T, K>);
  }

  remove(fn: Callback<T, K>): void {
    this.listeners.delete(fn);
  }

  removeAll(): void {
    this.listeners.clear();
  }

  emit(...data: ArgsType<T>): any {
    switch (this.strategy) {
      case 'sync':
        return this._emitSync(data);
      case 'async':
        return this._emitAsync(data);
      case 'syncWaterfall':
        return this._emitSyncWaterfall(data[0]);
      case 'asyncWaterfall':
        return this._emitAsyncWaterfall(data[0]);
    }
  }

  private _emitSync(data: ArgsType<T>): void | K {
    let result: void | K = undefined;
    for (const fn of this.listeners) result = fn(...data);
    return result;
  }

  private _emitAsync(data: ArgsType<T>): Promise<void | false | K> {
    const ls = Array.from(this.listeners);
    if (!ls.length) return Promise.resolve(undefined as void | false | K);
    let i = 0;
    const call = (prev?: any): any =>
      prev === false
        ? false
        : i < ls.length
          ? Promise.resolve(ls[i++].apply(null, data)).then(call)
          : prev;
    return Promise.resolve(call());
  }

  private _emitSyncWaterfall(data: any): any {
    if (!isObject(data)) {
      error(`The data for the "${this.type}" hook should be an object.`);
    }
    for (const fn of this.listeners) {
      try {
        const tempData = (fn as any)(data);
        if (checkReturnData(data, tempData)) {
          data = tempData;
        } else {
          this.onerror(
            `A plugin returned an unacceptable value for the "${this.type}" type.`,
          );
          break;
        }
      } catch (e) {
        warn(e);
        this.onerror(e);
      }
    }
    return data;
  }

  private _emitAsyncWaterfall(data: any): Promise<any> {
    if (!isObject(data))
      error(`The response data for the "${this.type}" hook must be an object.`);
    const ls = Array.from(this.listeners);
    if (!ls.length) return Promise.resolve(data);
    let i = 0;
    const onError = (e: any) => {
      warn(e);
      this.onerror(e);
      return data;
    };
    const call = (prevData: any): any => {
      if (checkReturnData(data, prevData)) {
        data = prevData;
        if (i < ls.length) {
          try {
            return Promise.resolve((ls[i++] as any)(data)).then(call, onError);
          } catch (e) {
            return onError(e);
          }
        }
      } else {
        this.onerror(
          `A plugin returned an incorrect value for the "${this.type}" type.`,
        );
      }
      return data;
    };
    return Promise.resolve(call(data));
  }
}

// --- Exported hook subclasses (backward-compatible with `new SyncHook(...)`) ---

export class SyncHook<T, K> extends Hook<T, K> {
  constructor(type?: string) {
    super('sync', type);
  }
  declare emit: (...data: ArgsType<T>) => void | K;
}

export class AsyncHook<
  T,
  K = void | false | Promise<void | false>,
> extends Hook<T, K> {
  constructor(type?: string) {
    super('async', type);
  }
  declare emit: (...data: ArgsType<T>) => Promise<void | false | K>;
}

export class SyncWaterfallHook<T extends Record<string, any>> extends Hook<
  [T],
  T
> {
  constructor(type: string) {
    super('syncWaterfall', type);
  }
  declare emit: (data: T) => T;
}

export class AsyncWaterfallHook<T extends Record<string, any>> extends Hook<
  [T],
  T | Promise<T>
> {
  constructor(type: string) {
    super('asyncWaterfall', type);
  }
  declare emit: (data: T) => Promise<T>;
}

// --- Plugin System ---

export type Plugin<T extends Record<string, any>> = {
  [k in keyof T]?: Parameters<T[k]['on']>[0];
} & {
  name: string;
  version?: string;
  apply?: (instance: ModuleFederation) => void;
};

export class PluginSystem<T extends Record<string, any>> {
  lifecycle: T;
  registerPlugins: Record<string, Plugin<T>> = {};

  constructor(lifecycle: T) {
    this.lifecycle = lifecycle;
  }

  applyPlugin(plugin: Plugin<T>, instance: ModuleFederation): void {
    assert(isPlainObject(plugin), 'Plugin configuration is invalid.');
    assert(plugin.name, 'A name must be provided by the plugin.');
    if (this.registerPlugins[plugin.name]) return;
    this.registerPlugins[plugin.name] = plugin;
    plugin.apply?.(instance);
    for (const key of Object.keys(this.lifecycle)) {
      if (plugin[key as string]) this.lifecycle[key].on(plugin[key as string]);
    }
  }

  removePlugin(pluginName: string): void {
    assert(pluginName, 'A name is required.');
    const plugin = this.registerPlugins[pluginName];
    assert(plugin, `The plugin "${pluginName}" is not registered.`);
    for (const key of Object.keys(plugin)) {
      if (key !== 'name') this.lifecycle[key]?.remove(plugin[key as string]);
    }
  }
}
