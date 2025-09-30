"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "startTurboTraceServerCli", {
    enumerable: true,
    get: function() {
        return startTurboTraceServerCli;
    }
});
const _swc = require("../../build/swc");
async function startTurboTraceServerCli(file) {
    let bindings = await (0, _swc.loadBindings)();
    bindings.turbo.startTurbopackTraceServer(file);
}

//# sourceMappingURL=turbo-trace-server.js.map