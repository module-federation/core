'use client';
import { METADATA_BOUNDARY_NAME, VIEWPORT_BOUNDARY_NAME, OUTLET_BOUNDARY_NAME } from '../../../lib/metadata/metadata-constants';
// We use a namespace object to allow us to recover the name of the function
// at runtime even when production bundling/minification is used.
const NameSpace = {
    [METADATA_BOUNDARY_NAME]: function(param) {
        let { children } = param;
        return children;
    },
    [VIEWPORT_BOUNDARY_NAME]: function(param) {
        let { children } = param;
        return children;
    },
    [OUTLET_BOUNDARY_NAME]: function(param) {
        let { children } = param;
        return children;
    }
};
export const MetadataBoundary = // We use slice(0) to trick the bundler into not inlining/minifying the function
// so it retains the name inferred from the namespace object
NameSpace[METADATA_BOUNDARY_NAME.slice(0)];
export const ViewportBoundary = // We use slice(0) to trick the bundler into not inlining/minifying the function
// so it retains the name inferred from the namespace object
NameSpace[VIEWPORT_BOUNDARY_NAME.slice(0)];
export const OutletBoundary = // We use slice(0) to trick the bundler into not inlining/minifying the function
// so it retains the name inferred from the namespace object
NameSpace[OUTLET_BOUNDARY_NAME.slice(0)];

//# sourceMappingURL=metadata-boundary.js.map