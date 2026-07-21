import type {
  ChunkPromise,
  InstalledChunk,
  LynxChunk,
} from './runtimeChunkLoading';
import { loadWithTimeout } from './runtimeTimeout';

export type {
  ChunkPromise,
  InstalledChunk,
  LynxChunk,
} from './runtimeChunkLoading';

type LazyChunkLoadState =
  | { generation: symbol; kind: 'loading'; phase: 'invoking' | 'pending' }
  | {
      chunk: LynxChunk;
      consumes: Promise<void>;
      generation: symbol;
      kind: 'waiting-consumes';
    }
  | { chunk: LynxChunk; generation: symbol; kind: 'installed' }
  | { error: unknown; generation: symbol; kind: 'failed' };

interface LazyChunkLoadControllerArgs {
  chunkKey: string;
  installedChunks: Record<string, InstalledChunk | undefined>;
  timeout: number;
  installChunkAfterConsumes(
    chunk: LynxChunk,
    isCurrent: () => boolean,
  ): Promise<void> | undefined;
  isChunk(value: unknown): value is LynxChunk;
  loadQueryComponent(request: string): PromiseLike<unknown>;
}

const timeoutMessage = (request: string, timeout: number): string =>
  `Timed out loading Lynx lazy bundle "${request}" after ${timeout}ms.`;

export const createLazyChunkLoadController = ({
  chunkKey,
  installedChunks,
  timeout,
  installChunkAfterConsumes,
  isChunk,
  loadQueryComponent,
}: LazyChunkLoadControllerArgs) => {
  const generation = Symbol(chunkKey);
  const loading: Exclude<InstalledChunk, 0> = [undefined, undefined, undefined];
  let state: LazyChunkLoadState = {
    generation,
    kind: 'loading',
    phase: 'invoking',
  };

  const isCurrent = (): boolean =>
    state.generation === generation &&
    state.kind !== 'failed' &&
    installedChunks[chunkKey] === loading;

  const fail = (error: unknown): void => {
    if (state.generation !== generation || state.kind === 'failed') {
      return;
    }
    state = { error, generation, kind: 'failed' };
    if (installedChunks[chunkKey] === loading) {
      delete installedChunks[chunkKey];
    }
  };

  return {
    load(request: string): ChunkPromise {
      installedChunks[chunkKey] = loading;
      let loaded: ChunkPromise;
      try {
        loaded = loadQueryComponent(request).then((value) => {
          if (!isCurrent()) {
            return value;
          }
          try {
            if (!isChunk(value)) {
              throw new Error(
                `Lynx lazy bundle "${request}" did not export a valid webpack chunk.`,
              );
            }
            if (!value.ids.some((id) => String(id) === chunkKey)) {
              throw new Error(
                `Lynx lazy bundle "${request}" did not include requested chunk "${chunkKey}".`,
              );
            }

            const invokedSynchronously =
              state.kind === 'loading' && state.phase === 'invoking';
            const consumes = installChunkAfterConsumes(value, isCurrent);
            if (!consumes) {
              state = { chunk: value, generation, kind: 'installed' };
              return value;
            }

            state = {
              chunk: value,
              consumes,
              generation,
              kind: 'waiting-consumes',
            };
            return invokedSynchronously ? value : consumes.then(() => value);
          } catch (error) {
            fail(error);
            throw error;
          }
        });
      } catch (error) {
        fail(error);
        return Promise.reject(error);
      }

      if (state.kind === 'loading' && state.phase === 'invoking') {
        state = { generation, kind: 'loading', phase: 'pending' };
      }
      const initialState = state;
      const primary =
        initialState.kind === 'installed' || initialState.kind === 'failed'
          ? loaded
          : initialState.kind === 'waiting-consumes'
            ? loadWithTimeout(
                timeout,
                timeoutMessage(request, timeout),
                (resolve, reject) => {
                  initialState.consumes
                    .then(() => initialState.chunk)
                    .then(resolve, reject);
                },
              )
            : loadWithTimeout(
                timeout,
                timeoutMessage(request, timeout),
                (resolve, reject) => {
                  loaded.then(resolve, reject);
                },
              );

      let tracked = primary;
      if (
        initialState.kind !== 'installed' &&
        initialState.kind !== 'failed' &&
        isCurrent()
      ) {
        const installedElsewhere = new Promise<unknown>((resolve, reject) => {
          loading[0] = (value) => {
            if (state.kind !== 'failed') {
              state = {
                chunk: value as LynxChunk,
                generation,
                kind: 'installed',
              };
            }
            resolve(value);
          };
          loading[1] = (error) => {
            fail(error);
            reject(error);
          };
        });
        tracked = Promise.race([primary, installedElsewhere]);
      }

      const promise = tracked.then(
        (value) => value,
        (error) => {
          fail(error);
          throw error;
        },
      );
      loading[2] = promise;
      return promise;
    },
  };
};
