import type { PathnameNormalizer } from './pathname-normalizer';
import { SuffixPathnameNormalizer } from './suffix';
export declare class PrefetchRSCPathnameNormalizer extends SuffixPathnameNormalizer implements PathnameNormalizer {
    constructor();
    match(pathname: string): boolean;
    normalize(pathname: string, matched?: boolean): string;
}
