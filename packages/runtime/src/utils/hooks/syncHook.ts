export type Callback<T, K> = (...args: ArgsType<T>) => K;
export type ArgsType<T> = T extends Array<any> ? T : Array<any>;

export class SyncHook<T, K> {
  type = '';
  listeners = new Set<Callback<T, K>>();

  constructor(type?: string) {
    if (type) {
      this.type = type;
    }
  }

  on(fn: Callback<T, K>): void {
    if (typeof fn === 'function') {
      this.listeners.add(fn);
    }
  }

  once(fn: Callback<T, K>): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.on(function wrapper(...args) {
      self.remove(wrapper);
      // eslint-disable-next-line prefer-spread
      return fn.apply(null, args);
    });
  }

  emit(...data: ArgsType<T>): void | K | Promise<any> {
    let result;
    if (this.listeners.size > 0) {
      // eslint-disable-next-line prefer-spread
      this.listeners.forEach((fn) => {
        result = fn(...data);
      });
    }
    return result;
  }

  remove(fn: Callback<T, K>): void {
    this.listeners.delete(fn);
  }

  removeAll(): void {
    this.listeners.clear();
  }
}
