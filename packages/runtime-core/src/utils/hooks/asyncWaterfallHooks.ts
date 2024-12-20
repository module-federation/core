import { error, warn } from '../logger';
import { isObject } from '../tool';
import { SyncHook } from './syncHook';
import { checkReturnData } from './syncWaterfallHook';

type CallbackReturnType<T> = T | Promise<T>;

export class AsyncWaterfallHook<T extends Record<string, any>> extends SyncHook<
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
      const processError = (e: any) => {
        warn(e);
        this.onerror(e);
        return data;
      };

      const call = (prevData: T): any => {
        if (checkReturnData(data, prevData)) {
          data = prevData as T;
          if (i < ls.length) {
            try {
              return Promise.resolve(ls[i++](data)).then(call, processError);
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
