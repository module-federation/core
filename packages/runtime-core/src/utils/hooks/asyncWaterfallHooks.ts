import { error, warn } from '../logger';
import { isObject } from '../tool';
import { SyncHook } from './syncHook';
import { checkReturnData } from './syncWaterfallHook';

type CallbackReturnType<T> = T | void | Promise<T | void>;

export class AsyncWaterfallHook<T extends object> extends SyncHook<
  [T],
  CallbackReturnType<T>
> {
  onerror: (errMsg: string | Error | unknown) => void = error;
  constructor(type: string) {
    super();
    this.type = type;
  }

  override emit(data: T): Promise<T> {
    if (!isObject(data)) {
      error(`The response data for the "${this.type}" hook must be an object.`);
    }
    const ls = Array.from(this.listeners);

    if (ls.length > 0) {
      let i = 0;
      const processError = (e: unknown): T => {
        warn(e);
        this.onerror(e);
        return data;
      };

      const call = (prevData?: T | Awaited<T> | void): T | Promise<T> => {
        if (prevData !== undefined && checkReturnData(data, prevData)) {
          data = prevData as T;
        } else if (prevData !== undefined) {
          this.onerror(
            `A plugin returned an incorrect value for the "${this.type}" type.`,
          );
          return data;
        }
        if (i < ls.length) {
          try {
            return Promise.resolve(ls[i++](data)).then(call, processError);
          } catch (e) {
            return processError(e);
          }
        }
        return data;
      };
      return Promise.resolve(call(data));
    }
    return Promise.resolve(data);
  }
}
