import { RSC_PREFETCH_SUFFIX } from '../../../lib/constants';
import { SuffixPathnameNormalizer } from './suffix';
export class PrefetchRSCPathnameNormalizer extends SuffixPathnameNormalizer {
    constructor(){
        super(RSC_PREFETCH_SUFFIX);
    }
    match(pathname) {
        if (pathname === '/__index' + RSC_PREFETCH_SUFFIX) {
            return true;
        }
        return super.match(pathname);
    }
    normalize(pathname, matched) {
        if (pathname === '/__index' + RSC_PREFETCH_SUFFIX) {
            return '/';
        }
        return super.normalize(pathname, matched);
    }
}

//# sourceMappingURL=prefetch-rsc.js.map