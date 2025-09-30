"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "renderToString", {
    enumerable: true,
    get: function() {
        return renderToString;
    }
});
const _nodewebstreamshelper = require("../stream-utils/node-web-streams-helper");
async function renderToString({ renderToReadableStream, element }) {
    const renderStream = await renderToReadableStream(element);
    await renderStream.allReady;
    return (0, _nodewebstreamshelper.streamToString)(renderStream);
}

//# sourceMappingURL=render-to-string.js.map