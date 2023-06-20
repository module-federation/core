"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, /**
 * Downloads a file from a URL and saves it to disk.
 *
 * @param options Download options.
 */ "default", {
    enumerable: true,
    get: function() {
        return download;
    }
});
const _interop_require_default = require("@swc/helpers/_/_interop_require_default");
const _fs = /*#__PURE__*/ _interop_require_default._(require("fs"));
const _nodefetch = /*#__PURE__*/ _interop_require_default._(require("node-fetch"));
const _path = /*#__PURE__*/ _interop_require_default._(require("path"));
const _util = /*#__PURE__*/ _interop_require_default._(require("util"));
const _stream = require("stream");
const pipelineAsync = _util.default.promisify(_stream.pipeline);
async function download(options) {
    const { url , destination , filename  } = options;
    const response = await (0, _nodefetch.default)(url);
    if (!response.ok) {
        throw new Error(`Error ${response.status}. Failed to fetch types for URL: ${url}`);
    }
    const fileDest = _path.default.normalize(_path.default.join(destination, filename));
    // Create the dir path. This doesn't do anything if dir already exists.
    await _fs.default.promises.mkdir(_path.default.dirname(fileDest), {
        recursive: true
    });
    await pipelineAsync(response.body, _fs.default.createWriteStream(fileDest, {
        flags: 'w'
    }));
}

//# sourceMappingURL=download.js.map