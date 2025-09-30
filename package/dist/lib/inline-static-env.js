"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "inlineStaticEnv", {
    enumerable: true,
    get: function() {
        return inlineStaticEnv;
    }
});
const _fs = /*#__PURE__*/ _interop_require_default(require("fs"));
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _crypto = /*#__PURE__*/ _interop_require_default(require("crypto"));
const _util = require("util");
const _glob = /*#__PURE__*/ _interop_require_default(require("next/dist/compiled/glob"));
const _asyncsema = require("next/dist/compiled/async-sema");
const _staticenv = require("./static-env");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const glob = (0, _util.promisify)(_glob.default);
async function inlineStaticEnv({ distDir, config }) {
    const nextConfigEnv = (0, _staticenv.getNextConfigEnv)(config);
    const staticEnv = (0, _staticenv.getStaticEnv)(config);
    const serverDir = _path.default.join(distDir, 'server');
    const serverChunks = await glob('**/*.{js,json,js.map}', {
        cwd: serverDir
    });
    const clientDir = _path.default.join(distDir, 'static');
    const clientChunks = await glob('**/*.{js,json,js.map}', {
        cwd: clientDir
    });
    const manifestChunks = await glob('*.{js,json,js.map}', {
        cwd: distDir
    });
    const inlineSema = new _asyncsema.Sema(8);
    const nextConfigEnvKeys = Object.keys(nextConfigEnv).map((item)=>item.split('process.env.').pop());
    const builtRegEx = new RegExp(`[\\w]{1,}(\\.env)?\\.(?:NEXT_PUBLIC_[\\w]{1,}${nextConfigEnvKeys.length ? '|' + nextConfigEnvKeys.join('|') : ''})`, 'g');
    const changedClientFiles = [];
    const filesToCheck = new Set(manifestChunks.map((f)=>_path.default.join(distDir, f)));
    for (const [parentDir, files] of [
        [
            serverDir,
            serverChunks
        ],
        [
            clientDir,
            clientChunks
        ]
    ]){
        await Promise.all(files.map(async (file)=>{
            await inlineSema.acquire();
            const filepath = _path.default.join(parentDir, file);
            const content = await _fs.default.promises.readFile(filepath, 'utf8');
            const newContent = content.replace(builtRegEx, (match)=>{
                let normalizedMatch = `process.env.${match.split('.').pop()}`;
                if (staticEnv[normalizedMatch]) {
                    return JSON.stringify(staticEnv[normalizedMatch]);
                }
                return match;
            });
            await _fs.default.promises.writeFile(filepath, newContent);
            if (content !== newContent && parentDir === clientDir) {
                changedClientFiles.push({
                    file,
                    content: newContent
                });
            }
            filesToCheck.add(filepath);
            inlineSema.release();
        }));
    }
    const hashChanges = [];
    // hashes need updating for any changed client files
    for (const { file, content } of changedClientFiles){
        var _file_match;
        // hash is 16 chars currently for all client chunks
        const originalHash = ((_file_match = file.match(/([a-z0-9]{16})\./)) == null ? void 0 : _file_match[1]) || '';
        if (!originalHash) {
            throw Object.defineProperty(new Error(`Invariant: client chunk changed but failed to detect hash ${file}`), "__NEXT_ERROR_CODE", {
                value: "E663",
                enumerable: false,
                configurable: true
            });
        }
        const newHash = _crypto.default.createHash('sha256').update(content).digest('hex').substring(0, 16);
        hashChanges.push({
            originalHash,
            newHash
        });
        const filepath = _path.default.join(clientDir, file);
        const newFilepath = filepath.replace(originalHash, newHash);
        filesToCheck.delete(filepath);
        filesToCheck.add(newFilepath);
        await _fs.default.promises.rename(filepath, newFilepath);
    }
    // update build-manifest and webpack-runtime with new hashes
    for (let file of filesToCheck){
        const content = await _fs.default.promises.readFile(file, 'utf-8');
        let newContent = content;
        for (const { originalHash, newHash } of hashChanges){
            newContent = newContent.replaceAll(originalHash, newHash);
        }
        if (content !== newContent) {
            await _fs.default.promises.writeFile(file, newContent);
        }
    }
}

//# sourceMappingURL=inline-static-env.js.map