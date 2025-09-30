import type { Timestamp } from '../cache-handlers/types';
export declare const tagsManifest: Map<string, number>;
export declare const isStale: (tags: string[], timestamp: Timestamp) => boolean;
