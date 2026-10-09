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
  | { kind: 'loading'; phase: 'invoking' | 'pending' }
  | {
      chunk: LynxChunk;
      consumes: Promise<void>;
      kind: 'waiting-consumes';
    }
  | { chunk: LynxChunk; kind: 'installed' }
  | { kind: 'failed' };

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
  const loadTuple: Exclude<InstalledChunk, 0> = [
    undefined,
    undefined,
    undefined,
  ];
  let state: LazyChunkLoadState = {
    kind: 'loading',
    phase: 'invoking',
  };

  const isCurrent = (): boolean =>
    state.kind !== 'failed' && installedChunks[chunkKey] === loadTuple;

  const fail = (): void => {
    if (state.kind === 'failed') {
      return;
    }
    state = { kind: 'failed' };
    if (installedChunks[chunkKey] === loadTuple) {
      delete installedChunks[chunkKey];
    }
  };

  return {
    load(request: string): ChunkPromise {
      installedChunks[chunkKey] = loadTuple;
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
              state = { chunk: value, kind: 'installed' };
              return value;
            }

            state = {
              chunk: value,
              consumes,
              kind: 'waiting-consumes',
            };
            return invokedSynchronously ? value : consumes.then(() => value);
          } catch (error) {
            fail();
            throw error;
          }
        });
      } catch (error) {
        fail();
        return Promise.reject(error);
      }

      if (state.kind === 'loading' && state.phase === 'invoking') {
        state = { kind: 'loading', phase: 'pending' };
      }
      const initialState = state;
      let primary: ChunkPromise;
      if (initialState.kind === 'waiting-consumes') {
        primary = loadWithTimeout(
          timeout,
          timeoutMessage(request, timeout),
          (resolve, reject) => {
            initialState.consumes
              .then(() => initialState.chunk)
              .then(resolve, reject);
          },
        );
      } else if (
        initialState.kind === 'installed' ||
        initialState.kind === 'failed'
      ) {
        primary = loaded;
      } else {
        primary = loadWithTimeout(
          timeout,
          timeoutMessage(request, timeout),
          (resolve, reject) => {
            loaded.then(resolve, reject);
          },
        );
      }

      let tracked = primary;
      if (
        initialState.kind !== 'installed' &&
        initialState.kind !== 'failed' &&
        isCurrent()
      ) {
        const installedElsewhere = new Promise<unknown>((resolve, reject) => {
          loadTuple[0] = (value) => {
            if (state.kind !== 'failed') {
              state = {
                chunk: value as LynxChunk,
                kind: 'installed',
              };
            }
            resolve(value);
          };
          loadTuple[1] = (error) => {
            fail();
            reject(error);
          };
        });
        tracked = Promise.race([primary, installedElsewhere]);
      }

      const promise = tracked.then(
        (value) => value,
        (error) => {
          fail();
          throw error;
        },
      );
      loadTuple[2] = promise;
      return promise;
    },
  };
};
