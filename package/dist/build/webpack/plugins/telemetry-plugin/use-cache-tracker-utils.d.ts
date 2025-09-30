export type UseCacheTrackerKey = `useCache/${string}`;
export declare const createUseCacheTracker: () => Map<`useCache/${string}`, number>;
/**
 * Example usage:
 *
 * const tracker1 = { 'useCache/file1': 1, 'useCache/file2': 2 };
 * const tracker2 = { 'useCache/file2': 3, 'useCache/file3': 4 };
 * const merged = mergeUseCacheTrackers(tracker1, tracker2);
 *
 * // Result: { 'useCache/file1': 1, 'useCache/file2': 5, 'useCache/file3': 4 }
 */
export declare const mergeUseCacheTrackers: (tracker1: Record<UseCacheTrackerKey, number> | undefined, tracker2: Record<UseCacheTrackerKey, number> | undefined) => Record<UseCacheTrackerKey, number>;
