import { CachedRouteMatcherProvider } from "../helpers/cached-route-matcher-provider";
/**
 * This will memoize the matchers when the file contents are the same.
 */ export class FileCacheRouteMatcherProvider extends CachedRouteMatcherProvider {
    constructor(dir, reader){
        super({
            load: async ()=>reader.read(dir),
            compare: (left, right)=>{
                if (left.length !== right.length) return false;
                // Assuming the file traversal order is deterministic...
                for(let i = 0; i < left.length; i++){
                    if (left[i] !== right[i]) return false;
                }
                return true;
            }
        });
    }
}

//# sourceMappingURL=file-cache-route-matcher-provider.js.map