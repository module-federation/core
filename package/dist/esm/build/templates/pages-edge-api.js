import '../../server/web/globals';
import { adapter } from '../../server/web/adapter';
import { IncrementalCache } from '../../server/lib/incremental-cache';
import { wrapApiHandler } from '../../server/api-utils';
// Import the userland code.
import handler from 'VAR_USERLAND';
const page = 'VAR_DEFINITION_PAGE';
if (typeof handler !== 'function') {
    throw Object.defineProperty(new Error(`The Edge Function "pages${page}" must export a \`default\` function`), "__NEXT_ERROR_CODE", {
        value: "E162",
        enumerable: false,
        configurable: true
    });
}
export default function(opts) {
    return adapter({
        ...opts,
        IncrementalCache,
        page: 'VAR_DEFINITION_PATHNAME',
        handler: wrapApiHandler(page, handler)
    });
}

//# sourceMappingURL=pages-edge-api.js.map