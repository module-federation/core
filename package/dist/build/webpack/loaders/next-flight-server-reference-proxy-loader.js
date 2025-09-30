"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
// This is a virtual proxy loader that takes a Server Reference ID and a name,
// creates a module that just re-exports the reference as that name.
const flightServerReferenceProxyLoader = function transformSource() {
    const { id, name } = this.getOptions();
    // Both the import and the `createServerReference` call are marked as side
    // effect free:
    // - private-next-rsc-action-client-wrapper is matched as `sideEffects: false` in
    //   the Webpack loader
    // - createServerReference is marked as /*#__PURE__*/
    //
    // Because of that, Webpack is able to concatenate the modules and inline the
    // reference IDs recursively directly into the module that uses them.
    return `\
import { createServerReference, callServer, findSourceMapURL } from 'private-next-rsc-action-client-wrapper'
export ${name === 'default' ? 'default' : `const ${name} =`} /*#__PURE__*/createServerReference(${JSON.stringify(id)}, callServer, undefined, findSourceMapURL, ${JSON.stringify(name)})`;
};
const _default = flightServerReferenceProxyLoader;

//# sourceMappingURL=next-flight-server-reference-proxy-loader.js.map