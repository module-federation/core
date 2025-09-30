import type { AsyncLocalStorage } from 'async_hooks';
import { afterTaskAsyncStorageInstance as afterTaskAsyncStorage } from './after-task-async-storage-instance';
import type { WorkUnitStore } from './work-unit-async-storage.external';
export interface AfterTaskStore {
    /** The phase in which the topmost `after` was called.
     *
     * NOTE: Can be undefined when running `generateStaticParams`,
     * where we only have a `workStore`, no `workUnitStore`.
     */
    readonly rootTaskSpawnPhase: WorkUnitStore['phase'] | undefined;
}
export type AfterTaskAsyncStorage = AsyncLocalStorage<AfterTaskStore>;
export { afterTaskAsyncStorage };
