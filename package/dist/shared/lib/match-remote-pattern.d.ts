import type { RemotePattern } from './image-config';
export declare function matchRemotePattern(pattern: RemotePattern | URL, url: URL): boolean;
export declare function hasRemoteMatch(domains: string[], remotePatterns: Array<RemotePattern | URL>, url: URL): boolean;
