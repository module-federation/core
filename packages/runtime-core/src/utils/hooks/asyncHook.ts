import { ArgsType, SyncHook } from './syncHook';

type CallbackReturnType = void | false | Promise<void | false>;

export class AsyncHook<
  T,
  ExternalEmitReturnType = CallbackReturnType,
> extends SyncHook<T, ExternalEmitReturnType> {
  override emit(
    ...data: ArgsType<T>
  ): Promise<void | false | ExternalEmitReturnType> {
    let result;
    const ls = Array.from(this.listeners);
    if (ls.length > 0) {
      let i = 0;
      const call = (prev?: unknown): unknown => {
        if (prev === false) {
          return false; // Abort process
        } else if (i < ls.length) {
          return Promise.resolve(ls[i++].apply(null, data)).then((result) => {
            if (result === undefined) {
              return call(prev);
            }
            return call(result);
          });
        } else {
          return prev;
        }
      };
      result = call();
    }
    return Promise.resolve(result) as Promise<
      void | false | ExternalEmitReturnType
    >;
  }
}
