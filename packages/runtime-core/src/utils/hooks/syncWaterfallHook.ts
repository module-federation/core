import { error, warn } from '../logger';
import { isObject } from '../tool';
import { SyncHook } from './syncHook';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function checkReturnData(originalData: any, returnedData: any): boolean {
  if (!isObject(returnedData)) {
    return false;
  }
  if (originalData !== returnedData) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in originalData) {
      if (!(key in returnedData)) {
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

  override emit(data: T): T {
    if (!isObject(data)) {
      error(`The data for the "${this.type}" hook should be an object.`);
    }
    for (const fn of this.listeners) {
      try {
        const tempData = fn(data);
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
}
