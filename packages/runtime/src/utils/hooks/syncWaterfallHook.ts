import { error, warn } from '../logger';
import { isObject } from '../tool';
import { SyncHook } from './syncHook';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function checkReturnData(originData: any, returnData: any): boolean {
  if (!isObject(returnData)) {
    return false;
  }
  if (originData !== returnData) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in originData) {
      if (!(key in returnData)) {
        return false;
      }
    }
  }
  return true;
}

export class SyncWaterfallHook<T extends Record<string, any>> extends SyncHook<
[T],
T
> {
  onerror: (errMsg: string | Error | unknown) => void = error;

  constructor(type: string) {
    super();
    this.type = type;
  }

  emit(data: T): T {
    if (!isObject(data)) {
      error(`"${this.type}" hook response data must be an object.`);
    }
    for (const fn of this.listeners) {
      try {
        const tempData = fn(data);
        if (checkReturnData(data, tempData)) {
          data = tempData;
        } else {
          this.onerror(
            `The "${this.type}" type has a plugin return value error.`,
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
}
