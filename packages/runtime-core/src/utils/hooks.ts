import type { ModuleFederation } from '../core';
import { error, warn } from './logger';
import { isObject, isPlainObject } from './tool';
import { assert } from './logger';

// --- Types ---

export type Callback<T, K> = (...args: ArgsType<T>) => K;
export type ArgsType<T> = T extends Array<any> ? T : Array<any>;

function checkReturnData(originalData: any, returnedData: any): boolean {
  if (!isObject(returnedData)) {
    return false;
  }
  if (originalData !== returnedData) {
    for (const key in originalData) {
      if (!(key in returnedData)) {
        return false;
      }
    }
  }
  return true;
}

// --- Unified Hook class ---

type EmitStrategy = 'sync' | 'async' | 'syncWaterfall' | 'asyncWaterfall';

class Hook<T, K> {
  type = '';
  listeners = new Set<Callback<T, K>>();
  onerror: (errMsg: string | Error | unknown) => void = error;
  protected strategy: EmitStrategy;

  constructor(strategy: EmitStrategy, type?: string) {
    this.strategy = strategy;
    if (type) this.type = type;
  }

  on(fn: Callback<T, K>): void {
    if (typeof fn === 'function') {
      this.listeners.add(fn);
    }
  }

  once(fn: Callback<T, K>): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.on(function wrapper(...args: ArgsType<T>) {
      self.remove(wrapper);
      return fn.apply(null, args);
    });
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
    if (this.listeners.size > 0) {
      this.listeners.forEach((fn) => {
        result = fn(...data);
      });
    }
    return result;
  }

  private _emitAsync(data: ArgsType<T>): Promise<void | false | K> {
    let result;
    const ls = Array.from(this.listeners);
    if (ls.length > 0) {
      let i = 0;
      const call = (prev?: any): any => {
        if (prev === false) {
          return false;
        } else if (i < ls.length) {
          return Promise.resolve(ls[i++].apply(null, data)).then(call);
        } else {
          return prev;
        }
      };
      result = call();
    }
    return Promise.resolve(result);
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
    if (!isObject(data)) {
      error(`The response data for the "${this.type}" hook must be an object.`);
    }
    const ls = Array.from(this.listeners);

    if (ls.length > 0) {
      let i = 0;
      const processError = (e: any) => {
        warn(e);
        this.onerror(e);
        return data;
      };

      const call = (prevData: any): any => {
        if (checkReturnData(data, prevData)) {
          data = prevData;
          if (i < ls.length) {
            try {
              return Promise.resolve((ls[i++] as any)(data)).then(
                call,
                processError,
              );
            } catch (e) {
              return processError(e);
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
    return Promise.resolve(data);
  }
}

// --- Exported hook subclasses (backward-compatible with `new SyncHook(...)`) ---

export class SyncHook<T, K> extends Hook<T, K> {
  constructor(type?: string) {
    super('sync', type);
  }
  override emit(...data: ArgsType<T>): void | K {
    return super.emit(...data);
  }
}

export class AsyncHook<
  T,
  K = void | false | Promise<void | false>,
> extends Hook<T, K> {
  constructor(type?: string) {
    super('async', type);
  }
  override emit(...data: ArgsType<T>): Promise<void | false | K> {
    return super.emit(...data);
  }
}

export class SyncWaterfallHook<T extends Record<string, any>> extends Hook<
  [T],
  T
> {
  constructor(type: string) {
    super('syncWaterfall', type);
  }
  override emit(data: T): T {
    return super.emit(data);
  }
}

export class AsyncWaterfallHook<T extends Record<string, any>> extends Hook<
  [T],
  T | Promise<T>
> {
  constructor(type: string) {
    super('asyncWaterfall', type);
  }
  override emit(data: T): Promise<T> {
    return super.emit(data);
  }
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
  lifecycleKeys: Array<keyof T>;
  registerPlugins: Record<string, Plugin<T>> = {};

  constructor(lifecycle: T) {
    this.lifecycle = lifecycle;
    this.lifecycleKeys = Object.keys(lifecycle);
  }

  applyPlugin(plugin: Plugin<T>, instance: ModuleFederation): void {
    assert(isPlainObject(plugin), 'Plugin configuration is invalid.');
    const pluginName = plugin.name;
    assert(pluginName, 'A name must be provided by the plugin.');

    if (!this.registerPlugins[pluginName]) {
      this.registerPlugins[pluginName] = plugin;
      plugin.apply?.(instance);

      Object.keys(this.lifecycle).forEach((key) => {
        const pluginLife = plugin[key as string];
        if (pluginLife) {
          this.lifecycle[key].on(pluginLife);
        }
      });
    }
  }

  removePlugin(pluginName: string): void {
    assert(pluginName, 'A name is required.');
    const plugin = this.registerPlugins[pluginName];
    assert(plugin, `The plugin "${pluginName}" is not registered.`);

    Object.keys(plugin).forEach((key) => {
      if (key !== 'name') {
        this.lifecycle[key].remove(plugin[key as string]);
      }
    });
  }
}
