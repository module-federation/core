export type CacheLife = {
    stale?: number;
    revalidate?: number;
    expire?: number;
};
type CacheLifeProfiles = 'default' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max' | (string & {});
export declare function cacheLife(profile: CacheLifeProfiles | CacheLife): void;
export {};
